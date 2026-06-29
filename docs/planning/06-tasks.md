> ⚠️ 이 파일은 초기 기획 단계 문서입니다. 참고용으로만 사용하세요.

# 서울이건치과 홈페이지 TASKS.md (기획 아카이브)

> Domain-Guarded 태스크 구조 (v2.0)
> 생성일: 2026-03-23

---

## P0: 프로젝트 셋업

### [ ] P0-T0.1: Next.js 프로젝트 초기화
- **담당**: backend-specialist
- **작업**:
  - Next.js 15 + TypeScript + Tailwind CSS 4 프로젝트 생성 (pnpm)
  - ESLint + Prettier 설정
  - 폴더 구조 생성 (07-coding-convention.md 기준)
  - next/font로 Noto Sans KR 설정
  - globals.css 기본 스타일 설정
- **파일**: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `src/app/globals.css`
- **완료 조건**: `pnpm dev` 실행 시 빈 페이지 정상 표시

### [ ] P0-T0.2: Supabase 설정
- **담당**: database-specialist
- **작업**:
  - Supabase 프로젝트 생성
  - 테이블 생성 (consultations, cases, case_blogs, notices)
  - RLS 정책 적용 (04-database-design.md 기준)
  - Storage 버킷 생성 (cases, notices, clinic)
  - Supabase Auth 관리자 계정 설정
  - 환경변수 설정 (.env.local)
- **파일**: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- **완료 조건**: Supabase 연결 테스트 통과

### [ ] P0-T0.3: 정적 데이터 파일 생성
- **담당**: backend-specialist
- **의존**: P0-T0.1
- **작업**:
  - `src/data/clinic-info.ts` (치과 기본 정보)
  - `src/data/doctors.ts` (의료진 5명 정보)
  - `src/data/treatments/*.ts` (치료 콘텐츠 + FAQ, 총 19개 치료 항목)
- **소스**: 01-prd.md 치과 정보 + 사용자 제공 콘텐츠 전문
- **완료 조건**: TypeScript 타입 에러 없음

---

## P1: 공통 레이아웃 & 리소스

### [ ] P1-R1-T1: Consultations API 구현
- **담당**: backend-specialist
- **의존**: P0-T0.2
- **리소스**: consultations
- **엔드포인트**:
  - POST /api/consultations (상담 신청 - 비인증)
  - GET /api/consultations (목록 조회 - 관리자)
  - PATCH /api/consultations/:id (상태/메모 수정 - 관리자)
  - DELETE /api/consultations/:id (삭제 - 관리자)
- **필드**: id, name, phone, privacy_agreed, status, memo, created_at
- **파일**: `src/app/api/consultations/route.ts`, `src/app/api/consultations/[id]/route.ts`
- **완료 조건**: API 테스트 통과 (CRUD + RLS 검증)

### [ ] P1-R2-T1: Cases API 구현
- **담당**: backend-specialist
- **의존**: P0-T0.2
- **리소스**: cases, case_blogs
- **엔드포인트**:
  - GET /api/cases?board_category=xxx (증례 목록 - 공개)
  - POST /api/cases (증례 추가 - 관리자)
  - PATCH /api/cases/:id (수정 - 관리자)
  - DELETE /api/cases/:id (삭제 - 관리자)
  - GET /api/cases/:id/blogs (블로그 링크 - 공개)
  - POST /api/cases/:id/blogs (블로그 추가 - 관리자)
- **파일**: `src/app/api/cases/route.ts`, `src/app/api/cases/[id]/route.ts`
- **완료 조건**: API 테스트 통과

### [ ] P1-R3-T1: Notices API 구현
- **담당**: backend-specialist
- **의존**: P0-T0.2
- **리소스**: notices
- **엔드포인트**:
  - GET /api/notices (활성 공지 - 공개)
  - POST /api/notices (추가 - 관리자)
  - PATCH /api/notices/:id (수정 - 관리자)
  - DELETE /api/notices/:id (삭제 - 관리자)
- **파일**: `src/app/api/notices/route.ts`, `src/app/api/notices/[id]/route.ts`
- **완료 조건**: API 테스트 통과

### [ ] P1-R4-T1: Upload API 구현
- **담당**: backend-specialist
- **의존**: P0-T0.2
- **리소스**: upload
- **엔드포인트**:
  - POST /api/upload (이미지 업로드 - 관리자)
- **파일**: `src/app/api/upload/route.ts`
- **완료 조건**: Supabase Storage 업로드 테스트 통과, 10MB 제한

