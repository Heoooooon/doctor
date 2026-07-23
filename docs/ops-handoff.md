# 운영 핸드오프 — 서버 접근·배포·인프라

> AI 에이전트(Claude/GJC)와 개발자가 세션에 관계없이 서버 작업을 바로 실행할 수 있도록 하는 운영 문서.
> 최종 갱신: 2026-07-23

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

새 담당자 머신에서 키 생성(이미 있으면 생략):

```bash
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub   # 이 한 줄을 기존 담당자에게 전달
```

**기존 담당자**(서버 접근 가능한 사람)가 실행:

```bash
ssh root@172.237.29.96 "echo '<새 담당자 공개키 한 줄>' >> /root/.ssh/authorized_keys"
```

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
