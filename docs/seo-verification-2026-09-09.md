# 수원치과 Google 검색 개선 검증

## 범위와 현재 상태

- 목표: Google 일반 웹검색 `수원치과` 1위.
- 대표 주소: `https://egundc.com/`.
- 초기 로컬 검수 후, 2026-09-10 00:01 KST 기준 운영 배포·실제 응답 검증까지 완료했다. Search Console 조회와 실제 검색 순위 달성은 확인하지 않았다.
- 홈페이지 제목·설명·H1·병원 설명을 정리하고, 실제 별칭이 아닌 지역 검색어를 Dentist 별칭에서 제외했다.
- 자연치아 치료 이미지 5개를 CSS 배경에서 `img`로 변경하고 실제 이미지에 맞는 alt를 제공했다.
- 임플란트 이미지 3개·로고 설명을 바로잡고, 중복 장식 이미지는 빈 alt를 유지한다.
- 야간진료 카드의 하단 오기를 정정했다. 원본 JPEG는 보존하며, 새 PNG는 1080×1080, 367,545바이트다. 하단 캡션 영역 밖의 픽셀 변경은 0개다.
- 공개 칼럼 서버 목록, 글별 메타데이터·canonical·OG·BlogPosting, 공개 상세 사이트맵을 연결했다.
- 칼럼 DB에는 작성자·수정일 필드가 없어 해당 값을 지어내지 않았다. 정적 페이지의 알 수 없는 수정일도 요청 시각으로 채우지 않는다.

## 자동 검증

| 검사 | 결과 |
|---|---|
| 수정 전 운영 응답 `node scripts/verify-public-seo.mjs https://egundc.com` | 138개 중 25개 통과, 113개 실패, 종료 코드 1 |
| 칼럼 기존 동작 회귀 RED | 10개 중 6개 실패: 초기 링크·메타·schema·사이트맵 누락 |
| 정적 사이트맵 수정일 RED | 요청 시각이 수정일로 출력돼 실패 |
| `node --test tests/*.test.mts` | 인증 회귀 6개 포함 29개 통과, 실패 0 |
| `./node_modules/.bin/tsc --noEmit --incremental false` | 종료 코드 0 |
| `pnpm build` | 종료 코드 0 |
| `node scripts/verify-public-seo.mjs http://127.0.0.1:55893` | 공개 칼럼 18개 포함 138개 전부 통과, 종료 코드 0 |
| `git diff --check` | 종료 코드 0 |

LSP 데몬은 연결되지 않아 LSP 진단을 확보하지 못했다. TypeScript 컴파일러와 Next 프로덕션 빌드의 타입 검사는 통과했다.

## Aside 브라우저 검증

- 데스크톱 1440px: 칼럼 18개 표시, 임플란트 필터 6개, 가로 넘침 없음.
- 모바일 390px: 교정치료 필터 1개, 전체 복원 18개, 상세 페이지 이동 정상, 가로 넘침 없음.
- 데스크톱·모바일의 자연치아 정보성 이미지 5개가 로드되고 올바른 alt를 가지는 것을 DOM에서 확인했다.
- 정정된 야간진료 이미지가 실제 페이지에서 로드되고 이미지 alt와 연결되는 것을 확인했다.
- 이미지 검토자는 데스크톱 자연치아 카드의 전후 배치·크롭 보존, 데스크톱 칼럼 목록, 정정 PNG 원본의 가독성과 일치성을 확인했다.

### 모바일 시각 검수 제한

모바일 전체 화면의 시각 합격은 확정하지 못했다. 다음 세 가지 캡처 방식이 실패했다.

1. Aside `page.screenshot`: 모바일 화면이 반복 타일 형태로 저장됨.
2. CDP `Page.captureScreenshot`의 명시적 clip·scale: PNG 크기는 맞지만 화면이 확대·잘림.
3. clip 없는 `fromSurface: false` 캡처: `Unable to capture screenshot` 오류.

이는 캡처 도구의 실패이며, 애플리케이션 화면 결함으로 판정한 것이 아니다. DOM·필터·링크·HTTP 검증을 모바일 전체 시각 합격으로 대체하지 않는다.

데스크톱 유효 캡처:
`/Users/cmore/.aside/u/0/sessions/2026-09-09_ff7kTAwJ8UKYXZ9W/artifacts/`

해당 폴더 및 `2026-09-09_V0NcPT1mgf5b0fEG/artifacts/`의 모바일 캡처는 위 오류로 인해 시각 합격 증거로 사용할 수 없다.

## 비공개 칼럼 조회 보호 — 후속 수정 완료

`app/api/columns/route.ts`의 `GET ?all=1`에 저장소 조회 전 서명된 관리자 세션 검증을 추가했다. 로컬 파일·Supabase 경로 모두 같은 인증을 거친다.

- 수정 전 운영 비인증 요청: HTTP 200.
- 인증 회귀 RED: 6개 중 5개 실패, 공개 목록 검사 1개 통과.
- 운영 비인증·위조 쿠키·Googlebot User-Agent 요청: 모두 HTTP 401.
- 실제 로그인 후 관리자 전체 조회: HTTP 200, 편집용 content 포함.
- 비공개 응답: `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow`.
- 공개 목록: HTTP 200, 활성 칼럼 18개, 편집용 본문 필드 제외.

실제 로그인 검증은 비밀번호나 세션 쿠키를 출력하지 않는 다음 명령으로 수행했다.

```bash
node --env-file=.env.local scripts/verify-column-access.mjs https://egundc.com
node scripts/verify-public-seo.mjs https://egundc.com
```

## 운영 배포 결과

- `./scripts/deploy-vps.sh` 종료 코드 0. 로컬·서버 빌드 성공 및 pm2 `seoulegundc` 재시작 완료.
- `https://egundc.com/`, `https://jsdentad.mycafe24.com/`: 모두 HTTP 200.
- 백업: `/root/seoulegundc-backup-20260909-2355.tar.gz` (1,428,996,928바이트). 백업에는 비밀정보가 포함될 수 있어 공유하지 않는다.
- 칼럼 API·루트 layout·칼럼 상세·캐러셀 설정·정정 이미지의 로컬/서버 SHA-256 일치.
- 운영 공개 SEO 검사: 18개 칼럼 포함 138/138 통과.
- Aside 운영 브라우저: 공개 칼럼 18개 표시, 교정치료 필터 1개 표시 확인.
- `/.env.local`, `/.git/config`, 실제 공개 JS 청크의 `.map` 표본: HTTP 404. 빌드 설정 `productionBrowserSourceMaps: false` 확인.
- 제목·alt·canonical·공개 JSON-LD는 검색엔진과 일반 방문자 모두에게 제공한다. 공개 SEO 정보를 경쟁업체로부터 숨겼다는 의미는 아니다.

## 검색 성과 후속 확인

- Search Console의 웹 검색·대한민국·`수원치과` 검색어를 기준으로 변경 전후를 비교한다.
- Google 선택 canonical·색인 상태를 확인한다. 기술 검사 통과를 검색 1위 달성으로 보고하지 않는다.
