// 방문자 분석에서 제외할 경로 — 관리자 화면은 운영진만 쓰므로
// 방문자수·인기 페이지 통계에 섞이면 수치가 왜곡된다.
const UNTRACKED_PREFIXES = ['/admin'] as const

export function isUntrackedPath(pathname: string | null): boolean {
  if (!pathname) return false
  return UNTRACKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}
