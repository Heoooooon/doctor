# 운영 핸드오프 — 서버 접근·배포·인프라

> AI 에이전트(Claude/GJC)와 개발자가 세션에 관계없이 서버 작업을 바로 실행할 수 있도록 하는 운영 문서.
> 최종 갱신: 2026-09-13

## 현재 상태 — 새 배포 방식은 운영 적용 대기

**2026-09-12 22:53 복구 이후 23:09 빌드로 운영이 다시 바뀐 것을 확인했다.**
홈 메타·히어로 소스가 검증된 로컬과 다르고, Google 소유권 확인 파일은 운영 디스크에서
사라졌으며 회원 관리 파일은 다시 존재한다. 실행자는 확인하지 못했다. 과거의
“복구 완료” 기록을 현재 정상 상태로 해석하지 않는다.

읽기 전용 HTTP 검사에서도 홈은 `200`이지만 Google 확인 파일은 `404`,
익명 `GET /api/columns?all=1`은 `200`(Cache-Control 없음)으로 확인됐다.
비공개 응답 본문은 기록하지 않았다. 새 스모크 검사도 Google 확인 파일 `404`를 탐지해
종료 코드 `1`로 실패했다. 화면 접근 가능 여부와 인증 보호 정상 여부는 별개다.

사용자가 검증 변경·배포 안전장치의 **커밋·푸시와 최초 운영 전환을 승인했다.**
현재는 첫 전환 실패 원인을 수정한 뒤 재전환하는 단계이며 성공한 전환으로 기록하지 않는다. 23:58 KST 점검에서 다른 배포
프로세스는 없었고 디스크 여유는 25GB였다. `--check` 성공도 운영 적용 완료를 뜻하지 않는다.

원격 `main`에 추가된 회원 관리 `4954b7e`와 원장 사진 수정 `f1a99ed`를 fast-forward로
보존해 가져왔다. 기존 로컬 수정과 겹치는 파일은 없으며 합친 작업본의 테스트 124개,
TypeScript·프로덕션 빌드를 통과했다. 과거 사고 당시의 “회원 관리 별도 보존” 기록과 구분한다.

### 첫 전환 실패 및 수정

- 웹 검증본 `25ebf1f`, 배포 안전장치 `601ff06`을 커밋·푸시한 뒤 첫 전환을 실행했다.
  백업·후보 빌드·미리보기는 통과했으나 PM2의 활성 경로 검증에서 중단됐다.
- 실제 PM2 6.0.14는 이미 존재하는 이름에 `startOrReload`를 실행하면 새 ecosystem의
  `cwd`/`script` 대신 이전 `pm_cwd`/`pm_exec_path`를 유지했다. 실제 Linux 재현에서
  메타데이터·`/proc/<pid>/cwd`·HTTP 응답 모두 이전 앱임을 확인했다.
- 전환과 복귀 모두 준비 이벤트를 먼저 구독하고, **`seoulegundc`만 제거한 뒤**
  새 고정 경로로 등록하도록 수정했다. 드리프트 검사를 완화하지 않았다.
  앱이 없는 실패 상태에서도 복귀하며 다른 PM2 앱은 건드리지 않는다.
- 수정 후 전체 테스트 126개 통과. 실제 Linux/Node 24.17.0/PM2 6.0.14 통합 검사
  3개(전환·전환 후 실패 복귀·등록 실패 복귀) 통과. 별도 앱 PID 유지도 확인했다.
  재현 대상은 `tests/deploy-remote-pm2.mts`이며 일반 단위 테스트와 구분한다.
- 실패 진단은 업로드 디렉터리의 `error.json`에 단계와 허용된 오류만 기록한다(0600).
  고정 스모크 경로(홈·릴리스 마커·Google 확인 파일·칼럼 API)의 HTTP 상태 오류도 보존한다.
  비밀 환경설정·응답 본문·임의 자산 경로·원시 PM2 출력·스택은 기록하지 않는다.
- 첫 실행의 기존 프로세스 복귀는 됐으나, 레거시의 Google404/익명 비공개API200이 남아
  복귀 건강 검사도 실패했다. 복구 완료가 아니라는 뜻이다.
- 첫 전환 전 백업:
  `/var/lib/seoulegundc-deploy/backups/1789225455177.b199cc70-e4fe-4560-a164-4510e58d8447.tar.gz`.
  로컬 사본 `/Users/cmore/Downloads/egundc-before-release-20260913.tar.gz`도 gzip 검사 통과.
  SHA-256 `cc286798679cd6819b8271c7ea3b824ed43287835ad787d9a6580338c86768de`.

검증된 로컬 작업본은 아래에 별도 보존했다. 환경설정이 포함될 수 있으므로 공개 업로드하지 않는다.

- 파일: `/Users/cmore/Downloads/seoulegun-verified-working-tree-20260912T143145116Z.tar.gz`
- 권한 `600`, gzip 무결성 검사 통과, 767,682,219바이트.
- SHA-256: `81279bbfc286f288f3ab0642c40d27183e12abec49b45790abdd58cf5f3bfd74`
- Git·`.next`·`node_modules`·에이전트 캐시 제외. DB/Storage 덤프는 아니다.

## 인프라 한눈에 보기

