import { createAdminClient } from './supabase/server'

export interface ColumnSummary {
  readonly id: string
  readonly title: string
  readonly image_url: string | null
  readonly column_date: string
  readonly category: string | null
  readonly tags: readonly string[] | null
  readonly is_active: boolean
  readonly created_at: string
}

export interface ColumnPost extends ColumnSummary {
  readonly content: string | null
}

// Public discovery never depends on the viewer's administrator session.
export async function getPublicColumns(): Promise<ColumnSummary[]> {
  const { data, error } = await createAdminClient()
    .from('columns')
    .select('id,title,image_url,column_date,category,tags,is_active,created_at')
    .eq('is_active', true)
    .order('column_date', { ascending: false })
    .returns<ColumnSummary[]>()
  if (error) throw error
  return data
}
