'use client'

import { useEffect, useState } from 'react'

/**
 * 모바일 전체 화면 섹션의 높이를 px로 고정하기 위한 훅.
 *
 * 카카오톡 등 인앱 브라우저는 스크롤 중 자체 툴바가 나타나고 사라질 때
 * 웹뷰 높이를 실제로 리사이즈하므로, svh/vh 기반 섹션이 스크롤 도중
 * 늘었다 줄었다 하며 스크롤 위치가 튀게 된다.
 * 주소창/툴바 토글(세로 변화)은 무시하고 회전(가로 변화) 시에만 갱신한다.
 *
 * @returns 모바일(<768px)에서는 고정할 높이 px, 데스크탑에서는 null
 */
export function useLockedMobileVh(): number | null {
  const [vh, setVh] = useState<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    let lastWidth = window.innerWidth

    const apply = () => setVh(mq.matches ? window.innerHeight : null)
    apply()

    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth
        apply()
      }
    }

    mq.addEventListener('change', apply)
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      mq.removeEventListener('change', apply)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  return vh
}
