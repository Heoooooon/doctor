# 서울이건치과 백오피스(관리자 CMS) 기획서

> 작성일: 2026-06-29
> 목적: 현재 코드에 하드코딩된 홈페이지 콘텐츠를 **관리자가 직접 수정**할 수 있도록 백오피스를 전면 CMS화하고, **다중 계정·권한 체계**를 도입하기 위한 기획서.
> 대상 독자: 개발자(구현), 원장·실장(운영 의사결정).

---

## 0. 2026-06-30 조사 반영 최종 결정

> 이 섹션은 `ulw-research` 결과를 반영한 **결정 레이어**다. 아래 본문과 충돌하면 이 섹션을 우선한다.

### 0.1 채택한 기본 방향

1. **백오피스는 공개 홈페이지처럼 보이지 않게 만든다.** 히어로·마케팅 카드 중심이 아니라, 상담 응대·검토 대기·최근 변경·발행 상태를 한눈에 보는 조용하고 밀도 있는 운영 도구로 설계한다.
2. **직접 발행은 저위험 운영 공지에만 허용한다.** 휴진·진료시간 임시 변경·주차 안내처럼 치료 효과, 가격, 후기, 전후 사진, 전문의 자격, 비교 표현이 없는 사실 안내만 `manager` 이상 직접 발행할 수 있다. 치료 콘텐츠, 증례/전후 사진, 칼럼, 의료진 자격 표기, 가격·이벤트성 문구, 히어로/미디어처럼 의료광고로 해석될 수 있는 영역은 `draft → in_review → approved → published` 흐름을 기본값으로 한다.
3. **인증/RBAC가 Phase 0이다.** 현재 공유 비밀번호와 개발모드 무조건 통과 로직은 다중 계정, 감사 로그, 개인정보 접근 통제와 양립할 수 없다.
4. **CMS화 대상은 콘텐츠와 운영 사실로 한정한다.** 의료진, 병원정보, 진료시간, 치료 설명, 미디어 링크는 CMS화한다. 히어로 슬라이드의 이미지·영상 자산과 노출 여부는 CMS화할 수 있지만, 모바일/데스크톱 분기·영상 타이밍·스크롤 연동 로직은 코드 소유로 둔다.
5. **모든 공개 발행은 프리뷰와 캐시 무효화를 가진다.** 초안 미리보기는 Next.js Draft Mode로, 발행 후 공개 페이지 갱신은 `revalidatePath` 또는 `revalidateTag`로 명시한다.
6. **상담 DB는 개인정보 시스템으로 취급한다.** 이름·전화번호는 개인정보이며, 증상·치료이력 같은 건강정보를 받기 시작하면 민감정보 동의와 별도 접근 통제가 필요하다.

### 0.2 백오피스 화면 설계 원칙

| 화면 패턴 | 적용 영역 | 설계 기준 |
|----------|-----------|-----------|
| 상태 대시보드 | `/admin` | 신규 상담, 검토 대기, 예약 발행, 최근 변경, 법적 위험 경고를 우선 표시 |
| 테이블 + 필터 | 상담, 공지, 증례, 칼럼, 의료진, 치료 콘텐츠 | 검색·상태·카테고리·작성자·발행상태 필터를 기본 제공 |
| 상세 드로어/편집 화면 | 모든 CRUD | 목록 맥락을 유지하고, 긴 콘텐츠는 단계형 편집으로 분리 |
| 검토 패널 | 치료/칼럼/증례/히어로/가격성 문구 | 금지표현, 면책문구, 심의번호, 승인자, 변경 diff를 한 화면에 표시 |
| 모바일 축약 화면 | 원장·실장 휴대폰 사용 | 검토/승인/반려, 상담 상태 변경, 간단 메모만 우선 지원 |

### 0.3 확정 정보구조

```text
/admin
├─ 대시보드
├─ 상담 운영
│   ├─ 상담 DB
│   └─ 개인정보 보관/파기 큐
├─ 콘텐츠 운영
│   ├─ 공지사항
│   ├─ 증례
│   ├─ 환자 사례
│   └─ 원장 칼럼
├─ 사이트 콘텐츠
│   ├─ 의료진
│   ├─ 치료 콘텐츠/FAQ
│   ├─ 병원 정보·진료시간
│   ├─ 미디어 링크
│   └─ 히어로 자산
├─ 검토/발행
│   ├─ 검토 대기
│   ├─ 예약 발행
│   └─ 반려/수정 필요
└─ 시스템
    ├─ 계정 관리
    └─ 감사 로그
```

### 0.4 콘텐츠 소유권 결정

| 대상 | 결정 | 이유 |
|------|------|------|
| 의료진 | CMS 관리 | 홈/소개 반복 노출, 신규 합류·경력 변경 가능, 자격 표기 검토 필요 |
| 병원정보·진료시간 | CMS 관리 | 전화·주소·시간·SNS·JSON-LD가 여러 화면과 SEO에 연결됨 |
| 치료 콘텐츠/FAQ | 구조화 CMS 관리 | 공개 의료 정보이므로 검토/면책/금지표현 가드 필요 |
| 미디어 링크 | CMS 관리 | 유튜브·블로그·후기 링크는 운영자가 바꾸는 마케팅 채널 |
| 히어로 | 부분 CMS | 자산/노출은 관리 가능, 전환·타이밍·반응형 로직은 코드 소유 |
| 접근/주차 안내 | 기본 코드 소유 | 지도·동선 UI와 결합된 운영 안내. 잦은 변경이 확인되면 별도 CMS화 |
| 홈 섹션 마케팅 카피 | 후순위 | 치료 CMS에서 파생 가능할 때 재검토 |

