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

[필수 구조 — 순서대로, 아래 HTML 형태를 그대로 사용]
1) 제목: <h1>핵심 질문 형태의 제목 <span class="subtitle">키워드 · 키워드 · 키워드</span></h1>
2) 대표 이미지(제공된 이미지가 있을 때만): <div class="img-box"><img src="이미지 URL" alt="이미지 설명"></div> 다음 줄에 <p class="img-caption">▲ 캡션</p>. 제공 이미지가 없으면 이 대표 이미지 블록은 통째로 생략합니다.
3) 도입부(고정 첫 문장 필수): <p>안녕하세요. 수원에서 진료하고 있는 서울이건치과 이재성 대표원장입니다.</p> 이어서 <p>도입 문단<br><strong>"환자가 흔히 하는 질문"</strong></p> 이어서 <p>결론부터 말씀드리면, <span class="highlight">핵심 결론 한 문장</span> 도입 마무리.</p>
4) 본문 소단원(반복): 원문의 소제목·문단 묶음마다 하나의 섹션을 만듭니다. 형태는 <h2>1. 소제목</h2> 다음에 <p>설명 문단</p>. 각 <h2>에는 1., 2., 3. … 번호를 붙입니다. 원문 구성에 맞추되 최소 3개 이상 만듭니다. 핵심은 <span class="highlight">...</span>, 소제목성 강조는 <strong>...</strong>로 감쌉니다.
5) 이미지 배치: 설명에 도움이 되는 섹션 뒤에 <div class="img-box"><img src="이미지 URL 또는 빈값" alt="이미지 설명"></div>를 넣습니다. 제공된 실제 이미지 URL이 있으면 그 URL을 등장 순서대로 사용하고, 없으면 src=""로 비워둡니다(자리표시자 텍스트를 지어내지 않습니다).
6) 비교표(선택): 원문에 비교·차이 설명이 있으면 <table><thead><tr><th>구분</th><th>항목 A</th><th>항목 B</th></tr></thead><tbody><tr><td>행 제목</td><td>내용</td><td>내용</td></tr></tbody></table> 형태로 정리합니다. 비교 내용이 없으면 표를 넣지 않습니다.
7) 자주 묻는 질문(원문에 Q&A가 있을 때): <h2>자주 묻는 질문</h2> 다음에 <p><strong>Q. 질문?</strong><br>답변.</p> 형태로 4~6개. 없으면 이 FAQ 블록을 생략합니다.
8) 정리 박스(필수): <div class="summary-box"><strong>✅ 정리하면</strong>요약 1<br>요약 2<br>요약 3</div>
9) 맺음말(고정 마지막 문장 필수): <div class="closing-box"><p class="closing-title">핵심 메시지 한 줄</p><p>마무리 문단. <strong>강조 문구</strong>이어지는 문장.<br>서울이건치과에서는 남은 치아 상태와 씹는 힘을 함께 고려해 보존을 우선하는 방향으로 치료를 설명드리고 있습니다.</p></div>
10) 안내(필수·수정 금지): <div class="summary-box" style="margin-top:30px;"><strong>📌 안내</strong>본 포스팅은 대표원장 이재성이 직접 작성한 글로, 의료법 제23조·제56조를 준수하여 작성되었습니다.<br>해당 케이스는 위 환자에게만 적용되는 술식이며 개인차가 있을 수 있습니다.</div>

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
