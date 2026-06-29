'use client'

import { useEffect } from 'react'

const POS_KEY = 'egun:home-scroll'

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
    const max = Math.max(0, sc.scrollHeight - sc.clientHeight)
    sc.scrollTop = Math.min(target, max)
  } else {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    window.scrollTo(0, Math.min(target, max))
  }
}

/**
 * 홈 스크롤 위치 복원기.
 * - 홈을 떠날 때 마지막 스크롤 위치를 저장하고, 다시 홈으로 돌아오면 그 위치로 복원한다.
 *   → 페이지 이동 후 "뒤로가기"로 돌아와도 처음으로 튕기지 않는다.
 * - 로고 클릭 등 "처음부터 보기" 진입은 저장값을 비워(0) 최상단으로 시작한다(Header에서 처리).
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

    return () => {
      desktop?.removeEventListener('scroll', save)
      window.removeEventListener('scroll', save)
      window.removeEventListener('pagehide', save)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
