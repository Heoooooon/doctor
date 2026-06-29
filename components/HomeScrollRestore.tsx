'use client'

import { useEffect } from 'react'

const POS_KEY = 'egun:home-scroll'
const POP_KEY = 'egun:nav-pop'

// 모듈 스코프에서 1회만 popstate 바인딩 → 뒤로/앞으로 이동을 확실히 표시(React 마운트 타이밍 영향 없음)
if (typeof window !== 'undefined' && !(window as unknown as { __egunPopBound?: boolean }).__egunPopBound) {
  ;(window as unknown as { __egunPopBound?: boolean }).__egunPopBound = true
  window.addEventListener('popstate', () => {
    try { sessionStorage.setItem(POP_KEY, '1') } catch {}
  })
}

/** 데스크탑 홈은 #home-desktop 내부 스크롤, 그 외/모바일은 window 스크롤 */
function getScroller(): HTMLElement | null {
  const d = document.getElementById('home-desktop')
  // offsetParent === null → display:none (모바일에서 데스크탑 컨테이너 숨김)
  if (d && d.offsetParent !== null) return d
  return null
}

function readScrollTop(): number {
  const sc = getScroller()
  return sc ? sc.scrollTop : window.scrollY
}

function applyScroll(target: number) {
  const sc = getScroller()
  if (sc) {
    const max = sc.scrollHeight - sc.clientHeight
    sc.scrollTop = Math.min(target, Math.max(0, max))
  } else {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, Math.min(target, Math.max(0, max)))
  }
}

/**
 * 홈 진입 시 스크롤 위치 복원기.
 * - 페이지 이동 후 뒤로/앞으로(popstate)로 돌아오면 마지막 스크롤 위치를 복원한다.
 * - 일반 링크 진입(로고/메뉴 클릭 등)은 복원하지 않고 최상단을 유지한다.
 */
export default function HomeScrollRestore() {
  useEffect(() => {
    let raf = 0
    let restoring = false

    const save = () => {
      if (restoring) return
      try { sessionStorage.setItem(POS_KEY, String(Math.round(readScrollTop()))) } catch {}
    }

    const desktop = document.getElementById('home-desktop')
    desktop?.addEventListener('scroll', save, { passive: true })
    window.addEventListener('scroll', save, { passive: true })
    window.addEventListener('pagehide', save)

    // 뒤로/앞으로 진입 또는 새로고침 복귀일 때만 복원
    let isPop = false
    try {
      isPop = sessionStorage.getItem(POP_KEY) === '1'
      if (isPop) sessionStorage.removeItem(POP_KEY)
    } catch {}
    const navType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type
    if (navType === 'back_forward') isPop = true
    ;(window as unknown as { __rd?: unknown }).__rd = { isPop, navType, saved: (()=>{try{return sessionStorage.getItem(POS_KEY)}catch{return null}})(), scroller: getScroller()?.id || 'window' }

    if (isPop) {
      let target = 0
      try { target = parseInt(sessionStorage.getItem(POS_KEY) || '0', 10) || 0 } catch {}

      if (target > 4) {
        restoring = true
        const startAt = performance.now()
        // 일정 시간 동안 매 프레임 위치를 재적용 → 콘텐츠 지연 로딩/프레임워크의 스크롤 초기화에 모두 대응
        const tick = () => {
          applyScroll(target)
          if (performance.now() - startAt < 900) {
            raf = requestAnimationFrame(tick)
          } else {
            restoring = false
          }
        }
        raf = requestAnimationFrame(tick)
      }
    }

    return () => {
      desktop?.removeEventListener('scroll', save)
      window.removeEventListener('scroll', save)
      window.removeEventListener('pagehide', save)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