### 0.5 발행 워크플로 상태

| 상태 | 의미 | 다음 액션 |
|------|------|-----------|
| `draft` | 작성 중 | 저장, 미리보기, 검토 요청 |
| `in_review` | 검토 대기 | 승인, 반려 |
| `needs_changes` | 수정 필요 | 수정 후 재검토 요청 |
| `approved` | 발행 가능 | 즉시 발행 또는 예약 |
| `scheduled` | 예약 발행 | 예약 취소, 즉시 발행 |
| `published` | 공개 중 | 수정 초안 생성, 비공개, 보관 |
| `archived` | 보관 | 복원 요청 |

저위험 운영 공지는 아래 조건을 모두 만족해야 한다.

- 병원 운영 사실 안내만 포함한다: 휴진, 진료시간 임시 변경, 주차/동선 안내, 시스템 점검, 전화 연결 지연.
- 치료 효과·안전성·통증·회복기간·성공률·가격·할인·이벤트·후기·전후 사진·전문의 자격·타원 비교 문구가 없다.
- 상담 전환을 압박하는 문구가 없다. CTA가 필요하면 "상담 신청" 또는 "내 치아 상태 확인" 수준으로 제한한다.

조건을 하나라도 벗어나면 저위험 공지가 아니며 `approved` 없이 `published`로 갈 수 없다.

### 0.6 검토 증빙·운영 기본값

- **검토 증빙 필드**: `legal_flags`, `review_decision`, `review_note`, `reviewed_by`, `reviewed_at`, `version_hash`, `review_number`, `review_source`, `self_approval_blocked`를 저장한다.
- **승인자 원칙**: `manager` 이상만 승인 가능하고, 작성자와 승인자가 같은 초안은 승인할 수 없다. `super_admin`은 긴급 승인할 수 있지만 자기 승인 금지는 동일하게 적용한다.
- **법무/심의 확인 게이트**: 전문의 명칭 화이트리스트, 가격·이벤트 문구, 전후 사진·치료경험담 자동 차단 규칙은 배포 전 원장 또는 지정 법무 검토자가 확인한 버전으로 고정한다. 구현은 규칙을 코드에 절대값으로 박기보다 설정 가능한 패턴 목록으로 둔다.
- **상담 연락처 접근**: staff는 단건 상담의 이름·전화번호를 열람하고 상태/메모를 수정할 수 있다. 대량 복사, CSV 내보내기, 삭제/파기는 `manager` 이상으로 제한한다.
- **상담 보관 기본값**: `submitted_at`과 마지막 상태 변경일 중 늦은 날부터 3년(`1095일`)이 지나면 보관기간 경과 큐에 표시한다. 파기는 즉시 자동 삭제가 아니라 `manager` 이상이 사유를 입력해 archive/delete를 실행하고 감사 로그를 남긴다. 실제 운영 기간은 개인정보 처리방침 배포 전 최종 문구와 일치시킨다.
- **초기 계정 기본값**: 개발/QA는 `super_admin`, `manager`, `staff` 각 1개 fixture 계정을 사용한다. 운영 전환은 슈퍼계정 2개를 먼저 초대하고, 실제 직원 이메일은 배포 데이터로 주입한다.
- **상태 변경 요청 방어**: `POST/PATCH/DELETE` 관리자 API는 세션·역할 검증에 더해 동일 출처 요청만 허용한다. `Origin` 또는 `Referer`가 병원 도메인과 다르거나 `Sec-Fetch-Site`가 `cross-site`이면 403으로 거부하고 감사 로그에 남긴다.
- **데이터 유출 방어 기본값**: CSV 셀은 `=`, `+`, `-`, `@`, 탭, CR/LF로 시작하면 formula injection 방지를 위해 이스케이프한다. 외부 URL 불러오기와 AI/DOCX 변환은 허용 도메인, 크기, `timeout`, HTML sanitize, SSRF 방어(private IP/localhost/metadata IP 차단)를 기본값으로 한다.

---

## 1. 개요

### 1.1 배경

현재 `app/admin/` 에 일부 관리 화면이 이미 존재한다(상담/증례/공지/칼럼). 그러나:

1. 홈페이지의 상당수 콘텐츠(의료진, 치료 설명, 병원 정보, 히어로 슬라이드, 미디어)가 **코드에 하드코딩**되어 있어, 문구·사진·진료시간 하나 바꾸려면 매번 개발자가 배포해야 한다.
2. 관리자 인증이 **공유 비밀번호 1개**(`egun2024`)로만 되어 있어 "누가 무엇을 바꿨는지" 추적이 불가능하고, 원장·실장·데스크 직원을 구분할 수 없다.

### 1.2 목표 (To-Be)

- **전체 CMS화**: 비개발자(원장·실장)가 코드 수정·배포 없이 홈페이지 거의 모든 콘텐츠를 수정 가능.
- **다중 계정 + 권한 분리(RBAC)**: 원장 / 실장 / 데스크 직원 역할별로 접근 가능한 메뉴와 작업을 제어.
- **변경 추적(감사 로그)**: 누가·언제·무엇을 바꿨는지 기록.
- **의료법·개인정보 가드레일 내장**: 금지 표현 경고, 필수 면책 문구 강제, 개인정보 접근 최소화.

### 1.3 비범위 (Non-Goals)

- 홈페이지 프런트엔드 디자인 개편(별도 작업).
- 예약 시스템·전자차트(EMR) 연동.
- 다국어(현 시점 한국어 단일).

### 1.4 용어

