// 추적·검색엔진 인증 코드 모음 — 대행사에서 받은 값을 이 파일에만 넣으면 됩니다.
// 전부 페이지 소스에 그대로 노출되는 공개 식별자라 .env가 아닌 코드로 관리합니다.
// 값이 빈 문자열이면 해당 스크립트/메타 태그는 렌더링되지 않습니다.
export const tracking = {
  /** GA4 측정 ID — 예: 'G-XXXXXXXXXX' */
  ga4MeasurementId: 'G-DDLNL9V7QL',

  /** Google Tag Manager 컨테이너 ID — 예: 'GTM-XXXXXXX' */
  gtmContainerId: 'GTM-NMCTMX55',

  /** 네이버 서치어드바이저 — <meta name="naver-site-verification" content="이 값"> */
  naverSiteVerification: '87980840c90252ddda42353b4e65e0a02bcc6879',

  /** 빙 웹마스터 — <meta name="msvalidate.01" content="이 값"> */
  bingSiteVerification: '0F6CFB59E28EEA2CF0305427B9B4C841',
}
