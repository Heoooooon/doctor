import fs from 'fs'
import path from 'path'

export interface PatientCase {
  id: string
  title: string
  board_category: string
  treatment_type: string | null
  description: string | null
  before_image_url: string | null
  after_image_url: string | null
  treatment_period: string | null
  patient_info: string | null
  order: number
}

const CASE_DIR = path.join(process.cwd(), 'public', 'images', 'case')
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

function findImage(dir: string, prefix: string): string | null {
  let files: string[]
  try {
    files = fs.readdirSync(dir)
  } catch {
    return null
  }
  const match = files.find((f) => {
    const lower = f.toLowerCase()
    return lower.startsWith(prefix) && IMG_EXTS.includes(path.extname(lower))
  })
  return match || null
}

/**
 * public/images/case/{폴더}/ 를 스캔하여 환자사례 목록을 반환.
 * 각 폴더에는 before.*, after.*, info.json 이 있어야 함.
 * info.json: { title, category, treatment_type?, treatment_period?, patient_info?, description?, order? }
 */
export function getPatientCases(): PatientCase[] {
  let slugs: string[]
  try {
    slugs = fs
      .readdirSync(CASE_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
      .map((d) => d.name)
  } catch {
    return []
  }

  const cases: PatientCase[] = []
  for (const slug of slugs) {
    const dir = path.join(CASE_DIR, slug)
    let meta: Record<string, unknown> = {}
    try {
      meta = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'))
    } catch {
      continue // info.json 없으면 건너뜀
    }
    if (!meta.title || !meta.category) continue

    const beforeFile = findImage(dir, 'before')
    const afterFile = findImage(dir, 'after')

    cases.push({
      id: slug,
      title: String(meta.title),
      board_category: String(meta.category),
      treatment_type: (meta.treatment_type ?? meta.sub ?? null) as string | null,
      description: (meta.description ?? null) as string | null,
      before_image_url: beforeFile ? `/images/case/${slug}/${beforeFile}` : null,
      after_image_url: afterFile ? `/images/case/${slug}/${afterFile}` : null,
      treatment_period: (meta.treatment_period ?? meta.period ?? null) as string | null,
      patient_info: (meta.patient_info ?? null) as string | null,
      order: typeof meta.order === 'number' ? meta.order : 999,
    })
  }

  cases.sort((a, b) => a.order - b.order)
  return cases
}
