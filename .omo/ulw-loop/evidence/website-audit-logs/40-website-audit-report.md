# 서울이건치과 홈페이지 No-Code 감사 보고서

생성일: 2026-06-29

## 범위와 증거

- 코드 수정 없이 Next.js 프로덕션 빌드(`npm run build`)와 `next start -p 3010` 표면에서 점검했다.
- 브라우저 캡처: `.omo/ulw-loop/evidence/website-audit-screenshots/`
- 정적/HTTP/자산 로그: `.omo/ulw-loop/evidence/website-audit-logs/`
- 핵심 기준 문서: `docs/brand.md`, `docs/design-system.md`, `docs/seo-guide.md`, `docs/medical-law.md`
- 한계: 배포 도메인과 실제 Lighthouse 3-5회 중앙값은 이번 no-code 감사에서 실행하지 않았다. 대신 프로덕션 로컬 서버, HTTP 헤더, DOM, 캡처, 빌드 산출물/자산 크기로 리스크를 판정했다.

## Top 10 우선순위

| 우선순위 | 항목 | 영역 | 근거 |
| --- | --- | --- | --- |
| P0 | 관리자 기본 비밀번호가 코드에 존재하고, 세션 토큰도 고정 문자열 | Security | `app/api/admin/auth/route.ts:4-36` |
| P0 | 회원 비밀번호가 단순 SHA-256으로 저장되고 회원 쿠키가 JS에서 읽힘 | Security/Privacy | `app/api/auth/member-signup/route.ts:4-9`, `app/api/auth/member-login/route.ts:47-68` |
| P0 | 상담/회원가입 개인정보 수집 화면이 법정 고지보다 약함 | Privacy/Medical-law | `docs/medical-law.md:17-21`, `components/layout/QuickConsultBar.tsx:257-278`, `components/auth/SignupForm.tsx:111-208` |
| P1 | 전환 핵심 CTA가 첫 화면에서 사라지고 데스크톱 예약 버튼도 숨김 | UX/Conversion | `home-mobile-375x812.png`, `components/layout/Header.tsx:149-159` |
| P1 | 치료 전후 사례에서 After 이미지가 비로그인 상태로 바로 노출 | Medical-law/Privacy | `cases-mobile-375x812.png`, `components/cases/CasesView.tsx:260-267` |
| P1 | 의료법 리스크 문구가 콘텐츠에 남아 있음: "완벽", "공포 없는", "반영구" | Medical-law/Copy | `02-medical-law-copy-scan.txt`, `components/main/ImplantSection.tsx:45`, `components/main/ImplantFaqSection.tsx:17-22` |
| P1 | 모바일 메뉴는 dialog이나 포커스 트랩/초점 이동/aria-expanded 동기화가 약함 | Accessibility | `home-mobile-menu-open.png`, `components/layout/MobileNav.tsx:37-76` |
| P1 | `/contact`로 가는 CTA가 있으나 라우트가 없음 | UX/Conversion | `components/board/CtaSection.tsx:28-30`, `components/board/CtaSection.tsx:80-87` |
| P2 | 홈/미디어/네비게이션에 18px 미만 텍스트와 44px 미만 터치 타깃 다수 | Accessibility/Design-system | `07-browser-summary.txt`, `docs/design-system.md:38`, `docs/design-system.md:103` |
| P2 | public 이미지가 648MB, 24MB PNG/41MB GIF 등 대형 자산 다수 | Performance | `10-asset-size-audit.txt` |

## 발견사항

### P0 - 관리자 인증 기본값이 운영 사고로 이어질 수 있음

Category: Security
Evidence: `05-http-status-headers.txt`, `admin-login-mobile-375x812.png`
Source: `app/api/admin/auth/route.ts:4-36`, `lib/admin-auth.ts:6-13`, `proxy.ts:7-16`
Repro: `/admin/login`이 공개되고, 인증 API에는 하드코딩된 기본 관리자 비밀번호와 고정 세션 토큰이 존재한다.
Impact: 환경변수 설정 누락, 코드 유출, 테스트 계정 재사용 시 관리자 영역 전체가 위험해진다. 개발환경에서는 `isAdminAuthenticated()`와 proxy가 인증을 우회하므로 로컬/스테이징 데이터 노출 가능성도 크다.
Recommendation: 기본 비밀번호 제거, 서버 저장 세션/서명 토큰, rate limit, 잠금 정책, 환경별 스테이징 보호를 우선 적용한다.

