export const CLINICIAN_COLUMNS = [
  'id',
  'name',
  'role',
  'title',
  'specialty',
  'sub_role',
  'specialty_detail',
  'image_url',
  'careers',
  'memberships',
  'highlights',
  'letter',
  'documents',
  'team_card_zoom',
  'team_card_shift_y_percent',
  'profile_image_fit',
  'sort_order',
  'is_active',
  'created_at',
  'updated_at',
] as const

export const CLINICIAN_SELECT = CLINICIAN_COLUMNS.join(',')
