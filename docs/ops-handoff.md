# 운영 핸드오프 — 서버 접근·배포·인프라

> AI 에이전트(Claude/GJC)와 개발자가 세션에 관계없이 서버 작업을 바로 실행할 수 있도록 하는 운영 문서.
> 최종 갱신: 2026-08-10

## 인프라 한눈에 보기

| 항목 | 값 |
|---|---|
| VPS | `172.237.29.96` (cafe24) |
| 서비스 도메인 | **egundc.com** (실도메인), jsdentad.mycafe24.com (스테이징 겸용) |
| 앱 경로 | `/opt/seoulegundc` (appuser 홈 = 앱 디렉터리) |
| 프로세스 | pm2 `seoulegundc` (appuser 소유), `next start -H 127.0.0.1 -p 3000` |
| 리버스 프록시 | nginx — 두 도메인 모두 → `127.0.0.1:3000` |
| nginx 설정 | `/etc/nginx/sites-enabled/seoulegun.conf` (egundc.com), `/etc/nginx/sites-enabled/seoulegundc` (jsdentad) |
| SSL | Let's Encrypt (certbot 자동 갱신), 도메인별 인증서 |
| DB/스토리지 | Supabase — 테이블 `slide_popups` 등, 스토리지 버킷 `images` (public) |

## SSH 접근

```bash
ssh root@172.237.29.96
```

- **인증**: 이 Mac의 기본 키 `~/.ssh/id_ed25519`로 키 인증이 이미 설정돼 있음. 비밀번호 불필요.
- **비대화형 실행**(에이전트용): `ssh -o BatchMode=yes root@172.237.29.96 "<명령>"` — 프롬프트 없이 실패하므로 자동화에 안전.
- **pm2는 반드시 appuser로**: `ssh root@... "su - appuser -c 'pm2 ls'"` (root의 pm2에는 앱이 없음)

### 철칙

- `pm2 delete all` **절대 금지** — `seoulegundc`만 다룬다.
- rsync `--delete` 사용 시 appuser 홈 dotfile(`.pm2`, `.cache` 등) 제외 필수 — `scripts/deploy-vps.sh`의 exclude 목록 그대로 쓸 것.
- nginx 수정 전 백업 → `nginx -t` → `systemctl reload nginx` 순서 고정.

## 배포

```bash
./scripts/deploy-vps.sh
```

로컬 빌드 테스트 → 서버 백업(tar) → rsync 업로드 → 서버 빌드(pnpm) → pm2 재시작 → 헬스체크(두 도메인 200 확인)까지 한 번에 수행. 함정과 주의사항은 스크립트 상단 주석에 정리돼 있음.

## 환경변수

| 위치 | 용도 |
|---|---|
| 로컬 `.env.local` | 개발·진단용 (Supabase URL/키, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` 등) |
| 서버 `/opt/seoulegundc/.env.local` | 프로덕션 런타임 (appuser 소유, 600) |

git에는 절대 커밋하지 않음(.gitignore 처리됨). 값 변경 시 서버 파일 수정 후 `pm2 restart seoulegundc --update-env`.

## 관리자 페이지

- 주소: `https://egundc.com/admin` (비밀번호는 `ADMIN_PASSWORD` 환경변수)
- 인증: `admin-session` 쿠키 기반 (`lib/admin-auth.ts`)
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
- **2026-07-06 첫 배포**: 함정 목록은 `scripts/deploy-vps.sh` 주석 참조.

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
pnpm build                                                              # 로컬 빌드
./scripts/deploy-vps.sh                                                 # 배포 1회 성공
```

네 개 모두 통과하면 인수 완료.

### 5) AI 에이전트(Claude 등) 연동

- 이 저장소의 `AGENTS.md`가 매 세션 자동 로드되어 에이전트가 서버 구조·배포 방법을 즉시 인지한다.
- 에이전트가 실제로 서버 작업을 하려면 그 머신에 **3)의 SSH 키**와 **`.env.local`**만 있으면 된다. 별도 설정 불필요.
- 에이전트에게 "배포해줘", "서버 로그 확인해줘"라고 하면 이 문서 기준으로 실행한다.
