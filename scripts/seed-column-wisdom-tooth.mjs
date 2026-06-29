import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const title = '사랑니, 꼭 빼야 하나요?'

// 본문은 상세 페이지가 <div class="post-wrap">로 감싸므로 그 "안쪽" 조각만 저장 (전역 CSS가 스타일링)
const content = `
<h1>
  사랑니, 꼭 빼야 하나요?
  <span class="subtitle">사랑니 · 매복치 · 발치 진단</span>
</h1>

<p>안녕하세요. 수원치과 서울이건치과 이재성 대표원장입니다.</p>

<p>오늘은 진료실에서 자주 받는 질문 중 하나를 정리해 드리려 합니다. 바로 <strong>사랑니 발치</strong>입니다.</p>

<p>진료를 하다 보면 이렇게 물어보시는 경우가 많습니다.<br>
<strong>"사랑니 꼭 빼야 하나요?" "안 아픈데 그냥 둬도 되지 않나요?"</strong></p>

<p>결론부터 말씀드리면, <span class="highlight">사랑니는 위치와 방향, 잇몸·옆 어금니 상태에 따라 발치 여부가 달라지는, 진단이 가장 중요한 치료입니다.</span></p>

<h2>1. 사랑니란?</h2>
<p>말 그대로 가장 안쪽에 가장 늦게 나오는 어금니입니다. 대부분 17~25세에 나오는데, 턱 공간이 부족한 경우가 많아 똑바로 나오지 못하고 비스듬히 누워 있거나 잇몸 속에 묻힌 채 멈춰 있는 경우가 많습니다.</p>
<p>이런 사랑니는 옆 어금니를 밀거나, 잇몸 사이에 음식물이 끼면서 염증을 반복시키게 됩니다. 특히 매복된 사랑니는 본인이 통증을 못 느끼는 동안에도 옆 어금니의 뿌리를 손상시키거나 충치를 만들 수 있습니다.<br>
<strong>사랑니는 단순히 "안 아프면 둔다"가 아니라, 정확한 진단으로 발치 여부를 판단해야 하는 치아입니다.</strong></p>

<h2>2. 어떤 경우에 사랑니를 빼야 할까요?</h2>
<p>대표적으로 사랑니 발치는 다음과 같은 상황에서 권장됩니다.</p>
<div class="summary-box">
  <strong>✅ 발치를 권장하는 경우</strong>
  1. 사랑니 주변에 염증이 반복되는 경우<br>
  2. 옆 어금니에 충치나 뿌리 손상을 입히는 경우<br>
  3. 매복된 사랑니로 인해 낭종(물혹)이 생긴 경우
</div>
<p>물론 모든 사랑니를 무조건 빼는 것은 아닙니다. 사랑니를 그대로 두어도 되는 경우는 다음과 같습니다.</p>
<div class="summary-box">
  <strong>✅ 그대로 두어도 되는 경우</strong>
  1. 똑바로 잘 나와 위·아래가 정상적으로 맞물리는 경우<br>
  2. 칫솔질이 가능해 위생 관리가 되는 경우<br>
  3. 옆 어금니를 압박하지 않고 안정된 위치에 있는 경우
</div>
<p>하지만 실제로는 많은 사랑니가 충분한 공간 없이 맹출되는 경우가 많습니다. 사랑니가 비스듬히 나거나 잇몸 속에 일부 묻힌 상태로 자라면 앞쪽 어금니를 밀거나 압박할 수 있고, 주변에 음식물이 잘 끼고 칫솔이 닿기 어려워지면서 충치나 잇몸 염증이 생기기도 합니다. 경우에 따라서는 사랑니 뿌리가 휘어 있거나 신경과 가까운 위치에 있어 <strong>발치 난이도가 높아질 수 있습니다.</strong></p>
<p>그래서 사랑니는 "아프면 빼는 치아"라기보다 현재 위치와 방향, 주변 치아와의 관계를 미리 확인해보는 것이 중요합니다. 정확한 판단은 구강검진과 방사선 사진을 통해 개인 상태에 맞게 결정하는 것이 좋습니다.</p>

<h2>3. 사랑니 발치는 어떻게 진행되나요?</h2>
<p>먼저 파노라마 X-ray 또는 3D CT 촬영으로 <span class="highlight">사랑니의 위치, 신경관과의 거리, 매복 정도를 정확히 확인합니다.</span></p>
<p>이후 환자분의 상태에 따라 국소 마취 또는 진정 마취를 선택하고, 발치 후 봉합 → 약 처방 → 1주 후 실밥 제거 순으로 진행됩니다.</p>
<p>매복 정도가 깊거나 신경관에 가까운 경우, 무리한 발치보다는 <strong>부분 발치(코로넥토미) 등 신경 손상을 최소화하는 방법을 함께 고려합니다.</strong></p>

<h2>4. 자주 묻는 질문</h2>
<p><strong>Q. 사랑니는 모두 빼야 하나요?</strong><br>
A. 아닙니다. 위치와 상태에 따라 다르며, 정상적으로 잘 나와 위생 관리가 되는 경우는 그대로 두기도 합니다.</p>
<p><strong>Q. 발치할 때 많이 아픈가요?</strong><br>
A. 마취가 충분히 된 상태에서 진행하므로 시술 중 통증은 거의 없습니다. 발치 후 1~2일은 부기와 통증이 있을 수 있어 약 처방으로 관리합니다.</p>
<p><strong>Q. 부기와 회복 기간은 얼마나 걸리나요?</strong><br>
A. 매복 정도에 따라 다르지만 보통 부기는 3일째 가장 심하고 1주일 정도면 가라앉습니다. 실밥은 발치 후 7~10일경에 제거합니다.</p>
<p><strong>Q. 신경 손상 위험은 없나요?</strong><br>
A. 사랑니 뿌리가 신경관과 가까운 경우 정밀한 3D CT 분석 후 안전한 술식을 선택합니다. 위험이 큰 경우는 부분 발치 등 대안을 고려합니다.</p>

<div class="closing-box">
  <p class="closing-title">📌 정리하면</p>
  <p>사랑니는 무조건 빼는 치아도, 무조건 두는 치아도 아닙니다. 위치, 방향, 잇몸 상태, 옆 어금니와의 관계에 따라 판단이 모두 달라지는 치아입니다.<br>
  사랑니 치료에서 가장 중요한 것은 발치 기술이 아니라 <span class="highlight">정확한 진단</span>입니다. 정밀한 진단 후 본인에게 맞는 방법을 선택하는 것이 필요합니다.</p>
  <p>감사합니다. 서울이건치과 이재성 대표원장이었습니다.</p>
</div>
`.trim()

const row = {
  title,
  content,
  image_url: null,
  column_date: '2026-06-03',
  category: '일반진료', // 사랑니 발치 → 일반진료 카테고리
  tags: ['사랑니', '사랑니발치', '매복사랑니', '코로넥토미'],
  is_active: true,
}

// 재실행 안전성: 동일 제목 기존 행 제거 후 삽입
const { error: delErr } = await supabase.from('columns').delete().eq('title', title)
if (delErr) {
  console.error('delete error:', delErr.message)
  process.exit(1)
}

const { data, error } = await supabase.from('columns').insert(row).select('id, title, column_date').single()
if (error) {
  console.error('insert error:', error.message)
  process.exit(1)
}
console.log('seeded column:', data.id, '|', data.title, '|', data.column_date)