| 용어 | 의미 |
|------|------|
| 동적 콘텐츠 | DB에 저장되어 admin에서 수정되는 데이터 (예: 상담, 공지) |
| 정적 콘텐츠 | 현재 `.ts` 파일에 하드코딩된 데이터 (예: 의료진, 진료시간) |
| CMS화 | 정적 콘텐츠를 DB로 옮기고 admin 편집 화면을 붙이는 작업 |
| RBAC | 역할 기반 접근 제어(Role-Based Access Control) |

---

## 2. 현황 진단 (As-Is)

### 2.1 이미 동적으로 관리되는 영역

| 영역 | DB 테이블 | 관리 화면 | API |
|------|-----------|-----------|-----|
| 상담 신청 DB | `consultations` | `app/admin/consultations` | `app/api/consultations` |
| 증례(전후 사진) | `cases`, `case_blogs` | `app/admin/cases` | `app/api/cases` |
| 환자 사례 | `patient_cases` | `app/admin/patient-cases` | `app/api/patient-cases` |
| 공지/휴무 | `notices` | `app/admin/notices` | `app/api/notices` |
| 원장 칼럼 | (columns 테이블) | `app/admin/columns` | `app/api/columns` (AI 생성·네이버 import 포함) |

### 2.2 하드코딩되어 관리 불가능한 영역 ⚠️

| 영역 | 현재 소스 위치 | 형태 | CMS화 필요 |
|------|----------------|------|:---:|
| 의료진 정보 | `data/doctors.ts` (`Doctor[]`) | 이름·직함·전문과·경력·학회·인사말·사진 | ✅ |
| 치료 콘텐츠 | `data/treatments/*.ts` (`TreatmentContent[]`) | 카테고리별 치료 설명·장점·FAQ | ✅ |
| 병원 기본정보 | `data/clinic-info.ts` (`clinicInfo`) | 전화·주소·사업자번호·좌표·SNS링크·진료시간·점심시간 | ✅ |
| 진료시간(본관/별관 소아/교정) | `data/clinic-info.ts` (`scheduleTabs`) | 탭별 요일·시간·공지 | ✅ |
| 히어로 슬라이드 | `components/main/heroSlides.ts` (`WEB_SLIDES`, `MOBILE_SLIDES`) | 웹/모바일 슬라이드 이미지·영상·타이밍·스크롤 연동 | 부분 |
| 미디어 섹션 | `app/media/page.tsx`, `components/main/MediaSection.tsx` | 유튜브·후기 영상 등 | ✅ |

> **운영 임팩트**: 진료시간 변경, 신규 원장 합류, 슬로건 교체, 유튜브 영상 추가 같은 "자주 발생하는 운영 작업"이 전부 개발자 배포 의존. CMS화 1순위.

### 2.3 인증·권한 결함 🔴

현재 구조 (`lib/admin-auth.ts`, `app/api/admin/auth/route.ts`):

- 비밀번호 **단일 공유**: `egun2024`(코드 하드코딩) 또는 `ADMIN_PASSWORD` env 1개.
- 쿠키 1종(`admin-session = egun-admin-authenticated`)으로 인증 여부만 판단. **사용자 식별 불가.**
- **개발 모드에서 `isAdminAuthenticated()`가 무조건 `true` 반환** → 로컬·프리뷰 환경 무방비.
- 계정·역할·권한 개념 자체가 없음 → 요구사항(원장+실장+데스크 다중 계정)과 **정면충돌**.

> 이 영역은 다중 계정 요구 때문에 **선택이 아니라 필수 선행 과제**. (4장, 9장)

### 2.4 인프라 현황

- 스택: Next.js 15(App Router) + Supabase(Postgres + Storage) + Tailwind CSS 4 / Vercel 배포.
- DB 스키마: `supabase/migrations/` (init.sql + patient_cases.sql). RLS는 `auth.role() = 'authenticated'` 기준의 단순 정책.
- API 패턴: Route Handler에서 `createAdminClient()`(service role)로 RLS 우회 + `isAdminAuthenticated()` 게이트.
- 이미지 업로드: `app/api/upload` (Supabase Storage).

---

## 3. 설계 원칙

1. **점진적 마이그레이션**: 정적 데이터를 DB로 옮기되, 각 영역은 "DB에 값이 있으면 DB, 없으면 기존 정적값 fallback"으로 전환해 무중단 이행.
2. **편집은 안전하게**: 고임팩트 콘텐츠(의료진/치료/증례/칼럼/히어로)는 미리보기 + 검토 상태 + 변경 확인 + 감사 로그.
3. **기존 패턴 재사용**: 새 API/화면도 현재 admin의 Route Handler + service role + 인증 게이트 패턴을 따른다(단, 인증을 9장대로 교체).
4. **의료법 우선**: 콘텐츠 입력 필드에 금지표현 경고·필수 면책문구를 시스템이 강제(10장).
5. **캐시까지 발행의 일부로 본다**: 공개 콘텐츠 발행/비공개/삭제 후에는 영향을 받는 경로에 `revalidatePath` 또는 `revalidateTag`를 실행한다.

---

## 4. 사용자 · 권한 모델 (RBAC)

### 4.1 역할 정의

| 역할 | 코드 | 대상 | 설명 |
|------|------|------|------|
| 최고관리자 | `super_admin` | 원장 | 모든 기능 + 계정관리 + 사이트 설정 |
| 운영관리자 | `manager` | 실장 | 콘텐츠 전반 관리, 상담 DB 전체, 계정관리 제외 |
| 일반직원 | `staff` | 데스크 직원 | 상담 응대(상태/메모) + 공지·증례 등록 위주, 삭제·사이트설정 불가 |