### [ ] P1-S0-T1: 공통 레이아웃 구현
- **담당**: frontend-specialist
- **의존**: P0-T0.1, P0-T0.3
- **화면**: 글로벌 UI (G-01 ~ G-05)
- **컴포넌트**:
  - `Header.tsx` - 고정 헤더 (서울대 로고 + SEOUL EGUN DENTAL + 햄버거 메뉴)
  - `Footer.tsx` - 푸터 (치과 정보, 진료시간, 면책 문구)
  - `QuickConsultBar.tsx` - 하단 고정 상담바 (이름/연락처/동의/예약/빠른상담)
  - `FloatingSidebar.tsx` - 우측 플로팅 사이드바 (6개 아이콘 버튼)
  - `CustomCursor.tsx` - 서울대 로고 커스텀 커서 (데스크톱 전용)
  - `MobileNav.tsx` - 모바일 햄버거 메뉴 패널
- **파일**: `src/components/layout/*.tsx`, `src/app/layout.tsx`
- **specs**: `specs/shared/components.yaml`
- **완료 조건**: 모든 페이지에서 공통 레이아웃 정상 표시, 모바일 반응형 확인

### [ ] P1-S0-T2: 하단 상담바 DB 연동
- **담당**: frontend-specialist
- **의존**: P1-S0-T1, P1-R1-T1
- **작업**:
  - QuickConsultBar에서 상담 신청 시 POST /api/consultations 호출
  - 입력 검증 (이름 2자+, 연락처 형식, 동의 체크)
  - 성공/에러 토스트 표시
  - 빠른상담 버튼 tel:031-896-5512 연결
- **완료 조건**: 상담 신청 → DB 저장 → 완료 알림 동작 확인

---

## P2: 메인 페이지

### [ ] P2-S1-T1: 메인 페이지 풀페이지 스크롤 기반
- **담당**: frontend-specialist
- **의존**: P1-S0-T1
- **화면**: S-01 ~ S-06 (메인 6화면)
- **작업**:
  - CSS scroll-snap 풀페이지 스크롤 구현 (1920x937)
  - 50% 넘어가면 다음 화면으로 스냅
  - 모바일에서는 일반 스크롤로 전환
- **파일**: `src/app/page.tsx`, `src/hooks/useScrollSnap.ts`
- **완료 조건**: 데스크톱에서 풀페이지 스크롤 정상 동작

### [ ] P2-S1-T2: 1화면 히어로 슬라이드
- **담당**: frontend-specialist
- **의존**: P2-S1-T1
- **화면**: S-01
- **작업**:
  - 이미지 슬라이드 캐러셀 (자동재생)
  - 왼쪽 동그라미 인디케이터 (타이머 프로그레스 + 클릭 이동)
  - 이미지는 placeholder, 추후 교체 가능
- **파일**: `src/components/main/HeroSlider.tsx`
- **완료 조건**: 슬라이드 자동전환 + 인디케이터 동작

### [ ] P2-S1-T3: 2화면 의료진 소개
- **담당**: frontend-specialist
- **의존**: P2-S1-T1, P0-T0.3
- **화면**: S-02
- **작업**:
  - 원장님 5명 단체사진 영역
  - 각 인물 호버 시 하이라이트 효과
  - 클릭 시 /about#doctors로 이동
- **파일**: `src/components/main/DoctorGroup.tsx`
- **완료 조건**: 호버 + 클릭 인터랙션 동작

### [ ] P2-S1-T4: 3화면 자연치 보존 솔루션
- **담당**: frontend-specialist
- **의존**: P2-S1-T1
- **화면**: S-03
- **작업**:
  - 비포/애프터 카드 3개 가로 배치
  - 호버 시 설명 텍스트 중앙 오버레이
  - 클릭 시 /natural-tooth 이동
- **파일**: `src/components/main/NaturalSolution.tsx`
- **완료 조건**: 호버 오버레이 + 클릭 네비게이션

### [ ] P2-S1-T5: 4화면 올온 임플란트
- **담당**: frontend-specialist
- **의존**: P2-S1-T1
- **화면**: S-04
- **작업**:
  - 검정 배경 + 보철물 사진 (서울권치과 스타일)
  - "자세히보기" 링크 → /implant 이동
- **파일**: `src/components/main/ImplantSection.tsx`
- **완료 조건**: 다크 섹션 렌더링 + 링크 동작

### [ ] P2-S1-T6: 5화면 의식하진정법
- **담당**: frontend-specialist
- **의존**: P2-S1-T1
- **화면**: S-05
- **작업**:
  - 영상 임베드 (외부 링크)
  - 증례 숫자 카운팅 애니메이션 (스크롤 진입 시 트리거)