### P0 - 회원 인증/사례 게이트가 클라이언트 쿠키 신뢰에 기대고 있음

Category: Security/Privacy
Evidence: `cases-mobile-375x812.png`, `03-privacy-security-static.txt`
Source: `components/cases/CasesView.tsx:27-35`, `app/api/auth/member-login/route.ts:39-68`, `app/api/auth/member-signup/route.ts:4-9`
Repro: `/cases` 진입 후 로그인 여부는 `member_name` 쿠키 존재 여부로 판단한다.
Impact: 비밀번호는 salt 없는 SHA-256이고, `member_token`, `member_id`, `member_name`이 `httpOnly: false`라 스크립트에서 접근 가능하다. 현재 UI 게이트는 실제 권한 검증이 아니라 쿠키 표시값에 가까워 치료 사례 보호 목적과 맞지 않는다.
Recommendation: 비밀번호는 bcrypt/argon2, 세션은 httpOnly secure 서명 쿠키 또는 서버 검증 토큰, 사례 접근은 서버 권한 검증으로 전환한다.

### P0 - 개인정보 수집 동의가 수집 항목/목적/보관기간을 충분히 보여주지 않음

Category: Privacy/Medical-law
Evidence: `home-mobile-consult-modal.png`, `home-mobile-consult-empty-errors.png`, `signup-mobile-375x812.png`
Source: `docs/medical-law.md:17-21`, `docs/medical-law.md:63-69`, `components/layout/QuickConsultBar.tsx:257-278`, `components/auth/SignupForm.tsx:111-208`
Repro: 상담 모달은 "개인정보 수집 동의"와 "보기"만 있고, 회원가입은 별도 동의 체크 없이 생년월일/이메일까지 필수로 받는다.
Impact: 의료 사이트의 문의/회원가입은 민감한 맥락의 개인정보 수집이다. 수집 항목, 목적, 보관기간, 철회 안내가 폼 안에서 바로 확인되지 않으면 법무/운영 리스크가 크다.
Recommendation: 상담 폼 안에 이름/연락처, 상담 연락 목적, 보관기간을 요약 표시하고 필수 체크를 유지한다. 회원가입은 별도 개인정보/이용약관 동의와 14세 미만 보호자 동의 정책을 UI에 반영한다.

### P1 - 첫 화면에서 상담 전환 경로가 약함

Category: UX/UI
Evidence: `home-mobile-375x812.png`, `home-desktop-1280x900.png`, `home-mobile-scrolled-fab.png`
Source: `components/layout/Header.tsx:149-159`, `components/layout/QuickConsultBar.tsx:154-169`
Repro: 홈 첫 화면에서는 전화 아이콘만 즉시 보이고 "상담신청" FAB는 60% 이상 스크롤 후 나타난다. 데스크톱 예약 버튼은 `className="hidden"`이다.
Impact: 사용자가 치과를 비교하는 첫 화면에서 상담/예약이라는 다음 행동이 약해 전환 손실 가능성이 높다.
Recommendation: 첫 화면에 부담 없는 CTA("내 치아 상태 확인", "상담 신청")를 명확히 노출하고, 데스크톱 헤더 예약 버튼을 실제 버튼으로 복구한다.

### P1 - 치료 전후 사례의 After 이미지 공개 방식이 의료광고 리스크를 키움

Category: Medical-law/Privacy
Evidence: `cases-mobile-375x812.png`
Source: `docs/medical-law.md:40-45`, `docs/medical-law.md:74-79`, `components/cases/CasesView.tsx:232-267`
Repro: `/cases`에서 비로그인 상태여도 After 이미지는 원본으로 보이고 Before만 블러 처리된다.
Impact: 전후 사진은 사전 동의, 식별 방지, 과장 편집 금지, 심의 권장이 필요한 민감 콘텐츠다. 일부만 잠그면 "결과 홍보"처럼 보일 수 있다.
Recommendation: B/A 전체를 동일하게 게이트하거나, 공개 영역에는 사례 설명과 면책 문구만 두고 이미지는 로그인/동의 후 확인하도록 일관화한다.

### P1 - 금지/주의 표현이 실제 페이지 문구에 남아 있음