| 항목 | 값 |
|---|---|
| VPS | `172.237.29.96` (cafe24) |
| 서비스 도메인 | **egundc.com** (실도메인), jsdentad.mycafe24.com (스테이징 겸용) |
| 현재 레거시 앱·appuser 홈 | `/opt/seoulegundc` (최초 전환 전 경로) |
| 새 릴리스 경로 | `/opt/seoulegundc-releases/` 아래 개별 디렉터리 (최초 전환 후) |
| 공유 설정·업로드 | `/opt/seoulegundc-shared/` (최초 전환 후, 기존 파일은 복사·보존) |
| 배포 기준 기록 | `/var/lib/seoulegundc-deploy/state.json` (최초 성공 후) |
| 프로세스 | pm2 `seoulegundc` (appuser 소유), `next start -H 127.0.0.1 -p 3000` |
| 리버스 프록시 | nginx — 두 도메인 모두 → `127.0.0.1:3000` |
| nginx 설정 | `/etc/nginx/sites-enabled/seoulegun.conf` (egundc.com), `/etc/nginx/sites-enabled/seoulegundc` (jsdentad) |
| SSL | Let's Encrypt (certbot 자동 갱신), 도메인별 인증서 |
| DB/스토리지 | Supabase — 테이블 `slide_popups` 등, 스토리지 버킷 `images` (public) |
| 코드 저장소 | `Heoooooon/doctor` (이 저장소, 운영 전용). 템플릿 솔루션은 `Heoooooon/dental-solution`, 제안 자료는 `Heoooooon/dental-portfolio`로 분리 (2026-09-04) |

## SSH 접근

```bash
ssh root@172.237.29.96
```

- **인증**: 이 Mac의 기본 키 `~/.ssh/id_ed25519`로 키 인증이 이미 설정돼 있음. 비밀번호 불필요.
- **비대화형 실행**(에이전트용): `ssh -o BatchMode=yes root@172.237.29.96 "<명령>"` — 프롬프트 없이 실패하므로 자동화에 안전.
- **pm2는 반드시 appuser로**: `ssh root@... "su - appuser -c 'pm2 ls'"` (root의 pm2에는 앱이 없음)

### 철칙

- `pm2 delete all` **절대 금지** — `seoulegundc`만 다룬다.
- 운영 폴더에 rsync `--delete`를 실행하거나 그 안에서 빌드하지 않는다. 예전 스크립트 복사본도 금지.
- appuser 홈의 `.pm2`, `.ssh`, 캐시·프로필을 제거하거나 앱 경로와 함께 교체하지 않는다.
- 새 스크립트의 서버 잠금은 같은 스크립트끼리만 배포를 직렬화한다. root의 수동 rsync·pm2 재등록을
  막는 권한 통제는 아니다. 다른 작업창·자동화의 배포를 중단하고 담당 경로를 하나로 정한 뒤 전환한다.
- nginx 수정 전 백업 → `nginx -t` → `systemctl reload nginx` 순서 고정.

## 배포

```bash
# 서버를 변경하지 않는 Git 사전 확인. 빌드·운영 검증을 대신하지 않는다.
./scripts/deploy-vps.sh --check

# 최초 전환이 끝난 뒤, 승인된 일반 배포
./scripts/deploy-vps.sh
```

### 배포 전 조건

- 저장소 `Heoooooon/doctor`, 브랜치 `main`, 변경·미추적 파일 없음, fetch가 성공하고
  `HEAD == origin/main`이어야 한다. 오래된 커밋·미푸시 커밋·다른 저장소는 차단한다.
- 현재 검증 변경을 **stash/삭제해서 조건만 맞추지 않는다.** 기존 미커밋 SEO·인증·성능 수정,
  최적화 자산, `public/googlec8eaf265de8ba751.html`을 검토하고 승인받아 먼저 커밋·푸시한다.
  다른 작업은 원격 커밋·보존본과 비교해 검토하고, 이미 승인된 원격 변경을 임의로 제거하지 않는다.
- 로컬 전체 테스트·빌드를 통과한 뒤 Git 상태와 원격 main을 재검사한다. 업로드는 그 커밋의
  `git archive`만 사용한다. 로컬 `.next`, 의존성, 비밀 환경설정, 편집 중인 파일은 업로드하지 않는다.
- fetch 이후와 아카이브 준비 후 첫 SSH 직전에 작업본·브랜치·고정 HEAD를 다시 확인한다.
  편집기를 원자적으로 잠그는 기능은 아니므로 배포 중 같은 체크아웃을 편집하지 않는다.
  검사 이후의 편집도 고정된 커밋 아카이브에 섞이지는 않는다.
- 강제 배포·미커밋 허용 옵션은 없다. 서버 기준 기록이 없으면 일반 배포는 실패한다.

### 서버 단계

1. 격리된 업로드 경로로 소스 아카이브·SHA-256·커밋/트리·조상 목록을 전달한다.
2. 서버 전역 `flock`을 획득하고 현재 릴리스의 커밋·파일·실행 경로를 검증한다.
   현재 커밋을 포함하지 않는 과거/분기 작업본, 실행 경로 불일치, 무단 파일 변경은 덮어쓰지 않는다.
3. 현재 소스·빌드·설정을 백업하고 무결성을 검사한다. 백업 실패는 즉시 중단한다.
4. 새 릴리스 디렉터리에만 압축을 풀고 서버 환경설정·업로드를 연결한다.
   `pnpm install --frozen-lockfile --prod=false`와 서버 빌드는 그 안에서만 실행한다.