### 4.2 권한 매트릭스

> C=생성, R=조회, U=수정, D=삭제. 빈칸=접근 불가.

| 메뉴 / 작업 | super_admin | manager | staff |
|-------------|:-----------:|:-------:|:-----:|
| 대시보드 | R | R | R |
| 상담 DB (열람·연락처) | CRUD | CRUD | R + U(상태/메모) |
| 상담 DB 삭제 | ✅ | ✅ | — |
| 공지사항 | CRUD | CRUD | CRU |
| 증례 / 환자사례 | CRUD | CRUD | CRU |
| 원장 칼럼 | CRUD | CRUD | CRU |
| 미디어 | CRUD | CRUD | CRU |
| 의료진 정보 | CRUD | RU | R |
| 치료 콘텐츠/FAQ | CRUD | RU | R |
| 병원 기본정보·진료시간 | CRUD | RU | R |
| 히어로 슬라이드 | CRUD | RU | — |
| **계정 관리** | CRUD | — | — |
| **감사 로그** | R | R | — |

> 원칙: **삭제·사이트 핵심설정은 상위 권한에 집중**, 일상 등록·응대는 staff까지 허용. 개인정보(연락처) 노출은 staff도 가능하되 다운로드/대량 내보내기는 manager+로 제한.

---

## 5. 백오피스 정보구조 (IA / 메뉴)

```
/admin
├─ 대시보드               (요약 카드: 신규 상담, 미확인 건수, 최근 변경)
├─ 운영
│   ├─ 상담 DB
│   ├─ 공지사항
│   └─ 미디어
├─ 콘텐츠
│   ├─ 증례
│   ├─ 환자 사례
│   └─ 원장 칼럼
├─ 사이트 설정            (manager R / super CRUD)
│   ├─ 의료진
│   ├─ 치료 콘텐츠
│   ├─ 병원 정보 · 진료시간
│   └─ 히어로 슬라이드
└─ 시스템                 (super 전용 일부)
    ├─ 계정 관리
    └─ 감사 로그
```

> 사이드바(`app/admin/AdminSidebar.tsx`)는 위 그룹 구조로 재구성하고, 로그인 사용자 역할에 따라 항목을 동적으로 숨김 처리한다.

---

## 6. 데이터 모델 설계

### 6.1 신규 테이블 (계정·권한·로그)

```sql
-- 관리자 계정 (Supabase Auth와 1:1, 역할 부여)
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null default 'staff'
    check (role in ('super_admin','manager','staff')),
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  last_login_at timestamptz
);

-- 변경 추적 감사 로그
create table public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.admin_users(id),
  actor_email text,
  action text not null,        -- create | read | update | delete | login | logout | export | role_change | approve | publish
  entity text not null,        -- doctors | notices | clinic_info ...
  entity_id text,
  diff jsonb,                  -- 변경 전/후 요약
  reason text,                 -- export/delete/role_change/publish 사유
  request_id text,
  ip_hash text,
  user_agent text,
  metadata jsonb default '{}', -- export format, row count, revalidation result 등
  created_at timestamptz default now() not null
);
create index idx_audit_logs_created on audit_logs(created_at desc);
create index idx_audit_logs_entity on audit_logs(entity, entity_id);
```

`audit_logs`는 관리자 UI에서 수정하지 않는 append-only 로그로 다룬다. 정정이 필요하면 원본 행을 고치지 않고 별도 `audit_correction` 성격의 행을 추가한다.

### 6.1.1 발행 워크플로·버전 테이블

고위험 공개 콘텐츠는 원본 테이블에 바로 덮어쓰지 않고, 발행본과 초안을 분리한다.

```sql
create table public.content_revisions (
  id uuid default gen_random_uuid() primary key,
  entity text not null,              -- doctors | treatments | columns | cases | hero | media
  entity_id text not null,
  status text not null default 'draft'
    check (status in ('draft','in_review','needs_changes','approved','scheduled','published','archived')),
  payload jsonb not null,
  risk_level text not null default 'low'
    check (risk_level in ('low','medium','high')),
  legal_flags jsonb default '{}',     -- 금지표현, 전후사진, 가격/이벤트, 전문의 표기 등
  review_decision text,
  review_note text,
  review_number text,
  review_source text,
  version_hash text,
  self_approval_blocked boolean default false,
  requested_by uuid references public.admin_users(id),
  reviewed_by uuid references public.admin_users(id),
  reviewed_at timestamptz,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_content_revisions_entity on public.content_revisions(entity, entity_id);
create index idx_content_revisions_status on public.content_revisions(status, updated_at desc);
```

발행 API는 `content_revisions.status = 'approved'` 또는 저위험 직접 발행 권한을 확인한 뒤 실제 공개 테이블을 갱신한다. 공개 테이블 갱신, revision 상태 변경, 감사 로그 기록은 하나의 DB 트랜잭션으로 묶고, 캐시 무효화는 커밋 후 실행한다. 캐시 무효화가 실패하면 성공으로 숨기지 않고 `audit_logs.metadata.revalidation_status = 'failed'`와 재시도 대상 경로를 기록해 재시도 큐에서 처리한다.

### 6.2 정적 → DB 이행 대상 테이블