Category: Medical-law/Content
Evidence: `02-medical-law-copy-scan.txt`, `implant-mobile-375x812.png`
Source: `docs/brand.md:193-207`, `components/main/ImplantSection.tsx:41-46`, `components/main/ImplantSection.tsx:77-85`, `components/main/ImplantFaqSection.tsx:17-22`
Repro: 홈 임플란트 섹션에 "상실된 치아, 완벽한 복원", "공포 없는 수술 환경", FAQ에 "반영구적으로 사용 가능합니다"가 나온다.
Impact: 결과 보장/과장으로 해석될 수 있어 의료법 가이드와 브랜드 톤에 어긋난다.
Recommendation: "기능 회복을 목표로", "불안과 불편을 줄이기 위한 진정 진료", "관리 상태에 따라 수명이 달라질 수 있습니다"처럼 신중한 표현으로 바꾼다.

### P1 - 모바일 메뉴 접근성 상태 관리가 불완전함

Category: Accessibility/UX
Evidence: `home-mobile-menu-open.png`, `browser-surface-audit.json`
Source: `components/layout/MobileNav.tsx:37-76`, `components/layout/MobileNav.tsx:83-89`
Repro: 메뉴는 `role="dialog"`/`aria-modal="true"`이지만 열림 뒤 초점은 메뉴 열기 버튼에 남고, 포커스 트랩/복귀가 없다. 브라우저 로그의 `menuData.activeAria`도 "메뉴 열기"로 남았다.
Impact: 키보드/스크린리더 사용자는 메뉴가 열렸는지와 현재 위치를 놓칠 수 있다.
Recommendation: 열릴 때 닫기 버튼 또는 첫 메뉴로 포커스 이동, 닫힐 때 트리거 복귀, 배경 inert 처리, 버튼 `aria-expanded` 동기화를 적용한다.

### P1 - 상담 CTA의 일부 목적지가 없는 라우트로 연결됨

Category: UX/Conversion
Evidence: `01-seo-static.txt`, `05-http-status-headers.txt`
Source: `components/board/CtaSection.tsx:28-30`, `components/board/CtaSection.tsx:80-87`
Repro: 진료 상세 하단 CTA가 `/contact`로 이동하지만 앱 라우트 목록과 빌드 결과에는 `/contact`가 없다.
Impact: 치료 페이지 하단에서 상담 예약을 누른 사용자가 404를 만나면 전환이 끊긴다.
Recommendation: `/contact`를 만들거나 기존 상담 모달/카카오/전화 중 하나로 일관되게 연결한다.

### P2 - 디자인 시스템의 최소 글자/터치 규칙과 실제 UI가 충돌함

Category: Accessibility/Design-system
Evidence: `07-browser-summary.txt`, `home-mobile-menu-open.png`, `media-mobile-375x812.png`
Source: `docs/design-system.md:38`, `docs/design-system.md:103`, `components/main/HeroSlider.tsx:351-360`, `components/main/MediaSection.tsx:23-30`, `components/layout/MobileNav.tsx:137-153`
Repro: DOM 분석에서 각 주요 페이지마다 18px 미만 텍스트가 반복된다. 히어로 영문 라벨 9px, 메뉴 번호/보조 텍스트 12px, 미디어 설명 14px 등이 보인다.
Impact: 의료기관 사이트에서 읽기 피로와 접근성 리스크가 커진다.
Recommendation: 홈페이지 실제 본문/CTA/설명 텍스트는 18px 기준으로 재정렬하고, 보조 라벨도 14px 이하 사용을 줄인다.

### P2 - 홈 구조가 데스크톱/모바일 중복 렌더와 내부 스크롤에 의존함

Category: UX/Performance
Evidence: `home-tablet-768x1024.png`, `browser-surface-audit.json`
Source: `app/page.tsx:49-75`, `components/main/HeroSlider.tsx:238-320`
Repro: 홈은 `home-desktop`과 `home-mobile` 두 트리를 나누고 데스크톱은 `h-screen overflow-y-scroll scrollbar-hide`로 내부 스크롤한다.
Impact: 브라우저 기본 스크롤, 위치 복원, 접근성, 분석 이벤트, 성능 최적화가 복잡해진다. 태블릿에서는 데스크톱 트리로 전환되어 모바일에 가까운 기기 경험과 어긋날 수 있다.
Recommendation: 공통 섹션을 하나의 반응형 트리로 줄이고, 내부 스크롤 대신 문서 스크롤을 기본으로 사용한다.

### P2 - 홈 이미지/비디오 자산이 과대함

Category: Performance
Evidence: `10-asset-size-audit.txt`
Source: `components/main/HeroSlider.tsx:238-320`
Repro: `public/images`가 648MB이고, `public/images/slides`만 90MB다. 24MB PNG, 41MB GIF, 6MB hero MP4 등이 포함되어 있다.
Impact: LCP, 데이터 비용, 모바일 이탈률에 직접 영향을 준다.
Recommendation: hero는 AVIF/WebP responsive source, MP4 poster preload 정책, GIF 제거, 실제 표시 크기별 변환 파이프라인을 만든다.

