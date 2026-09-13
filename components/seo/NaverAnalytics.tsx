'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { tracking } from '@/data/tracking'

declare global {
  interface Window {
    wcs_add?: Record<string, string>
    wcs?: unknown
    wcs_do?: () => void
  }
}

// 네이버 애널리틱스 공통 스크립트 — data/tracking.ts에 wa 값이 있을 때만 삽입.
// App Router는 첫 진입 이후 화면 전환이 클라이언트에서 일어나므로 경로가 바뀔 때마다
// wcs_do()를 다시 호출한다. 그러지 않으면 진입한 첫 페이지 하나만 집계된다.
export function NaverAnalytics() {
  const { naverAnalyticsId } = tracking
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const reported = useRef<string | null>(null)

  useEffect(() => {
    if (!ready || !naverAnalyticsId) return
    if (reported.current === pathname) return
    reported.current = pathname
    window.wcs_add = { ...window.wcs_add, wa: naverAnalyticsId }
    window.wcs_do?.()
  }, [ready, pathname, naverAnalyticsId])

  if (!naverAnalyticsId) return null
  return (
    <Script
      src="https://wcs.naver.net/wcslog.js"
      strategy="afterInteractive"
      onReady={() => setReady(true)}
    />
  )
}
