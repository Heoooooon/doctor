import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

type RouteContext = { params: Promise<{ id: string }> }

interface Column {
  id: string
  title: string
  content: string | null
  image_url: string | null
  column_date: string
  category: string | null
  tags: string[] | null
  is_active: boolean
  created_at: string
  updated_at?: string
}

const localPath = path.join(process.cwd(), 'data', 'local-columns.json')

async function readLocal(): Promise<Column[]> {
  try {
    return JSON.parse(await readFile(localPath, 'utf8')) as Column[]
  } catch {
    return []
  }
}

async function writeLocal(columns: Column[]) {
  await mkdir(path.dirname(localPath), { recursive: true })
  await writeFile(localPath, JSON.stringify(columns, null, 2), 'utf8')
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    const fields = ['title', 'content', 'image_url', 'column_date', 'category', 'tags', 'is_active']
    for (const field of fields) {
      if (body[field] !== undefined) updates[field] = body[field]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: '수정할 항목이 없습니다.' }, { status: 400 })
    }

    if (!hasSupabaseConfig()) {
      const columns = await readLocal()
      const index = columns.findIndex((c) => c.id === id)
      if (index === -1) return NextResponse.json({ error: '칼럼을 찾을 수 없습니다.' }, { status: 404 })
      columns[index] = { ...columns[index], ...updates }
      await writeLocal(columns)
      return NextResponse.json(columns[index])
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.from('columns').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '요청을 처리할 수 없습니다.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = await context.params

    if (!hasSupabaseConfig()) {
      const columns = await readLocal()
      await writeLocal(columns.filter((c) => c.id !== id))
      return NextResponse.json({ success: true })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('columns').delete().eq('id', id)
    if (error) return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '요청을 처리할 수 없습니다.' }, { status: 500 })
  }
}
