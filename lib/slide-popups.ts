import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface SlidePopup {
  id: string
  title: string
  image_url: string
  link_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export const localPopupPath = path.join(process.cwd(), 'data', 'local-popups.json')
export const POPUP_STORAGE_BUCKET = 'images'
export const POPUP_STORAGE_PATH = 'popups/data.json'
export const POPUP_TABLE = 'slide_popups'

export async function readLocalPopups(): Promise<SlidePopup[]> {
  try {
    return JSON.parse(await readFile(localPopupPath, 'utf8')) as SlidePopup[]
  } catch {
    return []
  }
}

export async function writeLocalPopups(popups: SlidePopup[]) {
  await mkdir(path.dirname(localPopupPath), { recursive: true })
  await writeFile(localPopupPath, JSON.stringify(popups, null, 2), 'utf8')
}

export function sortPopups(popups: SlidePopup[]) {
  return [...popups].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return b.created_at.localeCompare(a.created_at)
  })
}

/** PostgREST: 테이블 없음 */
export function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    /Could not find the table/i.test(error.message || '') ||
    /relation .* does not exist/i.test(error.message || '')
  )
}

export async function readStoragePopups(supabase: SupabaseClient): Promise<SlidePopup[]> {
  const { data, error } = await supabase.storage
    .from(POPUP_STORAGE_BUCKET)
    .download(POPUP_STORAGE_PATH)

  if (error || !data) return []

  try {
    const text = await data.text()
    const parsed = JSON.parse(text) as SlidePopup[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function writeStoragePopups(
  supabase: SupabaseClient,
  popups: SlidePopup[],
): Promise<{ error: Error | null }> {
  const body = JSON.stringify(sortPopups(popups), null, 2)
  const { error } = await supabase.storage
    .from(POPUP_STORAGE_BUCKET)
    .upload(POPUP_STORAGE_PATH, body, {
      contentType: 'application/json',
      upsert: true,
      cacheControl: '0',
    })

  return { error: error ? new Error(error.message) : null }
}

export function createPopupRecord(input: {
  title: string
  image_url: string
  link_url?: string | null
  sort_order?: number
  is_active?: boolean
}): SlidePopup {
  const now = new Date().toISOString()
  return {
    id: `popup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    image_url: input.image_url,
    link_url: input.link_url?.trim() || null,
    sort_order: typeof input.sort_order === 'number' ? input.sort_order : 0,
    is_active: input.is_active !== undefined ? Boolean(input.is_active) : true,
    created_at: now,
    updated_at: now,
  }
}