5. 별도 loopback 포트에서 후보 앱을 실행해 검증한 뒤, pm2 `seoulegundc`의
   실행 경로를 해당 릴리스의 **고정된 절대 경로**로 바꾼다. nginx 포트 `3000`은 유지한다.
6. 실제 서비스에서도 검증하고, 실패하면 이전 pm2 설정으로 복귀를 시도한다.
   복귀 검사까지 실패하면 실패 사실을 보고하며 배포 완료로 처리하지 않는다.
7. 성공한 뒤에만 배포 기준 기록을 갱신한다. 이전 릴리스·백업은 보존한다.

홈 200만으로 성공 판정하지 않는다. 홈 참조 CSS/JS·로컬 미디어, canonical/index 설정,
Google 확인 파일 원문, 익명 비공개 칼럼 조회 `401` 및 `private, no-store`,
공개 칼럼 목록을 검사한다. 새 릴리스의 `/__release.txt`에는 비밀값 없이 JSON `{ "commit": "<40자리 SHA>" }`를 담아
두 도메인이 실제로 배포 대상 커밋을 제공하는지도 검사한다. jsdentad nginx의 `.json` 파일 URL 차단을
유지하기 위해 경로만 `.txt`로 사용하며 JSON 파싱·`expectedCommit` 일치 검사는 그대로 유지한다.

검사 도구는 별도로 읽기 전용 실행할 수 있다.

```bash
node scripts/deploy-smoke.mjs https://egundc.com
node scripts/deploy-smoke.mjs https://jsdentad.mycafe24.com
# 첫 전환 후에는 두 번째 인수로 승인한 40자리 커밋 SHA를 전달해 버전까지 검사한다.
```

### 최초 전환 — 별도 승인 후 한 번만

1. 다른 작업창·자동 배포를 중단하고 운영 불일치·회원 관리 변경을 보존한다.
   현재 서버가 이미 퇴행한 상태이므로 “서버 내용을 최신 코드로 가져오기”를 하지 않는다.
2. 검증된 로컬 변경과 배포 안전장치를 리뷰·커밋·푸시하여 최신 `main`에 고정한다.
   사용자에게 커밋 SHA, 보존본, 변경 범위, 첫 전환 시 짧은 재시작 구간을 제시한다.
3. 사용자 승인 후 `./scripts/deploy-vps.sh --bootstrap`을 실행한다. 레거시 실행 설정과
   데이터를 보존한 뒤 첫 릴리스를 만든다. appuser 홈은 그대로 두고 실행 앱만 분리한다.
4. 새 프로세스 경로·두 도메인·Google 확인 파일·칼럼 접근 보호·릴리스 SHA를 확인한 뒤
   이 문서의 “운영 적용 대기” 상태를 실제 결과로 갱신한다.

새 구조는 옛 스크립트가 `/opt/seoulegundc`를 덮더라도 활성 릴리스 파일과 분리되지만,
root가 pm2를 이전 경로로 재등록하거나 새 릴리스를 직접 수정하는 것까지 막지는 않는다.
이를 강제로 차단하려면 전용 배포 계정·SSH 키 권한 제한이 별도 필요하며, 현재 적용된 것으로 간주하지 않는다.

### 실패·복구 및 디스크 관리

- 백업·설치·빌드·후보 검사 실패: 기존 활성 릴리스를 유지한다. 잠금/기준 불일치를
  우회하지 말고 실행 경로·작업자·커밋부터 대조한다.
- 활성화 이후 실패: 스크립트가 보존한 이전 pm2 설정으로 복귀하고 다시 검사한다.
  첫 전환의 이전 앱 자체가 이미 잘못된 상태라면 복귀가 “정상 복구”를 뜻하지 않는다.
- 이미 성공한 버전을 되돌릴 때는 이전 커밋을 그대로 강제 배포하지 않는다.
  필요한 변경의 revert를 검토·승인한 새 커밋을 main에 반영한 뒤 같은 진입점으로 배포한다.
- 백업과 실패한 후보를 무조건 자동 삭제하지 않는다. 디스크 여유가 부족하면 새 배포를 멈추고,
  활성·이전 릴리스와 사고 보존본을 식별한 뒤 오래된 실패 후보/업로드/백업의 정리를 별도로 승인받는다.
  2026-09-05 디스크 부족 사고가 있으므로 정리 없이 계속 누적시키지 않는다.

### 재발 방지 코드의 검증 결과 — 운영 적용과 구분

- 전체 `node --test tests/*.test.mts`: **124/124 통과**.
- 네트워크를 끈 격리 Linux/Node 24.17.0 컨테이너의 서버 엔진 테스트:
  **34/34 통과**, 실제 `flock` 중복 획득 거부·해제 후 재획득 포함.
  파일·tar/gzip·로그 이벤트는 실제 자원을 사용하고, pm2/설치/빌드 호출은 격리 테스트 대역이다.
- `pnpm exec tsc --noEmit --incremental false`, `pnpm build`, 변경 코드 진단·문법 검사 통과.
- 실제 로컬 Next 프로덕션 앱을 임시 포트에서 실행한 스모크:
  HTTP 검사 **171개**, 정적 자산 **167개**, 공개 칼럼 **18개**, Google 확인 파일·익명 접근 보호 통과.
  검사 후 임시 프로세스 종료. 이 검사는 운영 전환이나 실제 pm2 교체 검증을 대신하지 않는다.
- 기존 스크립트의 미커밋 배포 허용, fetch/아카이브 중 작업본 변경 누락,
  반응형 이미지 후보 검사 누락을 실패 테스트로 확인한 뒤 수정했다.