- **파일**: `src/components/main/SedationSection.tsx`, `src/hooks/useCountUp.ts`
- **완료 조건**: 영상 재생 + 카운팅 애니메이션

### [ ] P2-S1-T7: 6화면 서울이건 미디어
- **담당**: frontend-specialist
- **의존**: P2-S1-T1, P0-T0.3
- **화면**: S-06
- **작업**:
  - 블로그/유튜브/카톡/플레이스 아이콘 카드 그리드
  - 각 아이콘 클릭 시 외부 링크 이동
- **파일**: `src/components/main/MediaSection.tsx`
- **완료 조건**: 외부 링크 정상 동작

### [ ] P2-S1-V: 메인 페이지 검증
- **담당**: test-specialist
- **의존**: P2-S1-T1 ~ P2-S1-T7
- **검증**:
  - [ ] 풀페이지 스크롤 6화면 정상 전환
  - [ ] 히어로 슬라이드 자동재생 + 인디케이터
  - [ ] 의료진 호버/클릭 인터랙션
  - [ ] 카운팅 애니메이션 스크롤 트리거
  - [ ] 모바일 반응형 (스크롤 스냅 비활성, 세로 배치)

---

## P3: 게시판 - 이건치과소개

### [ ] P3-S1-T1: 치과소개 페이지 기반
- **담당**: frontend-specialist
- **의존**: P1-S0-T1, P0-T0.3
- **화면**: B-01
- **작업**:
  - 원페이지 레이아웃 + 앵커 네비게이션 (6개 서브메뉴)
  - A. 진료철학 섹션 (텍스트 + 원장님 슬라이드)
  - B. 의료진소개 섹션 (약력+손글씨+면허증+진료사진, 서울권치과 참고)
  - C. 진료일정 캘린더 (본관/별관/교정과 탭)
  - D. 내부전경 사진 갤러리
  - E. 디지털 기공소 (영상+사진+구성원)
  - F. 오시는길 (지도+진료시간+주차/대중교통)
- **파일**: `src/app/about/page.tsx`, `src/components/about/*.tsx`
- **완료 조건**: 6개 섹션 + 앵커 네비게이션 동작

### [ ] P3-S1-T2: 오시는길 지도 연동
- **담당**: frontend-specialist
- **의존**: P3-S1-T1
- **작업**:
  - 네이버/카카오 지도 API 연동 (위도 37.264707, 경도 127.041222)
  - 마커 표시 + 클릭 시 네이버 플레이스 이동
- **파일**: `src/components/about/MapSection.tsx`
- **완료 조건**: 지도 정상 표시 + 마커 클릭

---

## P4: 게시판 - 치료 페이지 (공통 패턴)

### [ ] P4-S1-T1: 치료 게시판 공통 컴포넌트
- **담당**: frontend-specialist
- **의존**: P1-S0-T1, P0-T0.3, P1-R2-T1
- **작업**:
  - `BoardHero.tsx` - 게시판 히어로 (대제목+대표이미지)
  - `AnchorNav.tsx` - 서브메뉴 앵커 네비게이션
  - `TreatmentSection.tsx` - 치료 설명 (지그재그 레이아웃)
  - `BenefitList.tsx` - 치료 장점 체크리스트
  - `CaseGallery.tsx` - 증례사진 갤러리 (DB 연동)
  - `FaqAccordion.tsx` - FAQ 아코디언
  - `BlogLink.tsx` - 관련 블로그 링크 카드
  - `CtaSection.tsx` - 상담 CTA (전화/카카오/예약)
- **파일**: `src/components/board/*.tsx`
- **완료 조건**: 공통 컴포넌트 독립 렌더링 테스트

### [ ] P4-S2-T1: 자연치아살리기 페이지
- **담당**: frontend-specialist
- **의존**: P4-S1-T1
- **화면**: B-02
- **서브섹션**: 충치치료, VPT 신경보존술, 근관치료, 잇몸치료
- **파일**: `src/app/natural-tooth/page.tsx`
- **완료 조건**: 4개 섹션 + 앵커 네비게이션 + FAQ 아코디언

### [ ] P4-S3-T1: 임플란트 페이지
- **담당**: frontend-specialist
- **의존**: P4-S1-T1
- **화면**: B-03
- **서브섹션**: 올온, 즉시로딩, 네비게이션, 전치부, 자가혈, 상악동거상술, 시니어, 당뇨
- **파일**: `src/app/implant/page.tsx`
- **완료 조건**: 8개 섹션 + 앵커 네비게이션 + FAQ 아코디언

