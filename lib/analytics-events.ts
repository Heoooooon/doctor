// 전환 이벤트 이름 — GA4 '주요 이벤트'로 표시할 대상.
// 값은 GA4 보고서와 네이버 전환에서 그대로 쓰이므로 임의로 바꾸지 않는다.
export const conversionEvents = {
  consultSubmit: 'consult_submit',
  phoneClick: 'phone_click',
  kakaoClick: 'kakao_click',
} as const

export type ConversionEvent = (typeof conversionEvents)[keyof typeof conversionEvents]

type Params = Record<string, string>

/**
 * GA4로 전환 이벤트를 보낸다. gtag가 아직 없으면 dataLayer에 쌓아 GTM이 처리하게 한다.
 * 광고·분석 차단 환경에서도 페이지 동작을 막지 않도록 실패는 호출자에게 전파하지 않는다.
 */
export function trackConversion(event: ConversionEvent, params: Params = {}) {
  if (typeof window === 'undefined') return false
  const target = window as typeof window & {
    gtag?: (command: string, event: string, params?: Params) => void
    dataLayer?: unknown[]
  }
  try {
    if (typeof target.gtag === 'function') {
      target.gtag('event', event, params)
      return true
    }
    if (Array.isArray(target.dataLayer)) {
      target.dataLayer.push({ event, ...params })
      return true
    }
    return false
  } catch {
    // 분석 스크립트 오류가 상담 신청이나 전화 연결을 막지 않게 한다.
    return false
  }
}