### P2 - SEO 기본은 있으나 일부 캐노니컬/OG/색인 설계가 부정확함

Category: SEO
Evidence: `08-route-matrix.json`, `05-http-status-headers.txt`
Source: `app/layout.tsx:12-48`, `app/signup/page.tsx:5-9`, `app/privacy/page.tsx:3-7`, `app/sitemap.ts:4-38`, `docs/seo-guide.md:85-98`
Repro: `/signup`, `/privacy`, `/admin/login`에서 inherited canonical이 `https://egundc.com`으로 잡힌다. OG 이미지는 대부분 로고 파일이고, SEO 가이드의 1200x630 게시판별 OG 이미지와 다르다.
Impact: 검색엔진이 유틸 페이지와 홈을 혼동하거나 공유 미리보기 품질이 떨어질 수 있다.
Recommendation: noindex 페이지는 canonical 제거/자기 canonical 정책 정리, 주요 진료 페이지별 OG 이미지 1200x630 적용, sitemap의 `lastModified: new Date()`를 배포 시점/콘텐츠 수정 시점 기반으로 조정한다.

### P2 - `X-Powered-By: Next.js`가 노출됨

Category: Security/Operations
Evidence: `05-http-status-headers.txt`
Source: `next.config.ts:18-34`
Repro: HTTP 응답 헤더에 보안 헤더는 있으나 `X-Powered-By: Next.js`도 함께 노출된다.
Impact: 직접 취약점은 아니지만 스캐너와 자동 공격 표면을 줄이는 운영 위생 측면에서 제거가 낫다.
Recommendation: `poweredByHeader: false` 설정을 추가한다.

### P3 - 미디어/후기 표현은 법무 검토가 필요함

Category: Content/Medical-law
Evidence: `media-mobile-375x812.png`, `02-medical-law-copy-scan.txt`
Source: `app/media/page.tsx:12-16`, `app/media/page.tsx:33-40`, `docs/medical-law.md:31-36`
Repro: `/media`가 "환자후기"를 SEO title/description/keyword와 카드 중심으로 노출한다.
Impact: 외부 네이버 플레이스 링크라도 의료광고성 문맥에서 후기 활용 규정 검토가 필요하다.
Recommendation: "네이버 플레이스 정보 확인"처럼 정보성 톤으로 낮추고, 후기 사용 정책/동의 범위를 확인한다.

## Route Coverage

| Route | Evidence | 상태 |
| --- | --- | --- |
| `/` | home mobile/tablet/desktop, menu, consult modal, empty errors | 캡처 완료 |
| `/about` | about mobile | 캡처 완료 |
| `/implant` | implant mobile/desktop | 캡처 완료 |
| `/natural-tooth` | natural-tooth mobile | 캡처 완료 |
| `/orthodontic` | orthodontic mobile | 캡처 완료 |
| `/pediatric` | pediatric mobile | 캡처 완료 |
| `/cases` | cases mobile/desktop | 캡처 완료 |
| `/media` | media mobile | 캡처 완료 |
| `/location` | location mobile | 캡처 완료 |
| `/signup` | signup mobile | 캡처 완료 |
| `/privacy` | privacy mobile | 캡처 완료 |
| `/admin/login` | admin-login mobile | 캡처 완료 |
| `/column`, `/notice` | HTTP/header/body snippets | 브라우저 시각 캡처는 생략 |

## Positive Notes

- 프로덕션 빌드는 성공했다.
- robots는 `/admin`, `/api`, `/signup`을 차단한다.
- 기본 보안 헤더(`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS)는 설정되어 있다.
- 많은 진료 페이지에 route-level metadata와 FAQ JSON-LD가 적용되어 있다.
- 상담 모달은 빈 제출 시 이름/연락처/동의 오류를 시각적으로 표시한다.

## 다음 액션 제안

1. P0 보안/개인정보 항목을 먼저 별도 작업으로 수정한다.
2. 의료법 문구와 B/A 사례 정책을 원장/법무 검토 후 정리한다.
3. 첫 화면 CTA, `/contact` 라우트, 모바일 메뉴 접근성을 한 번에 고친다.
4. 이미지/비디오 변환 파이프라인과 Lighthouse 실측을 별도 성능 작업으로 진행한다.
