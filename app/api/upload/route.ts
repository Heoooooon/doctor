import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const BUCKET = 'images'

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'general'

    if (!file) {
      return NextResponse.json({ error: '파일을 선택해주세요.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 },
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '허용되지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)' },
        { status: 400 },
      )
    }

    // 안전한 폴더 이름 검증
    const allowedFolders = ['cases', 'notices', 'clinic', 'columns', 'popups', 'general']
    const safeFolder = allowedFolders.includes(folder) ? folder : 'general'

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const storagePath = `${safeFolder}/${fileName}`

    const supabase = createAdminClient()
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      console.error('storage upload error:', uploadError)
      return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 })
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

    return NextResponse.json({ url: data.publicUrl, path: storagePath }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: '파일 업로드에 실패했습니다.' },
      { status: 500 },
    )
  }
}
