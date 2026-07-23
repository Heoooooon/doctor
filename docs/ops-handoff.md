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
