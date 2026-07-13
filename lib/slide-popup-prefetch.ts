/**
 * 인트로 재생 중에 팝업 JSON + 이미지를 미리 받아 둔다.
 * 인트로 종료 시점에는 네트워크 대기 없이 바로 띄우기 위함.
 */

export interface SlidePopupItem {
  id: string
  title: string
  image_url: string
  link_url: string | null
  sort_order: number
  is_active: boolean
}

const HIDE_UNTIL_KEY = 'egun:popup-hide-until'

/** 이번 문서(페이지 로드)에서 팝업을 이미 띄웠는지 — 새로고침 시 초기화 */
let shownThisPageLoad = false

/** 인트로 종료 여부 (이벤트 유실 방지 sticky 플래그) */
let introEnded = false

export function isPopupHiddenToday() {
  if (typeof window === 'undefined') return false
  try {
    const until = localStorage.getItem(HIDE_UNTIL_KEY)
    if (!until) return false
    return Date.now() < Number(until)
  } catch {
    return false
  }
}

export function markPopupHiddenToday() {
  try {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    localStorage.setItem(HIDE_UNTIL_KEY, String(end.getTime()))
  } catch {
    // ignore
  }
}

export function wasPopupShownThisPageLoad() {
  return shownThisPageLoad
}

export function markPopupShownThisPageLoad() {
  shownThisPageLoad = true
}

export function markIntroEnded() {
  introEnded = true
}

export function hasIntroEnded() {
  return introEnded
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      resolve()
    }
    img.onload = done
    img.onerror = done
    // 네트워크 지연 시에도 인트로 종료 후 팝업은 뜨게 (이미지는 나중에 표시)
    window.setTimeout(done, 2500)
    img.src = url
    if (img.complete) done()
  })
}

let prefetchPromise: Promise<SlidePopupItem[]> | null = null

/** 인트로 중 1회만 호출. 이후 await 시 캐시 반환 */
export function startPopupPrefetch(): Promise<SlidePopupItem[]> {
  if (typeof window === 'undefined') {
    return Promise.resolve([])
  }

  if (prefetchPromise) return prefetchPromise

  prefetchPromise = (async () => {
    try {
      // "오늘 하루 보지 않기"만 프리페치 스킵 — 세션 스토리지는 쓰지 않음
      // (새로고침마다 인트로가 나오듯 팝업도 다시 나와야 함)
      if (isPopupHiddenToday()) {
        return []
      }

      const res = await fetch('/api/popups', { cache: 'no-store' })
      if (!res.ok) return []

      const data = (await res.json()) as SlidePopupItem[]
      const active = (Array.isArray(data) ? data : []).filter(
        (item) => item.is_active && item.image_url,
      )

      // 인트로 시간 동안 이미지 디코드까지 최대한 끝내 둔다 (최대 2.5s)
      await Promise.all(active.map((item) => preloadImage(item.image_url)))

      return active
    } catch {
      return []
    }
  })()

  return prefetchPromise
}

/** 테스트/강제 재로드용 */
export function resetPopupPrefetch() {
  prefetchPromise = null
  shownThisPageLoad = false
  introEnded = false
}