- 병행 전체 검사에서 드러난 시작 로그 이벤트 누락은 로그 파일 자체를 감시하도록 수정했다.
  고정 대기·폴링·시간 제한 완화 없이 재검증했으며, 로그 교체·잘림은 실패로 처리한다.
- `./scripts/deploy-vps.sh --check` 실제 실행은 현재 미커밋 변경을 감지해 서버 접속 전에
  종료 코드 `1`로 차단한다. 이는 의도한 보호 동작이며, 변경을 삭제해서 통과시키지 않는다.
- 원래 검증된 핵심 소스 5개와 Google 확인 파일의 SHA-256은 이번 작업 전과 동일하다.
  `AGENTS.md`와 `CLAUDE.md`도 같은 운영 기준을 참조하도록 정리했다.

## 환경변수

| 위치 | 용도 |
|---|---|
| 로컬 `.env.local` | 개발·진단용 (Supabase URL/키, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` 등) |
| 전환 전 `/opt/seoulegundc/.env.local` | 프로덕션 설정 (appuser 소유, 600) |
| 전환 후 `/opt/seoulegundc-shared/.env.local` | 새 릴리스에서 참조하는 프로덕션 설정 (appuser 소유, 600) |

git에는 절대 커밋하지 않음(.gitignore 처리됨). 값 변경 시 서버 파일 수정 후 `pm2 restart seoulegundc --update-env`.

## 관리자 페이지

- 주소: `https://egundc.com/admin` (비밀번호는 `ADMIN_PASSWORD` 환경변수)
- 인증: `admin-session` 쿠키 — `ADMIN_PASSWORD`로 서명한 HMAC 토큰(8시간 만료). 검증 `lib/admin-session.ts`, 가드 `lib/admin-auth.ts`·`proxy.ts`. 기본 비밀번호 없음(미설정 시 503).
- 의료진 관리: `/admin/clinicians` — 소개 페이지(`/about`) 의료진 등록·수정·삭제·순서·공개 여부. 저장 즉시 반영.
- 슬라이드 팝업: `/admin/popups` — 등록 즉시 홈 인트로 종료 후 슬라이드 팝업으로 노출. 2개 이상 활성 시 화살표+도트 슬라이드(자동 넘김 없음).

## 자주 쓰는 진단 명령

```bash
# 앱 상태
ssh -o BatchMode=yes root@172.237.29.96 "su - appuser -c 'pm2 ls'"
# 앱 로그
ssh -o BatchMode=yes root@172.237.29.96 "su - appuser -c 'pm2 logs seoulegundc --lines 50 --nostream'"
# nginx 에러 로그
ssh -o BatchMode=yes root@172.237.29.96 "tail -50 /var/log/nginx/seoulegundc_error.log"
# 서비스 헬스체크
curl -s -o /dev/null -w '%{http_code}\n' https://egundc.com/
curl -s https://egundc.com/api/popups
```

## 운영 이력·롤백

아래는 당시의 실행 이력이다. 과거 tar 복원·직접 빌드·pm2 조작 명령을 현재 배포 절차로
재사용하지 않는다. 현재 기준은 위의 배포·최초 전환·복구 절차이며, DB 삭제는 코드 복구에 포함하지 않는다.

- **2026-09-12 23:09 재덮어쓰기 확인, 안전 배포 방식 로컬 준비**
  - pm2 생성 시각 `2026-09-12T14:09:28.254Z`, 재시작 횟수 22.
    `.next/BUILD_ID` 수정 시각 `23:09:23 KST`.
  - `app/layout.tsx` SHA-256은 `7f4170c3b77a14a5508d9ef7f2cdb9bace0c30055ab630babb0b1072eae93b8f`,
    `heroSlides.ts`는 `fc08bb979c1f38b280a77748aa0bb0856b72eb0d57c82a399f779a4147c1d30e`.
    검증된 로컬과 다르며 운영 Google 확인 파일은 없고 `app/admin/members/page.tsx`는 다시 존재한다.
  - 사용자에게 다른 배포 경로 중단 필요성을 알림. 재발 방지 작업에서는 운영 재배포를 하지 않음.

- **2026-09-12 22시대 소스 덮어쓰기 복구 및 Search Console 소유권 확인**
  - 22:23 백업의 핵심 소스는 최적화 작업본과 일치했으나, 이후 운영 디스크의 홈·메타·미디어·팝업 소스가 Git HEAD `3e7bfea`의 이전 내용으로 바뀐 것을 확인했다. 회원 관리 관련 별도 파일 3개도 추가돼 있었다. 실행자는 확인하지 못했다.
  - pm2는 19:52 프로세스를 유지한 채 빌드·정적 파일이 달라져, 홈 HTML은 200이지만 참조 CSS/JS·최적화 자산이 500을 반환했다.
  - 진행 중 Google 확인 파일 배포는 업로드 전 백업 단계에서 중단했다.
  - 사용자 승인 후 별도 작업을 `/root/egundc-pre-recovery-20260912T134547Z.tar.gz`에 보존하고 Downloads에 동일 이름 사본을 저장했다(권한 600). gzip 무결성 및 양쪽 SHA-256 일치:
    `e5161010f7f5d9af4de56673c492fe6a345447ff9b2b3958d92e9483295d83d5`.
  - 이 보존본은 현재 서버 소스·설정·공개 자산이며 node_modules, .next, pm2와 캐시는 제외했다. 회원 관리 별도 변경은 검증된 작업본에 임의 병합하지 않고 보존본에 남겼다. 이번 복구에서는 DB를 수정하지 않았다.
  - `./scripts/deploy-vps.sh`로 검증된 최신 로컬 작업본을 복구 배포했다. 종료 코드 0, pm2 PID 815629로 재시작, 두 서비스 도메인 200.
  - 홈의 CSS/JS 참조 12개와 최적화 영상·이미지·폰트 3개 모두 200으로 복구. 주요 소스 해시 일치, 테스트 49/49, 운영 SEO 138/138, 공개 목록 18개, 비공개 조회 익명/위조/봇 401 및 정상 관리자 200 확인.
  - `seoulegunpub@gmail.com`에서 URL 접두어 속성 **`https://egundc.com/`**의 HTML 파일 소유권 확인 완료. Google의 “소유권이 확인됨”과 해당 속성 개요 접근을 확인했다.
  - **삭제 금지:** `public/googlec8eaf265de8ba751.html`. 운영 URL `https://egundc.com/googlec8eaf265de8ba751.html`은 200이며 Google 다운로드 원문의 확인 문자열을 제공한다. 기존 HTML 메타 확인 태그는 보존했다.
  - Git에 커밋되지 않은 검증 변경이 있으므로 다른 체크아웃이나 Git HEAD만으로 재배포하면 SEO·성능·인증 수정이 사라질 수 있다. 이 복구에서도 코드 커밋·푸시는 하지 않았다.

- **2026-09-12 Lighthouse 최적화 운영 배포**
  - 사용자가 로컬 버전을 확인한 후 백업·배포를 승인. 기존 인트로·팝업·6개 슬라이드·네이버 블로그 퍼널 유지.
  - 배포 전 원본 백업: `/root/seoulegundc-backup-20260912T104257Z-pre-performance.tar.gz`.
  - 로컬 사본: `/Users/cmore/Downloads/seoulegundc-backup-20260912T104257Z-pre-performance.tar.gz` (권한 600).
  - 크기 1,434,826,074바이트. 두 사본의 gzip 무결성과 SHA-256 일치 확인:
    `011ee6ef135a7696829e702d2fba16e03aee10a3a031a2f5d281b00713182448`.
  - 백업 범위: 앱 디렉터리의 코드·빌드·환경설정 등 파일. 변동 캐시·pm2 로그는 제외했으며 외부 Supabase DB/Storage의 별도 덤프는 아니다. 이번 배포에 DB 변경은 없다.
  - `./scripts/deploy-vps.sh` 종료 코드 0. 로컬·서버 빌드 성공, pm2 `seoulegundc` 재시작, 두 도메인 HTTP 200.
  - 배포 전 테스트 49/49와 TypeScript 통과. 운영 SEO 138/138, 공개 칼럼 18개, 미인증/위조/봇 이름 비공개 조회 401, 정상 관리자 200.
  - 운영 브라우저: 팝업 3개 이미지 치수와 44px 버튼·닫기, 6슬라이드 표시, 칼럼 목록과 교정치료 필터 확인.
  - 최적화 이미지·영상·폰트 HTTP 200 및 주요 소스/자산 6개 로컬·서버 해시 일치.
  - 운영 Lighthouse 단회: 모바일 74/100/100/100, 데스크톱 85/100/100/100 (성능/접근성/권장사항/SEO). 안정적 네 항목 100점 목표는 미달.
  - 운영 검증 완료: 2026-09-12 19:55 KST. 코드 커밋·푸시는 별도로 하지 않았다.
  - 상세 측정: `docs/lighthouse-progress-2026-09-12.md`.

- **2026-09-10 SEO·이미지 alt 및 비공개 칼럼 조회 보호 배포**
  - 사용자 승인 후 `./scripts/deploy-vps.sh`로 배포. 종료 코드 0, 두 서비스 도메인 HTTP 200.
  - 홈 검색 정보 정리, 정보성 이미지 alt, 야간진료 이미지 오기 정정, 공개 칼럼 서버 링크·개별 메타·BlogPosting·사이트맵 연결.
  - `/api/columns?all=1`은 관리자 서명 세션 필수. 비인증·위조 쿠키·봇 이름 요청 401, 실제 로그인 후 200. 비공개 응답은 `private, no-store`와 `noindex, nofollow`.
  - 검증: 테스트 29개, TypeScript, 로컬·서버 빌드 통과. 운영 공개 SEO 138/138, 공개 칼럼 18개와 분류 필터 확인.
  - 배포본은 이 작업의 로컬 변경 파일을 포함한다. 별도 git 커밋·푸시는 하지 않았다.
  - 백업: `/root/seoulegundc-backup-20260909-2355.tar.gz`. 이전 코드 복원 시 전체 조회 API의 인증 누락도 되돌아가므로 해당 보안 수정은 보존해야 한다.
  - 상세 증거 및 모바일 캡처 도구의 미해결 제한: `docs/seo-verification-2026-09-09.md`.

- **2026-09-05 디스크 풀 장애 (egundc.com/about 500) — 배포 백업 무제한 누적**
  - 증상: `https://egundc.com/about` `500 Internal Server Error`. pm2 로그에 `ChunkLoadError`/`MODULE_NOT_FOUND`(`.next/server/chunks/ssr/*.js` 누락), 이어서 `ENOSPC: no space left on device, mkdir '/opt/seoulegundc/.next'`.
  - 원인: `scripts/deploy-vps.sh`가 배포마다 `/root/seoulegundc-backup-*.tar.gz`를 생성하지만 정리 로직이 없었음. 2026-07-06 첫 배포부터 누적되어 19개(35GB)가 쌓였고 49GB 디스크가 100% 사용률에 도달. 그 상태에서 진행된 배포의 서버 빌드가 디스크 부족으로 중간에 끊겨 `.next`가 손상됨(청크 파일 누락) → 모든 요청이 500.
  - 조치:
    1. `ssh root@172.237.29.96 "df -h"`로 100% 확인 → `du -sh /root/*.tar.gz`로 백업이 35GB인 것 확인.
    2. 오래된 백업 17개 삭제, 최근 2개만 보존 (`/root/seoulegundc-backup-20260905-1248.tar.gz`, `-1254.tar.gz`) → 디스크 100% → 33%(32GB 여유) 확보.
       - **주의**: 이 정리로 2026-09-04 CMS 배포 롤백용으로 남겨뒀던 `seoulegundc-backup-20260904-1415.tar.gz`도 함께 삭제됨. 그 시점으로 되돌려야 한다면 tar 백업이 아니라 `git revert 24ea302 59e384f` 방식만 사용 가능.
    3. `su - appuser -c 'cd /opt/seoulegundc && rm -rf .next && NODE_OPTIONS=--max-old-space-size=1536 pnpm build'`로 손상된 `.next` 삭제 후 재빌드.
    4. `pm2 restart seoulegundc --update-env && pm2 save`.
  - 검증: `egundc.com/`, `egundc.com/about`, `jsdentad.mycafe24.com` 전부 200. `egundc.com/admin/clinicians` 307(미인증 리다이렉트, 정상). pm2 CPU 100% → 0%.
  - 재발 방지: `scripts/deploy-vps.sh` 2단계에 백업 직후 `ls -1t seoulegundc-backup-*.tar.gz | tail -n +6 | xargs -r rm`을 추가해 항상 최근 5개만 유지하도록 변경. 이후 배포부터는 백업이 무제한 누적되지 않음.
  - 운영 팁: 디스크 사용률은 `ssh root@172.237.29.96 df -h /`로 언제든 확인 가능. 80% 넘으면 `/root/*.tar.gz` 개수부터 의심할 것.

- **2026-09-04 의료진 CMS 도입 + 관리자 인증 강화 + 저장소 분리 (배포 완료)**
  - 배포 커밋: `59e384f` feat(admin) 의료진 CMS와 공개 연동 추가, `24ea302` security(admin) 관리자 세션 서명 검증 적용. 운영 반영 `./scripts/deploy-vps.sh`, 두 도메인 200.
  - 서버 백업: `/root/seoulegundc-backup-20260904-1415.tar.gz` (`.env.local` 포함)

  **1) 의료진 CMS**
  - 새 Supabase 테이블 `doctors` (`supabase/migrations/20260903_doctors.sql`). 기존 정적 의료진 5명을 초기 데이터로 시드했고 운영 DB에 적용 완료(활성 5명).
  - 관리자 `/admin/clinicians`: 등록·수정·삭제, 프로필 사진 업로드(Supabase Storage `images/clinic`), 노출 순서, 공개/비공개, 카드 확대 배율·세로 이동, 상세 사진 맞춤(원본 비율/잘라내기), 학력·경력·학회·한마디 편집.
  - 공개 `/about`: DB의 활성 의료진만 `sort_order` 순으로 렌더링. DB 조회 실패 시에만 `data/doctors.ts` 정적 데이터로 fallback (의도적으로 전원 비공개한 경우 빈 목록 유지).
  - API: `GET/POST /api/clinicians`, `PATCH/DELETE /api/clinicians/[id]` — 관리자 인증 필수, 변경 시 `/about` revalidate.
  - 관리자 메뉴에 "의료진 관리" 추가. 기존 정적 `data/doctors.ts`는 fallback 용도로 유지(더 이상 편집 대상 아님).
  - 접근성·반응형: 편집/삭제 모달 포커스 트랩·Escape·포커스 복원, 모바일 관리자 상단 메뉴 겹침 해소, 의료진 카드 포커스 링, 확대 카드 이미지 해상도 보정, 모바일 `/about` 앵커 활성 탭 가시 유지, 모바일 `/about`에서 상담 FAB 숨김(헤더 전화 버튼으로 대체).

  **2) 관리자 인증 강화**
  - 코드에 하드코딩돼 있던 기본 비밀번호(`egun2024`)와 개발 환경 인증 우회(`NODE_ENV !== 'production'`)를 제거. 비밀번호는 서버 `ADMIN_PASSWORD`만 유효하며 미설정 시 로그인 503.
  - 세션 쿠키를 고정 문자열에서 HMAC-SHA256 서명 토큰으로 교체(8시간 만료, 위조·만료 토큰 거부). 쿠키 `HttpOnly; Secure; SameSite=Lax`.
  - **⚠ 후속 조치 필요**: 서버 `ADMIN_PASSWORD`가 과거 코드에 하드코딩돼 GitHub 이력에 남아 있는 `egun2024`와 동일함. 새 강한 값으로 변경 후 `pm2 restart seoulegundc --update-env` 권장. 변경 시 로컬 `.env.local`도 동일하게 갱신.
  - 운영 검증: 익명·위조 쿠키 API 401, 미인증 `/admin` → `/admin/login` 307, 정상 로그인 200, 의료진 API 5명 정상.

  **3) 저장소 분리**
  - 이 저장소(`Heoooooon/doctor`)는 **서울이건치과 운영 전용**으로 유지. 템플릿 제품화·타 고객 작업은 분리함.
  - `Heoooooon/dental-solution` (private): 치과 홈페이지 판매용 템플릿 솔루션. 사이트 설정 계약(`template/`), 고객별 설정(`clinics/{seoulegun,test,centum365}`), 홈 프리셋 5종(`components/presets/`), 검증 테스트 110건. 이 저장소의 운영 문서·배포 스크립트·릴리스 이력은 포함하지 않음.
  - `Heoooooon/dental-portfolio` (private): 고객 제안 자료(센텀365 제안 보드·PDF·콘셉트 이미지). 대용량 바이너리라 코드와 분리.
  - 작업 흐름: 솔루션의 공통 개선 → 이 저장소에는 필요한 변경만 골라 별도 커밋. 서울이건치과 콘텐츠 변경 → 솔루션에는 `clinics/seoulegun/site.ts`만 갱신.

  **검증 요약**
  - 테스트 12/12, TypeScript, 프로덕션 빌드, LSP 통과. 로컬 프로덕션 빌드에서 비공개 QA 의료진 생성→수정→삭제 및 공개 페이지 비노출 확인 후 정리(운영 DB 잔여 없음, 5명 유지).
  - 데스크톱 1440/1280, 모바일 375 브라우저 QA 및 독립 시각 검토 2회 PASS.

  **롤백**
  - 코드: `git revert 24ea302 59e384f` 후 `./scripts/deploy-vps.sh`. 또는 서버에서 `/root/seoulegundc-backup-20260904-1415.tar.gz` 복원 후 `pm2 restart seoulegundc`.
  - DB: `doctors` 테이블은 이전 코드가 참조하지 않으므로 코드 롤백만으로 충분. 삭제가 필요하면 `drop table public.doctors;`.

