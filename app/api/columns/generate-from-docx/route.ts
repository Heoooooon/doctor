import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import * as mammoth from 'mammoth'
import JSZip from 'jszip'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { COLUMN_SYSTEM_PROMPT, generateColumnWithOpenAI } from '@/lib/column-ai'
import { createAdminClient } from '@/lib/supabase/server'

const MAX_DOCX_SIZE = 30 * 1024 * 1024 // 30MB
const BUCKET = 'images'

interface ExtractedImage {
  url: string
  path: string
  name: string
  contentType: string
}

function extensionFromContentType(contentType: string): string {
  switch (contentType) {
    case 'image/png': return 'png'
    case 'image/webp': return 'webp'
    case 'image/gif': return 'gif'
    case 'image/bmp': return 'bmp'
    case 'image/tiff': return 'tiff'
    case 'image/jpeg':
    default:
      return 'jpg'
  }
}

function contentTypeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png': return 'image/png'
    case 'webp': return 'image/webp'
    case 'gif': return 'image/gif'
    case 'bmp': return 'image/bmp'
    case 'tif':
    case 'tiff': return 'image/tiff'
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg'
  }
}

function stripDangerousHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim()
}

function removeUnuploadedImageBlocks(html: string, allowedImageUrls: string[]): string {
  const allowed = new Set(allowedImageUrls)

  return html.replace(
    /<div[^>]*class=["'][^"']*\bimg-box\b[^"']*["'][^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/div>\s*(?:<p[^>]*class=["'][^"']*\bimg-caption\b[^"']*["'][^>]*>[\s\S]*?<\/p>)?/gi,
    (match, src: string) => allowed.has(src) ? match : '',
  )
}

async function uploadDocxImage(buffer: Buffer, contentType: string, index: number): Promise<ExtractedImage> {
  const supabase = createAdminClient()
  const ext = extensionFromContentType(contentType)
  const name = `word-image-${String(index).padStart(2, '0')}.${ext}`
  const storagePath = `columns/docx-${Date.now()}-${randomUUID().slice(0, 8)}-${name}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) {
    console.error('DOCX 이미지 업로드 오류:', error)
    throw new Error('IMAGE_UPLOAD_FAILED')
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return { url: data.publicUrl, path: storagePath, name, contentType }
}

async function uploadImagesFromDocxZip(docxBuffer: Buffer, startIndex: number): Promise<ExtractedImage[]> {
  const zip = await JSZip.loadAsync(docxBuffer)
  const mediaFiles = Object.values(zip.files)
    .map((entry) => entry as JSZip.JSZipObject)
    .filter((entry) => !entry.dir && /^word\/media\//i.test(entry.name) && /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  const uploaded: ExtractedImage[] = []
  for (const entry of mediaFiles) {
    const buffer = await entry.async('nodebuffer')
    const contentType = contentTypeFromPath(entry.name)
    uploaded.push(await uploadDocxImage(buffer, contentType, startIndex + uploaded.length))
  }
  return uploaded
}

const DOCX_SYSTEM_PROMPT = `${COLUMN_SYSTEM_PROMPT}

[Word 문서 이미지 처리 규칙]
- 사용자는 Word(.docx) 파일을 제공했고, 문서 안의 이미지는 이미 업로드된 실제 URL로 변환되어 입력됩니다.
- 입력 HTML에 <img src="...">가 있으면 해당 src URL을 그대로 사용합니다. 절대 새 이미지 URL을 지어내지 않습니다.
- 성공적으로 업로드된 이미지 URL만 사용합니다. 이미지 URL이 없거나 깨진 그림 아이콘/빈 이미지/자리표시자처럼 보이는 부분은 본문에서 완전히 제외합니다.
- 이미지가 충분히 있으면 자리표시자([이미지 설명 URL])를 만들지 말고, 제공된 이미지를 본문 흐름에 맞게 배치합니다. 제공된 이미지가 1개면 1개만 사용합니다.
- 각 이미지는 반드시 <div class="img-box"><img src="제공된 URL" alt="내용 설명"></div>와 <p class="img-caption">▲ 캡션</p> 구조로 감쌉니다.
- Word 문서에 이미지 바로 앞뒤 캡션/설명 문장이 있으면 이를 우선 활용합니다.
- 구강 사진·치료 사진은 과장 설명 없이 상태 설명 중심으로 캡션을 작성합니다.
- 이미지가 하나도 없을 때만 기존 규칙대로 자리표시자를 넣을 수 있습니다.`

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Word 파일을 선택해주세요.' }, { status: 400 })
    }

    const isDocx = file.name.toLowerCase().endsWith('.docx')
      || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (!isDocx) {
      return NextResponse.json({ error: '.docx Word 파일만 업로드할 수 있습니다.' }, { status: 400 })
    }

    if (file.size > MAX_DOCX_SIZE) {
      return NextResponse.json({ error: 'Word 파일 크기는 30MB 이하여야 합니다.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const docxBuffer = Buffer.from(arrayBuffer)
    const images: ExtractedImage[] = []

    const converted = await mammoth.convertToHtml(
      { buffer: docxBuffer },
      {
        convertImage: mammoth.images.imgElement(async (image) => {
          const buffer = await image.readAsBuffer()
          const uploaded = await uploadDocxImage(buffer, image.contentType, images.length + 1)
          images.push(uploaded)
          return { src: uploaded.url }
        }),
      },
    )

    // 일부 Word 파일은 이미지가 floating/shape 형식이면 mammoth HTML 변환에서 누락될 수 있어
    // .docx 내부 word/media/* 파일을 직접 읽어 한 번 더 업로드한다.
    if (images.length === 0) {
      images.push(...await uploadImagesFromDocxZip(docxBuffer, 1))
    }

    const extractedHtml = stripDangerousHtml(converted.value)
    const extractedText = (await mammoth.extractRawText({ buffer: docxBuffer })).value.trim()

    if (!extractedHtml && !extractedText && images.length === 0) {
      return NextResponse.json({ error: 'Word 파일에서 변환할 내용을 찾지 못했습니다.' }, { status: 422 })
    }

    const imageList = images.map((img, i) => `${i + 1}. ${img.name}: ${img.url}`).join('\n')
    const notes = [
      `파일명: ${file.name}`,
      imageList ? `[업로드된 이미지 URL]\n${imageList}` : '[업로드된 이미지 URL]\n없음',
      '[Word에서 추출한 HTML — 이미지 순서와 주변 문장을 참고하세요]',
      extractedHtml || extractedText,
    ].join('\n\n')

    const result = await generateColumnWithOpenAI(notes, DOCX_SYSTEM_PROMPT)
    const sanitizedContent = removeUnuploadedImageBlocks(result.content, images.map((img) => img.url))

    return NextResponse.json({
      ...result,
      content: sanitizedContent,
      images,
      warnings: converted.messages.map((m) => m.message),
    })
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
      return NextResponse.json({ error: 'Word 파일의 이미지를 업로드하지 못했습니다.' }, { status: 500 })
    }

    if (err instanceof Error && err.message === 'OPENAI_EMPTY_RESULT') {
      return NextResponse.json({ error: 'AI 변환 결과가 비어 있습니다.' }, { status: 502 })
    }

    console.error('Word 칼럼 변환 오류:', err)
    return NextResponse.json({ error: 'Word 파일 변환 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