```sql
-- 의료진 (data/doctors.ts → DB)
create table public.doctors (
  id text primary key,            -- 기존 slug 유지 (예: 'lee-jaesung')
  name text not null,
  role text not null,             -- 대표원장/원장
  title text,                     -- DDS, MSD ...
  specialty text,
  sub_role text,
  specialty_detail text,
  image_url text,
  careers jsonb default '[]',     -- string[]
  memberships jsonb default '[]',
  highlights jsonb default '[]',  -- {icon,text}[]
  letter text,
  documents jsonb default '[]',
  sort_order int default 0,
  is_active boolean default true,
  updated_at timestamptz default now()
);

-- 치료 콘텐츠 (data/treatments/*.ts → DB)
create table public.treatments (
  id uuid default gen_random_uuid() primary key,
  board_category text not null,   -- natural-tooth/implant/cosmetic/orthodontics/pediatric
  treatment_type text not null unique,
  title text not null,
  subtitle text,
  description text,
  benefits jsonb default '[]',
  sort_order int default 0,
  is_active boolean default true,
  updated_at timestamptz default now()
);
create table public.treatment_faqs (
  id uuid default gen_random_uuid() primary key,
  treatment_id uuid references public.treatments(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order int default 0
);

-- 병원 기본정보 (data/clinic-info.ts → DB, 단일 행)
create table public.clinic_info (
  id int primary key default 1 check (id = 1),
  name text, representative text, phone text, fax text,
  business_number text, address text,
  latitude double precision, longitude double precision,
  lunch_time text,
  social_links jsonb default '{}',   -- {kakao,youtube,blog,naverPlace}
  updated_at timestamptz default now()
);
-- 진료시간 탭 (본관/별관 소아/별관 교정)
create table public.schedule_tabs (
  id text primary key,            -- main / annex-pediatric / annex-ortho
  label text not null,
  hours jsonb not null,           -- BusinessHours[]
  notice jsonb default '[]',
  sort_order int default 0
);

-- 히어로 자산 (components/main/heroSlides.ts 중 자산/노출만 DB)
create table public.hero_slides (
  id uuid default gen_random_uuid() primary key,
  platform text not null check (platform in ('web','mobile')),
  media_type text not null check (media_type in ('image','video')),
  media_url text not null,
  poster_url text,
  headline text, subcopy text,
  sort_order int default 0,
  is_active boolean default true,
  updated_at timestamptz default now()
);

-- 미디어 항목 (app/media → DB)
create table public.media_items (
  id uuid default gen_random_uuid() primary key,
  kind text not null,             -- youtube / review / tv
  title text,
  url text,
  thumbnail_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

> 히어로의 `interval`, 모바일/데스크톱 분기, 영상 loop·poster 처리, 스크롤 제어는 코드 소유다. CMS는 어떤 자산을 어떤 슬롯에 노출할지만 관리한다.

### 6.3 RLS / 보안

- 공개 읽기 필요 테이블(`doctors`, `treatments`, `treatment_faqs`, `clinic_info`, `schedule_tabs`, `hero_slides`, `media_items`)은 `is_active = true` 한정 공개 `select` 정책.
- 공개 페이지 렌더링 경로는 service role을 사용하지 않는다. 서버 컴포넌트라도 익명/RLS 공개 읽기 정책 또는 공개 전용 서버 헬퍼를 사용하고, `app/cases/page.tsx`, `app/column/[id]/page.tsx`처럼 현재 공개 페이지에서 `createAdminClient()`를 쓰는 경로는 CMS 전환 시 제거 대상이다.
- 쓰기(`insert/update/delete`)는 서버 Route Handler에서 **service role + 세션 역할 검증**으로만 수행(클라이언트 직접 쓰기 금지).
- `admin_users`, `audit_logs` 는 공개 읽기 금지.
- Supabase `service_role` 키와 Auth admin API는 서버 Route Handler 또는 Server Function에서만 사용한다.
- 서비스 역할 키는 브라우저 번들, 클라이언트 컴포넌트, 로그, 오류 응답, 감사 로그 metadata에 절대 노출하지 않는다. 구현 완료 전 `SUPABASE_SERVICE_ROLE_KEY`, JWT, OpenAI 키 패턴을 대상으로 한 redacted secret scan을 통과해야 한다.
- 관리자 상태 변경 Route Handler는 `requireRole()` 통과 후 same-origin 방어(`Origin`/`Referer`/`Sec-Fetch-Site`)를 공통 헬퍼로 적용한다. 서버 간 내부 호출이 필요하면 별도 signed server token을 쓰고 브라우저 쿠키 요청과 섞지 않는다.
- 공개 페이지 초안 미리보기는 Next.js Draft Mode를 사용하고, 발행/비공개/삭제 후에는 해당 공개 경로에 `revalidatePath` 또는 공유 데이터에는 `revalidateTag`를 실행한다.
- 공개 버킷에는 실제 공개될 최종 자산만 둔다. 원본/검토 중 자산은 private bucket 또는 signed URL 흐름으로 분리한다.
- 업로드 폴더는 allowlist와 정규화된 경로만 허용한다. `../`, 절대 경로, 알 수 없는 폴더는 `general`로 조용히 대체하지 않고 400/403으로 거부하며, MIME/확장자/파일 크기와 actor/path를 감사 로그에 남긴다.
- 공개 읽기 정책은 SQL policy dump로 검증한다. `consultations`, `admin_users`, `audit_logs`, 초안/비활성 CMS 행, private 원본 자산은 익명·공개 클라이언트로 읽을 수 없어야 한다.

### 6.4 이행 전략 (무중단)

각 데이터 접근 함수에 fallback을 둔다:

```ts
// 예: 의료진
const rows = await fetchDoctorsFromDB()
export const doctors = rows.length ? rows : STATIC_DOCTORS_FALLBACK
```

1. 테이블 생성 + 기존 `.ts` 값을 시드(seed) 스크립트로 1회 적재(`scripts/seed-*.mjs` 패턴 재사용).
2. 프런트 데이터 소스를 DB 우선·정적 fallback으로 교체.
3. admin 편집 화면 오픈 → 검증 후 정적 파일 제거.

---

## 7. 화면별 기능 명세

> 공통: 목록(검색·필터·정렬·페이지네이션) → 편집 폼(유효성 검사) → 저장 시 감사 로그 기록 + 변경 미리보기.

### 7.1 대시보드 `/admin`
- 카드: 신규 상담(미확인) 수, 오늘/이번주 상담, 최근 변경 이력(audit_logs 최신 5건).
- 역할별: staff는 상담·콘텐츠 카드만, super는 시스템 카드 포함.

### 7.2 상담 DB `/admin/consultations` (기존 개선)
- 현재 기능 유지(상태 탭, 메모 인라인 편집, 삭제).
- 추가: 기간/이름·전화 검색, CSV 내보내기(manager+), 개인정보 보관기간 경과 항목 표시.

### 7.3 공지사항 `/admin/notices` (기존)
- 활성/비활성 토글, 공지일(notice_date), 이미지, 휴무 일정 표시. 기존 유지 + 권한 게이트 적용.

### 7.4 증례 / 환자사례 / 칼럼 (기존)
- 기존 기능 유지. 칼럼은 AI 생성·네이버 import 포함. 권한 게이트만 추가.

### 7.5 미디어 `/admin/media` (신규)
- 유튜브/후기 영상 URL·썸네일·정렬 관리. 노출 토글.

### 7.6 의료진 `/admin/doctors` (신규)
- 카드 목록(드래그 정렬), 추가/수정: 이름·직함·전문과·경력(배열)·학회(배열)·하이라이트·인사말·사진 업로드.
- **의료법 가드**: 전문의는 전문과목 명시 필수(예: "교정과 전문의"), 과장 표현 경고.

### 7.7 치료 콘텐츠 `/admin/treatments` (신규)
- 카테고리(5종) 탭 → 치료별 제목·부제·설명·장점·FAQ(반복 필드) 편집.
- **의료법 가드**: 입력 시 금지표현 실시간 경고, "치료 결과는 개인마다 다를 수 있습니다" 면책 문구 자동 노출 강제.

### 7.8 병원 정보 · 진료시간 `/admin/clinic` (신규)
- 단일 폼: 전화·팩스·주소·사업자번호·좌표·SNS 링크·점심시간.
- 진료시간 탭(본관/별관 소아/별관 교정) 요일별 시간·공지 편집.

### 7.9 히어로 자산 `/admin/hero` (신규)
- 웹/모바일 구분 탭, 슬라이드 자산 추가(이미지/영상 업로드)·정렬·활성화.
- 코드 소유 필드(`interval`, 영상 loop 정책, 스크롤 연동)는 admin에서 직접 수정하지 않는다.

### 7.10 계정 관리 `/admin/users` (신규, super 전용)
- 계정 초대(이메일)·역할 지정·비활성화. 비밀번호 재설정(Supabase Auth).

### 7.11 감사 로그 `/admin/audit` (신규)
- 행위자·작업·대상·시간 필터 조회.

---

## 8. 공통 기능

- **이미지/영상 업로드**: 기존 `app/api/upload`(Supabase Storage) 재사용, 폴더 규칙 정리(`doctors/`, `hero/`, `media/`).
- **미리보기**: 고임팩트 화면(의료진/병원정보/히어로)은 저장 전 프런트 렌더 미리보기.
- **유효성 검사**: 필수 필드, 전화·URL 형식, 이미지 용량.
- **외부/파일/AI 입력 경계**: DOCX, 네이버 블로그 import, AI 생성 결과는 허용 MIME/크기/도메인/redirect depth/timeout을 검증한다. `naver.me` 단축 URL은 최종 도메인이 `blog.naver.com` 또는 `m.blog.naver.com`일 때만 허용하고, SSRF 방지를 위해 localhost/private IP/메타데이터 IP로 향하는 URL은 거부한다.
- **HTML sanitize**: DOCX/네이버/AI 출력은 허용 태그·속성 기반 sanitizer를 통과해야 공개 저장 가능하다. 업로드된 이미지 URL allowlist에 없는 `<img>`와 `script`, inline event handler, `javascript:` URL은 제거한다.
- **감사 로그 훅**: 쓰기 API 공통 헬퍼/Route Handler에서 `audit_logs` 기록.
- **발행 처리**: `approved` 콘텐츠만 공개 테이블에 반영하고, 발행 후 캐시 무효화와 공개 페이지 상태 확인을 수행.
- **에러 UX**: 폼 저장 실패 시 상단 에러 요약 + 필드별 인라인 에러를 함께 표시.

---

## 9. 인증 · 보안 재설계

> 현재 단일 공유 비밀번호 방식을 폐기하고 Supabase Auth 기반 계정 체계로 전환.

1. **Supabase Auth(이메일/비밀번호)** 도입, 각 사용자 = `auth.users` 1행 + `admin_users` 역할 행.
2. `lib/admin-auth.ts` 를 세션 검증 + 역할 조회로 교체. **개발 모드 무조건 통과 로직 제거**.
3. Route Handler 공통 가드: `requireRole(['manager','super_admin'])` 헬퍼로 작업별 권한 강제.
4. 현재 프로젝트의 라우트 가드 진입점인 `proxy.ts`에서 `/admin/*` 미인증 접근을 `/admin/login`으로 리다이렉트한다. 별도 `middleware.ts` 이전은 이 작업 범위가 아니다.
5. 비밀번호 정책·세션 만료·로그인 시도 제한·초대 만료·비활성 계정 세션 무효화. `egun2024` 하드코딩과 `admin-session = egun-admin-authenticated` 정적 토큰을 제거한다.
6. 계정 초대/생성/비활성화는 서버 전용 API에서만 수행하고, 모든 role 변경은 감사 로그에 남긴다.
7. 모든 관리자 변조 요청은 SameSite 쿠키 설정만 믿지 않고 `Origin`/`Referer`/`Sec-Fetch-Site` 기반 same-origin 검사를 통과해야 한다. 실패 시 403과 감사 로그를 남기며, QA는 cross-site `POST/PATCH/DELETE` 요청이 차단되는지 확인한다.

> **마이그레이션 주의**: 기존 쿠키 방식과 병행 불가 → 전환 시 기존 비밀번호 폐기 공지. 9장은 다중 계정 요구의 **선행 필수 과제**.

---

## 10. 의료법 · 개인정보 가드레일

(`docs/medical-law.md` 기준 시스템 강제)

- **금지 표현 경고**: 치료 콘텐츠/칼럼/공지 입력 시 "100% 성공", "최고", "최다", 타원 비교, 할인 강조 등 패턴 감지 → 저장 전 경고.
- **필수 면책 문구**: 치료 설명 페이지에 "의료법에 의거, 치료 결과는 개인마다 다를 수 있습니다" 자동 포함을 강제·검증.
- **전후 사진(B/A)**: 증례 등록 시 사전 서면 동의 체크 필수, 광고성 사용은 심의 필요 안내.
- **의료진 표기**: 전문의는 전문과목 명시 강제.
- **개인정보**: 상담 DB 연락처는 staff 단건 열람 가능하되 대량 복사·CSV 내보내기·삭제/파기는 manager+ 제한, 보관기간 경과 건 표시·사유 기반 보관/파기 기능.
- **고위험 자동 분류**: 치료경험담, 가격·이벤트·할인, 치료 효과·안전성 표현, 전후 사진, 전문의 자격, 타원 비교 문구는 자동으로 `in_review` 필요 상태가 된다.
- **심의/승인 증빙**: 심의 대상 콘텐츠는 심의번호 또는 내부 검토 증빙, 승인자, 승인 시각, 콘텐츠 버전 해시를 저장한다.
- **개인정보 최소화**: 기본 상담 폼은 이름·전화번호 중심으로 유지한다. 증상·치료이력 입력을 추가할 경우 민감정보 동의와 더 강한 권한 통제를 별도 설계한다.
- **내보내기 통제**: CSV export는 manager+만 가능하며 사유 입력, 행 수, 필드 목록, 파일명, 실행자, 실행 시각을 감사 로그에 남긴다. 내보낸 파일은 서버에 장기 저장하지 않고 요청 응답으로만 제공한다.
- **CSV 안전 처리**: 이름, 메모 등 사용자가 입력한 값은 CSV 생성 시 formula injection을 방지한다. `=`, `+`, `-`, `@`, 탭, CR/LF로 시작하는 셀은 이스케이프하고, QA는 악성 fixture가 스프레드시트 수식으로 실행되지 않는지 검증한다.
- **보관 기준 시각**: 보관기간 큐는 `submitted_at`, `last_status_changed_at`, `last_contacted_at` 중 가장 늦은 값을 기준으로 계산한다. 구현 시 현재 없는 시각 필드는 migration에 추가하고, archive/delete 사유·행 수·실행자를 감사 로그에 남긴다.
- **개인정보 처리방침 연동**: 상담 보관기간, 파기 방식, 관리자 접근 범위가 바뀌면 공개 개인정보 처리방침 문구도 같은 배포에 포함한다.

---

## 11. 비기능 요구사항

| 항목 | 기준 |
|------|------|
| 반응형 | 데스크톱/모바일(원장 휴대폰 사용 고려) |
| 성능 | 목록 조회 페이지네이션, 이미지 최적화, 발행 후 캐시 무효화 |
| 접근성 | 18px 이상 본문(브랜드 기준), 명확한 라벨 |
| 안정성 | 쓰기 작업 트랜잭션·감사 로그 |
| 백업 | Supabase 자동 백업 + 정적 시드 보관 |
| 잠금 복구 | 슈퍼계정 2개 사전 생성, 비상 초대 재발송 절차, 기존 공유 비밀번호로 롤백 금지 |

---

## 12. 단계별 로드맵

> 의존성: **Phase 0(인증)** 이 다중 계정 요구의 선행 조건. 운영 임팩트 높은 정적 데이터부터 CMS화.

### Phase 0 — 계정·권한 기반 (필수 선행)
- Supabase Auth 도입, `admin_users` 테이블, RBAC 헬퍼, `proxy.ts` 가드.
- 기존 단일 비밀번호 폐기. 계정 관리 화면(super).
- **완료 기준**: 원장·실장·데스크 계정 생성·로그인, 역할별 메뉴 노출 차등.

### Phase 1 — 고빈도 운영 콘텐츠 CMS화
- 병원 정보·진료시간, 미디어 링크, 히어로 자산. (가장 자주 바뀜)
- 감사 로그, 발행 워크플로, 프리뷰, 캐시 무효화 기반 구축.

### Phase 2 — 핵심 소개 콘텐츠 CMS화
- 의료진, 치료 콘텐츠/FAQ. (의료법 가드와 검토/승인 포함)

### Phase 3 — 기존 화면 고도화
- 상담 DB 검색·CSV·보관기간, 사이드바 IA 재편, 대시보드 개선.

### Phase 4 — 마감
- 정적 `.ts` 파일 제거, 문서화, QA, 의료법 최종 점검.

---

## 13. 리스크 · 미해결 이슈

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 인증 전환 중 잠금 | 운영 중단 | 전환 전 슈퍼계정 2개 사전 생성, 비상 초대 재발송 API, 기존 공유 비밀번호 롤백 금지 |
| 정적→DB 데이터 누락 | 콘텐츠 공백 | 정적 fallback 유지 후 검증되면 제거 |
| 비전문가 입력 오류 | 의료법 위반·레이아웃 깨짐 | 유효성 검사 + 금지표현 경고 + 미리보기 |
| 권한 설정 오류 | 정보 과다 노출 | 권한 매트릭스(4.2) 테스트 케이스화 |
| 발행 후 캐시 무효화 실패 | 공개 페이지 불일치 | DB 반영·감사 로그는 트랜잭션 처리, revalidation 실패는 감사 로그와 재시도 큐에 기록 |

**배포 전 운영 입력**
1. 실제 운영 계정 이메일과 역할 배정. 기본 정책은 슈퍼계정 2개, manager 1개 이상, staff 필요 인원이다.
2. 전문의 명칭·가격/이벤트·전후사진·치료경험담 차단 규칙에 대한 원장 또는 지정 법무 검토 확인.
3. 심의번호가 필요한 외부 광고 매체까지 CMS에서 관리할지 여부.

---

## 14. 부록 — 현재 코드 ↔ CMS 매핑

| CMS 대상 | 현재 위치 | 이행 후 |
|----------|-----------|---------|
| 의료진 | `data/doctors.ts` | `doctors` 테이블 + `/admin/doctors` |
| 치료 콘텐츠 | `data/treatments/*.ts` | `treatments`,`treatment_faqs` + `/admin/treatments` |
| 병원정보·진료시간 | `data/clinic-info.ts` | `clinic_info`,`schedule_tabs` + `/admin/clinic` |
| 히어로 | `components/main/heroSlides.ts` | `hero_slides` + `/admin/hero` (자산/노출만, 타이밍 로직은 코드 유지) |
| 미디어 | `app/media/page.tsx`, `components/main/MediaSection.tsx` | `media_items` + `/admin/media` |
| 인증 | `lib/admin-auth.ts`, `app/api/admin/auth/route.ts`, `proxy.ts` | Supabase Auth + `admin_users` + `proxy.ts` 가드 |
| 사이드바 | `app/admin/AdminSidebar.tsx` | 역할 기반 동적 메뉴(5장 IA) |

`specs/domain/resources.yaml`에 남아 있는 `doctors`, `treatments`, `clinic_info`의 `static: true` 표기는 현재 상태 설명이다. 이 백오피스 CMS 구현이 시작되면 해당 도메인 스펙도 `static: false`와 CMS 테이블 기준으로 함께 갱신한다.

---

## 15. 조사 근거와 출처

### 15.1 내부 근거

- 현재 인증 결함: `lib/admin-auth.ts`, `app/api/admin/auth/route.ts`, `proxy.ts`.
- 현재 admin 화면: `app/admin/*`.
- 정적 콘텐츠 원천: `data/doctors.ts`, `data/clinic-info.ts`, `data/treatments/*.ts`, `components/main/heroSlides.ts`, `app/media/page.tsx`.
- 브랜드/디자인/SEO/의료법 기준: `docs/brand.md`, `docs/design-system.md`, `docs/seo-guide.md`, `docs/medical-law.md`.
- 상세 조사 로그: `.omo/ulw-research/20260630-085833-backoffice-cms/`.

### 15.2 외부 근거

- 의료광고 금지·심의: [의료법 제56조](https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsId=001788&lsJoLnkSeq=900350305&print=print), [의료법 시행령 제23조](https://www.law.go.kr/LSW//lumLsLinkPop.do?chrClsCd=010202&lspttninfSeq=61734), [의료법 제57조](https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000721562).
- 의료광고 단속·치과 심의 참고: [보건복지부 2024 단속 결과](https://www.mohw.go.kr/board.es?act=view&bid=0027&list_no=1480602&mid=a10503010100&nPage=1&tag=), [대한치과의사협회 의료광고 가이드라인 안내](https://www.kda.or.kr/kda/medicalLow/medicalNotice/board_read.kda?board_key=38867).
- 개인정보: [개인정보보호법 제15조](https://law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1020398435), [제21조](https://www.law.go.kr/LSW//lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1020398651), [제23조](https://law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000575255), [제29조](https://www.law.go.kr/lsInfoP.do?ancYnChk=0&lsId=011357), [개인정보 처리방침 작성지침](https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=G010030000&nttId=10127).
- 구현 패턴: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Supabase SSR client](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Supabase RBAC custom claims](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac), [Next.js Draft Mode](https://nextjs.org/docs/app/guides/draft-mode), [Next.js revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath), [Next.js revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).
- CMS UX: [GOV.UK Task list](https://design-system.service.gov.uk/components/task-list/), [GOV.UK Table](https://design-system.service.gov.uk/components/table/), [GOV.UK Validation](https://design-system.service.gov.uk/patterns/validation/), [W3C Tables tutorial](https://www.w3.org/WAI/tutorials/tables/), [Strapi Draft & Publish](https://docs.strapi.io/cms/features/draft-and-publish), [Drupal Content Moderation](https://www.drupal.org/docs/8/core/modules/content-moderation/overview).