- **2026-08-10 모바일 메인 2번째 의료진 이미지 교체**
  - 대상 기능: 메인 페이지 모바일 `DoctorGroup` 섹션. 관리자 `/admin/sections`의 의료진 섹션 설정을 사용함.
  - 원본: `KakaoTalk_Photo_2026-08-10-11-38-42.png` (`3375×5531`, PNG, 약 5.9MB).
  - 처리:
    - 기존 이미지 비율과 동일하게 `1080×1770` WebP로 축소하고 메타데이터를 제거함.
    - 밝은 스튜디오 배경 위 흰색 카피의 가독성을 위해, 서브카피 아래까지 유지되고 의료진 머리 위에서 끝나는 수직 그라데이션을 이미지 상단에 적용함.
    - 최종 파일은 `83,944 bytes`이며 Admin 권장 기준인 `1080×1770`, 300KB 이하를 충족함.
  - 업로드 경로: 관리자 인증이 필요한 `POST /api/upload`, Supabase Storage `images/clinic`.
  - 최종 공개 URL:

    ```text
    https://hjtswzfdgphqvjvdogej.supabase.co/storage/v1/object/public/images/clinic/1786332218485-km8qd7.webp
    ```

  - 연결: `PUT /api/section-settings`로 `doctor-group.mobile_image`만 교체. 데스크톱 이미지와 카피 설정은 유지함.
  - 운영 반영: 홈 ISR 갱신 후 Next Image가 최종 URL을 `390×639`로 정상 렌더링하는 것을 실제 브라우저에서 확인함.
  - 모바일 QA (`390×844`):
    - 의료진 5명의 순서·구도·얼굴 밝기 유지, 인물·텍스트 잘림과 겹침 없음.
    - 헤드라인 대비 `9:1` 이상.
    - 18px 서브카피 대비 `4.77:1~5.5:1`로 WCAG AA `4.5:1` 통과.
    - 한글 줄바꿈과 CTA 배치 정상.
  - 정리: 작업 중 생성한 Supabase 중간 이미지 3개와 로컬·브라우저 QA 임시 파일을 삭제하고 최종 이미지 한 개만 유지함.
  - 코드 배포 없음: 기존 Admin/Supabase 설정 경로만 사용했으며 애플리케이션 코드는 변경하지 않음.

