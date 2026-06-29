import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { COLUMN_SYSTEM_PROMPT, generateColumnWithOpenAI } from '@/lib/column-ai'
import { createAdminClient } from '@/lib/supabase/server'
import { hasSupabaseConfig } from '@/lib/supabase/config'

export const runtime = 'nodejs'

const BUCKET = 'images'
const MAX_IMAGES = 12

// 모바일 UA — 네이버 블로그 본문은 m.blog.naver.com에서 iframe 없이 바로 렌더됨
const UA =
  'Mozilla/5.0 (Linux; Android 13; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

interface UploadedImage {
  url: string
  path: string
  name: string
  contentType: string
}

// blog.naver.com/{id}/{logNo}, PostView.naver?blogId=&logNo=, m.blog.naver.com/... 모두 처리
function parseBlogParts(raw: string): { blogId: string; logNo: string } | null {
  try {
    const u = new URL(raw)
    const qBlogId = u.searchParams.get('blogId')
    const qLogNo = u.searchParams.get('logNo')
    if (qBlogId && qLogNo) return { blogId: qBlogId, logNo: qLogNo }

    const segs = u.pathname.split('/').filter(Boolean)
    if (segs.length >= 2 && /^\d+$/.test(segs[1])) {
      return { blogId: segs[0], logNo: segs[1] }
    }
  } catch {
    // ignore
  }
  return null
}

// naver.me 단축 링크는 리다이렉트를 따라가 실제 주소를 얻음
async function resolveUrl(raw: string): Promise<string> {
  if (/naver\.me\//i.test(raw)) {
    const res = await fetch(raw, { redirect: 'follow', headers: { 'User-Agent': UA } })
    return res.url || raw
  }
  return raw
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/​/g, '')
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
}

function extractTitle(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i)
  if (og) return decodeEntities(og[1]).trim()
  const t = html.match(/<title>([^<]*)<\/title>/i)
  return t ? decodeEntities(t[1]).replace(/\s*:\s*네이버\s*블로그.*$/i, '').trim() : ''
}

// 콘텐츠 이미지의 원본 주소 — 본문 사진은 data-lazy-src(고화질)에 있고 src는 흐린 썸네일
function contentImageUrl(imgTag: string): string | null {
  const lazy = imgTag.match(/data-lazy-src=["']([^"']+)["']/i)?.[1]
  if (!lazy) return null // 프로필·스티커·UI 이미지는 lazy 로딩이 아니므로 제외
  if (!/pstatic\.net|blogfiles|postfiles/i.test(lazy)) return null
  if (/blogpfthumb/i.test(lazy)) return null // 프로필 썸네일 제외
  // 썸네일 사이즈 파라미터를 큰 사이즈로 교체
  const base = lazy.replace(/[?&]type=[^&"']*/i, '')
  return `${base}${base.includes('?') ? '&' : '?'}type=w966`
}

function extFromContentType(contentType: string): string {
  switch (contentType) {
    case 'image/png': return 'png'
    case 'image/webp': return 'webp'
    case 'image/gif': return 'gif'
    case 'image/bmp': return 'bmp'
    default: return 'jpg'
  }
}

type Part = { type: 'text'; value: string } | { type: 'image'; url: string }

// 본문을 텍스트 문단과 콘텐츠 이미지가 등장 순서대로 섞인 배열로 추출
function extractParts(html: string, title: string): Part[] {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  const partRe = /<p[^>]*class="[^"]*se-text-paragraph[^"]*"[^>]*>([\s\S]*?)<\/p>|<img\b[^>]*>/gi
  const parts: Part[] = []
  const seenImg = new Set<string>()
  let first = true
  let m: RegExpExecArray | null

  while ((m = partRe.exec(cleaned)) !== null) {
    if (m[1] !== undefined) {
      const text = stripTags(m[1]).replace(/[ \t]+/g, ' ').trim()
      if (!text) continue
      // 제목 모듈이 본문 첫 줄로 중복되면 제거
      if (first && title && text.replace(/\s/g, '') === title.replace(/\s/g, '')) {
        first = false
        continue
      }
      first = false
      parts.push({ type: 'text', value: text })
    } else {
      const url = contentImageUrl(m[0])
      if (!url || seenImg.has(url) || seenImg.size >= MAX_IMAGES) continue
      seenImg.add(url)
      parts.push({ type: 'image', url })
    }
  }
  return parts
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Referer: 'https://blog.naver.com/' },
    })
    if (!res.ok) return null
    const contentType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0].trim()
    if (!/^image\//i.test(contentType)) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length < 2048) return null // 흐린 썸네일/깨진 이미지 방지
    return { buffer, contentType }
  } catch {
    return null
  }
}

