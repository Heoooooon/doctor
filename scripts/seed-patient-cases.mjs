import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const cases = [
  {
    title: '10년전에 한 임플란트가 빠질것 같아요',
    board_category: '임플란트',
    treatment_type: '전체 임플란트',
    treatment_period: '4주',
    patient_info: '50대 여성',
    description:
      '오래전 수술했던 임플란트가 빠지고 전체적으로 이가 많이 흔들리셔서 내원.\n전체 임플란트를 통해 마음 놓고 식사하고, 편하게 웃을 수 있는 일상을 되찾았습니다.',
    before_image_url: '/images/case/implant-01/before.jpg',
    after_image_url: '/images/case/implant-01/after.jpg',
    sort_order: 1,
    is_active: true,
  },
  {
    title: '임플란트 사례 (수정 예정)',
    board_category: '임플란트',
    treatment_type: '전체 임플란트',
    treatment_period: '4주',
    patient_info: '50대 여성',
    description: null,
    before_image_url: '/images/case/implant-02/before.jpg',
    after_image_url: '/images/case/implant-02/after.jpg',
    sort_order: 2,
    is_active: true,
  },
  {
    title: '임플란트 사례 (수정 예정)',
    board_category: '임플란트',
    treatment_type: '전체 임플란트',
    treatment_period: '4주',
    patient_info: '50대 여성',
    description: null,
    before_image_url: '/images/case/implant-03/before.jpg',
    after_image_url: '/images/case/implant-03/after.jpg',
    sort_order: 3,
    is_active: true,
  },
]

// 기존 시드(정적 경로 기반)만 정리해 재실행 안전성 확보. 관리자 업로드 행(Storage URL)은 건드리지 않음.
const { error: delErr } = await supabase
  .from('patient_cases')
  .delete()
  .like('before_image_url', '/images/case/%')
if (delErr) {
  console.error('delete error:', delErr.message)
  process.exit(1)
}

const { data, error } = await supabase.from('patient_cases').insert(cases).select('id, title')
if (error) {
  console.error('insert error:', error.message)
  process.exit(1)
}
console.log(`seeded ${data.length} rows:`)
data.forEach((r) => console.log(` - ${r.title}`))