- **2026-08-10 네이버 블로그 임포트 504 타임아웃 조치**
  - 대상 기능: 관리자 `/admin/columns` → `칼럼 추가` → `네이버 블로그`
  - 요청 경로: `POST /api/columns/import-naver`
  - 증상: 2026-08-06, 2026-08-07 운영 요청이 nginx `504 Gateway Timeout`으로 실패. nginx 오류 로그에는 `upstream timed out while reading response header from upstream`이 기록됨.
  - 원인: Next.js 라우트는 `maxDuration = 300`으로 최대 300초 처리를 허용하지만, nginx에는 별도 `proxy_read_timeout`이 없어 기본 60초에 upstream 연결을 종료함.
  - 외부 서비스 확인:
    - 네이버 모바일 블로그 HTML은 동일 User-Agent와 추출 규칙으로 `200` 응답 및 본문·이미지 추출 정상.
    - 운영 서버의 OpenAI API 인증 및 연결도 `200` 응답.
    - 로컬과 운영 서버의 `app/api/columns/import-naver/route.ts` 체크섬 일치.
  - 적용 설정: `/etc/nginx/sites-enabled/seoulegun.conf`에 임포트 API 전용 exact-match location을 추가함.

    ```nginx
    location = /api/columns/import-naver {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
    ```

  - 적용 절차: 원본 백업 → `nginx -t` 성공 확인 → `systemctl reload nginx` → `systemctl is-active nginx`의 `active` 확인.
  - 검증:
    - 최신 공개 네이버 글 임포트: `58.9초`, HTTP `200`.
    - 긴 공개 네이버 글 임포트: `67.3초`, HTTP `200` — 기존 60초 제한을 넘겨 정상 완료됨.
    - QA 중 Supabase에 업로드된 이미지 12장은 응답 확인 직후 모두 삭제.
    - 실제 브라우저에서 관리자 원장칼럼 추가 모달과 `네이버 블로그` 버튼 노출 확인.
    - 최종 헬스체크: 홈페이지 `200`, 관리자 페이지 인증 리다이렉트 `307`, nginx `active`.
  - 백업: `/root/seoulegun.conf.bak-20260810-naver-timeout`
  - 롤백:

    ```bash
    cp -p /root/seoulegun.conf.bak-20260810-naver-timeout /etc/nginx/sites-enabled/seoulegun.conf
    nginx -t && systemctl reload nginx
    ```