async function uploadImage(buffer: Buffer, contentType: string, index: number): Promise<UploadedImage> {
  const supabase = createAdminClient()
  const ext = extFromContentType(contentType)
  const name = `naver-image-${String(index).padStart(2, '0')}.${ext}`
  const storagePath = `columns/naver-${Date.now()}-${randomUUID().slice(0, 8)}-${name}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, cacheControl: '31536000', upsert: false })

  if (error) {
    console.error('네이버 이미지 업로드 오류:', error)
    throw new Error('IMAGE_UPLOAD_FAILED')
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return { url: data.publicUrl, path: storagePath, name, contentType }
}

// 업로드되지 않은 이미지(자리표시자 등)를 참조하는 img-box 블록을 본문에서 제거
function removeUnuploadedImageBlocks(html: string, allowedImageUrls: string[]): string {
  const allowed = new Set(allowedImageUrls)
  return html.replace(
    /<div[^>]*class=["'][^"']*\bimg-box\b[^"']*["'][^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/div>\s*(?:<p[^>]*class=["'][^"']*\bimg-caption\b[^"']*["'][^>]*>[\s\S]*?<\/p>)?/gi,
    (match, src: string) => (allowed.has(src) ? match : ''),
  )
}

const NAVER_SYSTEM_PROMPT = `${COLUMN_SYSTEM_PROMPT}

[네이버 블로그 이미지 처리 규칙]
- 입력 본문에는 네이버 블로그에서 가져온 글과, 이미 우리 저장소에 업로드된 실제 이미지 URL이 <img src="..."> 형태로 등장 순서대로 들어 있습니다.
- 입력에 있는 <img src="..."> URL만 그대로 사용합니다. 절대 새 이미지 URL을 지어내지 않습니다.
- 제공된 이미지가 있으면 자리표시자([이미지 설명 URL])를 만들지 말고, 원래 글에서의 위치와 주변 문장을 참고해 본문 흐름에 맞게 배치합니다.
- 각 이미지는 <div class="img-box"><img src="제공된 URL" alt="내용 설명"></div>와 <p class="img-caption">▲ 캡션</p> 구조로 감쌉니다.
- 구강·치료 사진은 과장 없이 상태 설명 중심으로 캡션을 작성합니다.
- 제공된 이미지가 하나도 없을 때만 기존 규칙대로 자리표시자를 사용할 수 있습니다.`

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { url } = await request.json()
    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: '블로그 글 주소(URL)를 입력해주세요.' }, { status: 400 })
    }
    if (!/naver\./i.test(url)) {
      return NextResponse.json({ error: '네이버 블로그 주소만 불러올 수 있습니다.' }, { status: 400 })
    }

    const resolved = await resolveUrl(url.trim())
    const parts = parseBlogParts(resolved)
    if (!parts) {
      return NextResponse.json(
        { error: '블로그 글 주소를 인식하지 못했습니다. blog.naver.com 글 주소를 확인해주세요.' },
        { status: 400 },
      )
    }

    const mobileUrl = `https://m.blog.naver.com/${parts.blogId}/${parts.logNo}`
    const res = await fetch(mobileUrl, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9' },
    })
    if (!res.ok) {
      return NextResponse.json({ error: `블로그 글을 불러오지 못했습니다. (${res.status})` }, { status: 502 })
    }

    const html = await res.text()
    const title = extractTitle(html)
    const docParts = extractParts(html, title)

    const textLen = docParts
      .filter((p): p is { type: 'text'; value: string } => p.type === 'text')
      .reduce((n, p) => n + p.value.replace(/\s/g, '').length, 0)
    if (textLen < 20) {
      return NextResponse.json(
        { error: '본문을 추출하지 못했습니다. 비공개 글이거나 형식이 지원되지 않을 수 있습니다.' },
        { status: 422 },
      )
    }

    // 콘텐츠 이미지를 우리 저장소에 다운로드 → 재업로드 (Supabase 설정 시에만)
    const uploadedByUrl = new Map<string, UploadedImage>()
    const images: UploadedImage[] = []
    if (hasSupabaseConfig()) {
      const imageUrls = docParts.filter((p) => p.type === 'image').map((p) => (p as { url: string }).url)
      for (const imgUrl of imageUrls) {
        const dl = await downloadImage(imgUrl)
        if (!dl) continue
        const uploaded = await uploadImage(dl.buffer, dl.contentType, images.length + 1)
        images.push(uploaded)
        uploadedByUrl.set(imgUrl, uploaded)
      }
    }

    // 텍스트와 업로드된 이미지를 등장 순서대로 합쳐 AI 입력 생성
    const lines: string[] = []
    for (const p of docParts) {
      if (p.type === 'text') {
        lines.push(p.value)
      } else {
        const up = uploadedByUrl.get(p.url)
        if (up) lines.push(`<img src="${up.url}" alt="">`)
      }
    }

    const imageList = images.map((img, i) => `${i + 1}. ${img.url}`).join('\n')
    const notes = [
      `[블로그 출처] ${mobileUrl}`,
      imageList ? `[업로드된 이미지 URL]\n${imageList}` : '[업로드된 이미지 URL]\n없음',
      '[블로그 본문 — 이미지 위치와 주변 문장을 참고하세요]',
      lines.join('\n'),
    ].join('\n\n')

    const result = await generateColumnWithOpenAI(notes, NAVER_SYSTEM_PROMPT)
    const sanitizedContent = removeUnuploadedImageBlocks(result.content, images.map((img) => img.url))

    return NextResponse.json({ ...result, content: sanitizedContent, images, sourceUrl: mobileUrl })
  } catch (err) {
    if (err instanceof Error && err.message === 'OPENAI_API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'AI 변환이 설정되지 않았습니다. 서버에 OPENAI_API_KEY를 추가해주세요.' },
        { status: 503 },
      )
    }
    if (err instanceof Error && err.message.startsWith('OPENAI_REQUEST_FAILED')) {
      const status = Number(err.message.split(':')[1]) || 500
      return NextResponse.json({ error: 'AI가 요청을 처리할 수 없습니다. OpenAI 설정 또는 요청 내용을 확인해주세요.' }, { status })
    }
    if (err instanceof Error && err.message === 'IMAGE_UPLOAD_FAILED') {
      return NextResponse.json({ error: '블로그 이미지를 업로드하지 못했습니다.' }, { status: 500 })
    }
    if (err instanceof Error && err.message === 'OPENAI_EMPTY_RESULT') {
      return NextResponse.json({ error: 'AI 변환 결과가 비어 있습니다.' }, { status: 502 })
    }

    console.error('네이버 블로그 불러오기 오류:', err)
    return NextResponse.json({ error: '블로그 글을 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
