import { cookies } from 'next/headers'

const ADMIN_SESSION_COOKIE = 'admin-session'
const SESSION_TOKEN = 'egun-admin-authenticated'

export async function isAdminAuthenticated(): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production') {
    return true
  }

  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)
  return session?.value === SESSION_TOKEN
}
