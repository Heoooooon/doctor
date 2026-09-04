import { cookies } from 'next/headers'
import { verifyAdminSessionToken } from './admin-session'

const ADMIN_SESSION_COOKIE = 'admin-session'

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)
  return verifyAdminSessionToken(
    session?.value,
    process.env.ADMIN_PASSWORD,
  )
}