### [ ] P4-S4-T1: 심미보철 페이지
- **담당**: frontend-specialist
- **의존**: P4-S1-T1
- **화면**: B-04
- **서브섹션**: 최소삭제 라미네이트, 앞니 레진빌드업, 잇몸성형술
- **파일**: `src/app/cosmetic/page.tsx`
- **완료 조건**: 3개 섹션 + 앵커 네비게이션 + FAQ 아코디언

### [ ] P4-S5-T1: 교정치료 페이지
- **담당**: frontend-specialist
- **의존**: P4-S1-T1
- **화면**: B-05
- **서브섹션**: 인비절라인 투명교정, 소아성장기교정
- **파일**: `src/app/orthodontics/page.tsx`
- **완료 조건**: 2개 섹션 + 앵커 네비게이션 + FAQ 아코디언

### [ ] P4-S6-T1: 소아치과 치료 페이지
- **담당**: frontend-specialist
- **의존**: P4-S1-T1
- **화면**: B-06
- **서브섹션**: 소아충치치료, 웃음가스치료
- **파일**: `src/app/pediatric/page.tsx`
- **완료 조건**: 2개 섹션 + 앵커 네비게이션 + FAQ 아코디언

### [ ] P4-S7-T1: 이건 미디어 페이지
- **담당**: frontend-specialist
- **의존**: P1-S0-T1, P0-T0.3
- **화면**: B-07
- **작업**:
  - 상단 큰 카드 2열 (카톡상담 + 빠른상담)
  - 하단 작은 카드 3열 (블로그 + 유튜브 + 가는길)
- **파일**: `src/app/media/page.tsx`
- **완료 조건**: 5개 카드 + 외부 링크 동작

### [ ] P4-V: 게시판 통합 검증
- **담당**: test-specialist
- **의존**: P4-S2-T1 ~ P4-S7-T1
- **검증**:
  - [ ] 모든 게시판 앵커 네비게이션 동작
  - [ ] FAQ 아코디언 열기/닫기
  - [ ] 증례사진 DB 로드 (없으면 "준비 중" 표시)
  - [ ] CTA 섹션 전화/카카오/예약 동작
  - [ ] 모바일 반응형 (지그재그→세로 전환)

---

## P5: 관리자 페이지

### [ ] P5-S1-T1: 관리자 인증
- **담당**: backend-specialist
- **의존**: P0-T0.2
- **화면**: A-01
- **작업**:
  - /admin/login 로그인 페이지
  - Supabase Auth 이메일/비밀번호 인증
  - /admin 레이아웃에 미들웨어 인증 체크
  - 비인증 접근 시 /admin/login 리다이렉트
- **파일**: `src/app/admin/login/page.tsx`, `src/app/admin/layout.tsx`, `src/middleware.ts`
- **완료 조건**: 로그인/로그아웃 동작, 비인증 리다이렉트

### [ ] P5-S2-T1: 관리자 대시보드
- **담당**: frontend-specialist
- **의존**: P5-S1-T1, P1-R1-T1
- **화면**: A-02
- **작업**:
  - 메뉴 카드 3개 (상담DB, 증례관리, 공지사항)
  - 미확인 상담 건수 배지 표시
- **파일**: `src/app/admin/page.tsx`
- **완료 조건**: 대시보드 + 배지 카운트 표시

### [ ] P5-S3-T1: 상담 DB 관리 페이지
- **담당**: frontend-specialist
- **의존**: P5-S1-T1, P1-R1-T1
- **화면**: A-03
- **작업**:
  - 상담 신청 테이블 (이름, 연락처, 신청일, 상태, 메모)
  - 상태 필터 (전체/미확인/연락완료/완료)
  - 상태 변경 (pending→contacted→completed)
  - 메모 인라인 편집
  - 삭제 (확인 다이얼로그)
- **파일**: `src/app/admin/consultations/page.tsx`
- **완료 조건**: CRUD 동작 + 필터링

### [ ] P5-S4-T1: 증례 관리 페이지
- **담당**: frontend-specialist
- **의존**: P5-S1-T1, P1-R2-T1, P1-R4-T1
- **화면**: A-04
- **작업**:
  - 게시판별 필터 탭
  - 증례 목록 (썸네일+제목)
  - 추가/수정 모달 (제목, 설명, before/after 이미지 업로드, 블로그 URL)
  - 삭제 (확인 다이얼로그)
  - 드래그 정렬 순서 변경
- **파일**: `src/app/admin/cases/page.tsx`, `src/components/admin/ImageUploader.tsx`
- **완료 조건**: 이미지 업로드 + CRUD + 필터링

