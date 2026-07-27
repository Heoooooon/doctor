import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

interface SectionSetting {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

const localPath = path.join(process.cwd(), 'data', 'local-section-settings.json')

async function readLocal(): Promise<SectionSetting[]> {
  try {
    return JSON.parse(await readFile(localPath, 'utf8')) as SectionSetting[]
  } catch {
    return []
  }
}

async function writeLocal(items: SectionSetting[]) {
  await mkdir(path.dirname(localPath), { recursive: true })
  await writeFile(localPath, JSON.stringify(items, null, 2), 'utf8')
}

// GET: 특정 섹션 설정 조회 (공개)
export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (!key) {
      return NextResponse.json({ error: 'key 파라미터가 필요합니다.' }, { status: 400 })
    }

    if (!hasSupabaseConfig()) {
      const items = await readLocal()
      const item = items.find((i) => i.key === key)
      return NextResponse.json(item ?? { key, value: {} })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('section_settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) {
      // 행이 없으면 빈 값 반환 (초기 상태)
      return NextResponse.json({ key, value: {} })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '요청을 처리할 수 없습니다.' }, { status: 500 })
  }
}

// PUT: 섹션 설정 저장 (인증 필요, upsert)
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    if (!key || typeof key !== 'string' || !key.trim()) {
      return NextResponse.json({ error: 'key가 필요합니다.' }, { status: 400 })
    }
    if (!value || typeof value !== 'object') {
      return NextResponse.json({ error: 'value가 필요합니다.' }, { status: 400 })
    }

    if (!hasSupabaseConfig()) {
      const items = await readLocal()
      const now = new Date().toISOString()
      const existing = items.find((i) => i.key === key)
      if (existing) {
        existing.value = value
        existing.updated_at = now
      } else {
        items.push({ key, value, updated_at: now })
      }
      await writeLocal(items)
      return NextResponse.json({ key, value, updated_at: now })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('section_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' },
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '요청을 처리할 수 없습니다.' }, { status: 500 })
  }
}
