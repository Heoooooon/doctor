import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

type RouteContext = { params: Promise<{ id: string }> }

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

// PATCH: 공지 수정 (인증 필요)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    const fields = ['title', 'content', 'image_url', 'notice_date', 'is_active']
    for (const field of fields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '수정할 항목이 없습니다.' },
        { status: 400 },
      )
    }

    updates.updated_at = new Date().toISOString()

    if (!hasSupabaseConfig()) {
      const notices = await readLocalNotices()
      const index = notices.findIndex((item) => item.id === id)

      if (index === -1) {
        return NextResponse.json(
          { error: '공지사항을 찾을 수 없습니다.' },
          { status: 404 },
        )
      }

      notices[index] = { ...notices[index], ...updates }
      await writeLocalNotices(notices)
      return NextResponse.json(notices[index])
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('notices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

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

// DELETE: 공지 삭제 (인증 필요)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = await context.params

    if (!hasSupabaseConfig()) {
      const notices = await readLocalNotices()
      await writeLocalNotices(notices.filter((item) => item.id !== id))
      return NextResponse.json({ success: true })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from('notices').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}