### [ ] P5-S5-T1: 공지사항 관리 페이지
- **담당**: frontend-specialist
- **의존**: P5-S1-T1, P1-R3-T1
- **화면**: A-05
- **작업**:
  - 공지 목록 (제목, 날짜, 활성 상태)
  - 추가/수정 모달 (제목, 내용, 날짜, 이미지)
  - 활성/비활성 토글
  - 삭제
- **파일**: `src/app/admin/notices/page.tsx`
- **완료 조건**: CRUD + 활성 토글 동작

### [ ] P5-S6-T1: 공지사항 프론트 페이지
- **담당**: frontend-specialist
- **의존**: P1-R3-T1
- **작업**:
  - /notice 페이지 (활성 공지만 표시)
  - 우측 사이드바 휴무일정 → 이 페이지로 연결
- **파일**: `src/app/notice/page.tsx`
- **완료 조건**: 활성 공지 표시

### [ ] P5-V: 관리자 통합 검증
- **담당**: test-specialist
- **의존**: P5-S1-T1 ~ P5-S6-T1
- **검증**:
  - [ ] 비인증 접근 차단
  - [ ] 상담 DB CRUD + 상태 변경
  - [ ] 증례 이미지 업로드 + 게시판 연동
  - [ ] 공지사항 활성/비활성 토글 → 프론트 반영

---

## P6: 최종 통합 & 배포

### [ ] P6-T1: Vercel 배포 설정
- **담당**: backend-specialist
- **의존**: P5-V
- **작업**:
  - Vercel 프로젝트 생성
  - 환경변수 설정 (Supabase keys, Map API key)
  - 빌드 테스트
  - 커스텀 도메인 연결 (있으면)
- **완료 조건**: Vercel 프로덕션 배포 성공

### [ ] P6-T2: SEO 기본 설정
- **담당**: frontend-specialist
- **의존**: P6-T1
- **작업**:
  - 각 페이지 메타데이터 (title, description, og:image)
  - sitemap.xml 자동 생성
  - robots.txt
- **완료 조건**: Google에서 크롤링 가능

### [ ] P6-V: 최종 검증
- **담당**: test-specialist
- **의존**: P6-T1, P6-T2
- **검증**:
  - [ ] 모든 페이지 접근 가능
  - [ ] 하단 상담바 DB 저장 정상
  - [ ] 관리자 페이지 접근/기능 정상
  - [ ] 모바일 반응형 전 페이지 확인
  - [ ] Lighthouse 성능 점수 80+ 확인

---

## 의존성 그래프

```
P0-T0.1 ──┬── P0-T0.3 ──┬── P1-S0-T1 ──── P2-S1-T1 ── P2-S1-T2~T7 ── P2-V
           │              │                       │
P0-T0.2 ──┤              │                       ├── P3-S1-T1 ── P3-S1-T2
           │              │                       │
           ├── P1-R1-T1 ─┼── P1-S0-T2            ├── P4-S1-T1 ── P4-S2~S7 ── P4-V
           ├── P1-R2-T1 ─┤                       │
           ├── P1-R3-T1 ─┤                       └── P5-S1-T1 ── P5-S2~S6 ── P5-V
           └── P1-R4-T1 ─┘                                                       │
                                                                                  └── P6-T1 ── P6-T2 ── P6-V
```

## 병렬 실행 가능 그룹

| 그룹 | 태스크 | 조건 |
|------|--------|------|
| P0 병렬 | P0-T0.1, P0-T0.2 | 독립 |
| P1 리소스 병렬 | P1-R1-T1, P1-R2-T1, P1-R3-T1, P1-R4-T1 | P0-T0.2 완료 후 |
| P1 레이아웃 | P1-S0-T1 | P0-T0.1 + P0-T0.3 완료 후 |
| P2 메인화면 | P2-S1-T2 ~ T7 | P2-S1-T1 완료 후 병렬 가능 |
| P4 게시판 병렬 | P4-S2 ~ P4-S7 | P4-S1-T1 완료 후 병렬 가능 |
| P5 관리자 병렬 | P5-S2 ~ P5-S6 | P5-S1-T1 완료 후 병렬 가능 |

---

## 통계

| 항목 | 수량 |
|------|------|
| 총 Phase | 7 (P0~P6) |
| 총 태스크 | 31 |
| Backend 태스크 | 7 |
| Frontend 태스크 | 20 |
| 검증 태스크 | 4 |
| 예상 병렬 최대 | 6 (P4 게시판) |