- **2026-07-23 egundc.com 도메인 전환**: nginx `seoulegun.conf`의 proxy_pass를 3001 → 3000으로 변경해 실도메인을 신규 앱에 연결. 구버전 앱(pm2 `seoulegun`, 포트 3001)은 pm2에서 제거.
  - nginx 백업: `/root/seoulegun.conf.bak-20260723-*`
  - 구버전 파일 보존: `/var/www/seoulegun` (안정화 확인 후 삭제 예정)
  - 롤백: 백업 conf 복원 + `nginx -t && systemctl reload nginx` + `/var/www/seoulegun/current`에서 구앱 재기동
- **2026-07-06 첫 배포**: appuser 홈과 앱 경로가 같아 rsync가 pm2 상태·프로필을 지울 수 있었음.
  새 릴리스 방식에서는 홈을 배포 대상으로 사용하지 않는다.

## 인수인계 온보딩 (새 담당자용)

이 저장소를 clone한 뒤, 아래 순서대로 진행하면 개발·배포·서버 운영 전부 가능해진다.

### 1) 이전 담당자에게 받아야 할 것

| 항목 | 전달 방법 |
|---|---|
| GitHub 저장소 권한 | `Heoooooon/doctor` collaborator 초대 |
| `.env.local` 내용 | **보안 채널로만** (1Password, 시그널 등. 카톡/이메일/git 금지) |
| Supabase 프로젝트 권한 | Supabase 대시보드 → 프로젝트 멤버 초대 |
| VPS 호스팅 계정 | `172.237.29.96` 콘솔 접근 계정 (재부팅·방화벽·과금 관리용) |
| 도메인 관리 권한 | egundc.com DNS 등록기관 계정 |
| 관리자 비밀번호 | `.env.local`의 `ADMIN_PASSWORD` (사이트 /admin 로그인) |

