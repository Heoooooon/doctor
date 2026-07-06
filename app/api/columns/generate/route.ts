import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { generateColumnWithOpenAI } from '@/lib/column-ai'

// AI 변환이 30~40초 이상 걸려도 잘리지 않도록 실행시간 상한 확장
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { notes } = await request.json()
    if (!notes || typeof notes !== 'string' || !notes.trim()) {
      return NextResponse.json({ error: '변환할 글 내용을 입력해주세요.' }, { status: 400 })
    }

    const result = await generateColumnWithOpenAI(notes)
    return NextResponse.json(result)
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

    if (err instanceof Error && err.message === 'OPENAI_EMPTY_RESULT') {
      return NextResponse.json({ error: 'AI 변환 결과가 비어 있습니다.' }, { status: 502 })
    }

    console.error('AI 변환 오류:', err)
    return NextResponse.json({ error: 'AI 변환 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
