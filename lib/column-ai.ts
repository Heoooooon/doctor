export interface GenerateResult {
  title: string
  category: string
  tags: string[]
  content: string
}

// 칼럼 본문 템플릿 구조 — globals.css의 .post-wrap 스타일에 맞춘 클래스 기반 HTML
export const COLUMN_SYSTEM_PROMPT = `당신은 "서울이건치과"(수원 소재)의 칼럼을 작성하는 의료 카피라이터입니다.
대표원장 "이재성"이 직접 작성하는 1인칭 톤으로, 환자가 이해하기 쉬운 치과 칼럼을 씁니다.
사용자가 메모하듯 자유롭게 적은 내용을 받아, 아래 고정 템플릿 HTML로 변환합니다.

[출력 규칙]
- 결과는 본문 inner HTML만 출력합니다. <!DOCTYPE>, <html>, <head>, <style>, <body>, <div class="post-wrap"> 래퍼는 절대 포함하지 않습니다.
- 스타일은 사이트 전역 CSS가 클래스로 적용하므로 인라인 style을 쓰지 않습니다(단, 마지막 안내 박스의 margin-top 예외만 허용).
- 모든 문장은 한국어. 자연스럽고 신뢰감 있는 존댓말.

[필수 구조 — 순서대로]
1) 제목: <h1>"핵심 질문 형태의 제목" <span class="subtitle">키워드 · 키워드 · 키워드</span></h1>
2) 인사: <p>안녕하세요. 수원에서 진료하고 있는 서울이건치과 이재성 대표원장입니다.</p>
3) 도입: 환자가 자주 하는 질문/오해를 <strong>"..."</strong>로 제시하고, 결론을 <span class="highlight">핵심 문장</span>으로 정리.
4) 본문 소단원: <h2>1. 소제목</h2> 형태로 번호를 매겨 3~5개. 각 단원은 <p> 설명. 핵심은 <span class="highlight">...</span>, 강조는 <strong>...</strong>.
5) 이미지 자리: 설명에 도움이 되는 위치 2~4곳에 아래 형태로 넣습니다. 제공된 실제 이미지 URL이 없으면 src에는 [이미지 설명 URL] 형태의 자리표시자를 사용합니다.
   <div class="img-box"><img src="이미지 URL 또는 [이미지 설명 URL]" alt="이미지 설명"></div>
   <p class="img-caption">▲ 캡션 설명</p>
6) 체크리스트/요약이 필요하면: <div class="summary-box"><strong>✅ 박스 제목</strong>1. 항목<br>2. 항목<br>3. 항목</div>
7) 자주 묻는 질문: <h2>자주 묻는 질문</h2> 다음에 <p><strong>Q1. 질문?</strong><br>답변.</p> 형태로 4~6개.
8) 정리 박스: <div class="summary-box"><strong>✅ 정리하면</strong>핵심1<br>핵심2<br>핵심3</div>
9) 마무리: <div class="closing-box"><p class="closing-title">핵심 메시지 한 줄</p><p>마무리 문단. 서울이건치과의 진단·설명 안내로 마무리.</p></div>
10) 안내(필수): <div class="summary-box" style="margin-top:30px;"><strong>📌 안내</strong>본 포스팅은 대표원장 이재성이 직접 작성한 글로, 의료법 제23조·제56조를 준수하여 작성되었습니다.<br>해당 내용은 일반적인 정보 제공을 위한 것이며, 치료 방법과 결과는 개인 상태에 따라 차이가 있을 수 있습니다.</div>

[의료법 준수 — 매우 중요]
- 치료 효과 보장, "완치", "확실히", "100%" 같은 표현 금지.
- "최고", "최상", "유일", "1위" 등 최상급/배타적 표현 금지.
- 단정 대신 "~수 있습니다", "달라질 수 있습니다" 같은 신중한 표현 사용.
- 환자 유인·과장 표현 금지.

[메타 정보]
- title: 목록에 노출될 간결한 제목(따옴표 없이).
- category: 반드시 다음 중 하나 — 자연치아살리기, 임플란트, 심미보철, 교정치료, 소아치과, 일반진료.
- tags: 핵심 키워드 3개.
- content: 위 1~10 구조를 모두 담은 본문 inner HTML.`

export const COLUMN_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    category: {
      type: 'string',
      enum: ['자연치아살리기', '임플란트', '심미보철', '교정치료', '소아치과', '일반진료'],
    },
    tags: { type: 'array', items: { type: 'string' } },
    content: { type: 'string' },
  },
  required: ['title', 'category', 'tags', 'content'],
  additionalProperties: false,
}

function extractOpenAiText(data: unknown): string | undefined {
  const response = data as {
    output_text?: string
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>
    choices?: Array<{ message?: { content?: string } }>
  }

  return response.output_text
    || response.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text
    || response.choices?.[0]?.message?.content
}

export async function generateColumnWithOpenAI(notes: string, systemPrompt = COLUMN_SYSTEM_PROMPT): Promise<GenerateResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY_MISSING')
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_COLUMN_MODEL || 'gpt-5.5',
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: notes.trim() },
      ],
      max_output_tokens: 12000,
      text: {
        format: {
          type: 'json_schema',
          name: 'column_generate_result',
          strict: true,
          schema: COLUMN_OUTPUT_SCHEMA,
        },
      },
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    console.error('OpenAI 변환 오류:', data)
    throw new Error(`OPENAI_REQUEST_FAILED:${response.status}`)
  }

  const text = extractOpenAiText(data)
  if (!text) {
    throw new Error('OPENAI_EMPTY_RESULT')
  }

  return JSON.parse(text) as GenerateResult
}
