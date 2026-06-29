import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

interface Notice {
  id: string
  title: string
  content: string | null
  image_url: string | null
  notice_date: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

const localNoticePath = path.join(process.cwd(), 'data', 'local-notices.json')

async function readLocalNotices(): Promise<Notice[]> {
  try {
    return JSON.parse(await readFile(localNoticePath, 'utf8')) as Notice[]
  } catch {
    return []
  }
}

async function writeLocalNotices(notices: Notice[]) {
  await mkdir(path.dirname(localNoticePath), { recursive: true })
  await writeFile(localNoticePath, JSON.stringify(notices, null, 2), 'utf8')
}

// GET: 활성 공지 목록 (공개)
export async function GET(request: NextRequest) {
  try {
    const includeAll = request.nextUrl.searchParams.get('all') === '1'

    if (!hasSupabaseConfig()) {
      const localNotices = await readLocalNotices()
      return NextResponse.json(
        includeAll ? localNotices : localNotices.filter((item) => item.is_active),
      )
    }

    const supabase = createAdminClient()

    const query = supabase
      .from('notices')
      .select('*')
      .order('notice_date', { ascending: false })

    if (!includeAll) {
      query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}

// POST: 공지 추가 (인증 필요)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, image_url, notice_date, is_active } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
    }

    if (!hasSupabaseConfig()) {
      const notices = await readLocalNotices()
      const now = new Date().toISOString()
      const notice: Notice = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        content: content?.trim() || null,
        image_url: image_url || null,
        notice_date: notice_date || now.split('T')[0],
        is_active: is_active !== undefined ? is_active : true,
        created_at: now,
      }

      const nextNotices = [notice, ...notices].sort((a, b) =>
        b.notice_date.localeCompare(a.notice_date),
      )
      await writeLocalNotices(nextNotices)
      return NextResponse.json(notice, { status: 201 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('notices')
      .insert({
        title: title.trim(),
        content: content?.trim() || null,
        image_url: image_url || null,
        notice_date: notice_date || new Date().toISOString().split('T')[0],
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}
