import { createBrowserClient } from '@supabase/ssr'
import { hasSupabaseConfig } from './config'

export function createClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      'Supabase 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 .env.local에 추가해주세요.',
    )
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