`.env.local` 필수 키: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `OPENAI_API_KEY`, `OPENAI_COLUMN_MODEL`, `ADMIN_PASSWORD`

### 2) 로컬 셋업

```bash
git clone https://github.com/Heoooooon/doctor.git seoulegun && cd seoulegun
pnpm install
# 전달받은 .env.local을 프로젝트 루트에 저장
pnpm dev   # http://localhost:3000 확인
```

### 3) SSH 접근 등록

서버에 root 비밀번호 로그인이 열려 있으므로 **새 담당자가 직접 등록**한다 (root 비밀번호는 이전 담당자에게 전화 등으로 받기):

```bash
ssh-keygen -t ed25519           # 키 생성 (이미 있으면 생략, 엔터만 계속)
ssh-copy-id root@172.237.29.96  # root 비밀번호 입력 → 내 키 자동 등록
ssh root@172.237.29.96          # 이후 비밀번호 없이 접속되면 성공
```

등록 후 보안 정리(권장): root 비밀번호 변경(`passwd`), 이전 담당자 키가 더 이상 필요 없으면 `/root/.ssh/authorized_keys`에서 해당 줄 삭제.

### 4) 인수 검증 체크리스트

```bash
ssh -o BatchMode=yes root@172.237.29.96 "hostname"                      # SSH 접속
ssh -o BatchMode=yes root@172.237.29.96 "su - appuser -c 'pm2 ls'"      # 앱 상태
pnpm build                                                         # 로컬 빌드
./scripts/deploy-vps.sh --check                                     # 커밋·원격 main 검사
```

읽기 전용 인수 점검 후, 승인된 배포에서 두 도메인 스모크·활성 릴리스 일치까지 확인해야 인수 완료다.
서버 기준 기록이 없는 최초 전환은 위의 `--bootstrap` 절차를 따른다.

### 5) AI 에이전트(Claude 등) 연동

- 이 저장소의 `AGENTS.md`가 매 세션 자동 로드되어 에이전트가 서버 구조·배포 방법을 즉시 인지한다.
- 에이전트가 실제로 서버 작업을 하려면 그 머신에 **3)의 SSH 키**와 **`.env.local`**만 있으면 된다. 별도 설정 불필요.
- 에이전트에게 "배포해줘", "서버 로그 확인해줘"라고 하면 이 문서 기준으로 실행한다.
