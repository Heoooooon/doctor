> ⚠️ 이 파일은 초기 기획 단계 문서입니다. 참고용으로만 사용하세요.

# 서울이건치과 홈페이지 TRD (기획 아카이브)

## 1. 기술 스택

### 프론트엔드
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **풀페이지 스크롤**: CSS scroll-snap
- **애니메이션**: CSS Transitions + Intersection Observer (카운팅 등)

### 백엔드
- **API**: Next.js API Routes (Route Handlers)
- **인증**: Supabase Auth (관리자 로그인)

### 데이터베이스
- **DB**: Supabase (PostgreSQL)
- **스토리지**: Supabase Storage (이미지 업로드)
- **실시간**: 불필요 (정적 콘텐츠 중심)

### 인프라
- **호스팅**: Vercel
- **도메인**: 커스텀 도메인 연결
- **CDN**: Vercel Edge Network (자동)

### 외부 서비스
- **지도**: 네이버 지도 API 또는 카카오맵 API
- **카카오톡**: 카카오 채널 링크 연동
- **전화**: tel: 프로토콜

---

## 2. 아키텍처

### 구조: Monolith (Next.js 풀스택)
```
Client (Browser)
    ↓
Next.js (Vercel)
    ├── Pages (SSG/SSR)
    ├── API Routes
    └── Middleware (Admin Auth)
         ↓
    Supabase
    ├── PostgreSQL (DB)
    ├── Auth (관리자 인증)
    └── Storage (이미지)
```

### 렌더링 전략
| 페이지 | 전략 | 이유 |
|--------|------|------|
| 메인 페이지 | SSG + CSR | 풀페이지 스크롤 인터랙션 |
| 게시판 페이지 | SSG + ISR | 콘텐츠 변경 시 재빌드 (revalidate) |
| 관리자 페이지 | CSR | 인증 필요, 동적 데이터 |

### 패턴
- **Server Components**: 정적 콘텐츠 (게시판 텍스트, FAQ)
- **Client Components**: 인터랙티브 요소 (슬라이드, 호버, 스크롤, 폼)
- **API Routes**: 상담 DB CRUD, 증례 CRUD, 공지사항 CRUD, 파일 업로드

---

## 3. 보안 요구사항

### 인증
- 관리자 로그인: Supabase Auth (이메일/비밀번호)
- 관리자 페이지 접근: Middleware로 세션 검증
- 방문자: 인증 불필요

### 데이터 보호
- 개인정보(이름, 연락처): Supabase RLS (Row Level Security) 적용
- 관리자만 상담 DB 조회 가능
- HTTPS 필수 (Vercel 기본 제공)
- 개인정보 수집 동의 체크 필수

### 입력 검증
- 이름: 필수, 2자 이상
- 연락처: 필수, 전화번호 형식 검증
- 파일 업로드: 이미지 파일만 허용, 10MB 제한

---

## 4. 성능 요구사항

| 지표 | 목표 |
|------|------|
| LCP (Largest Contentful Paint) | < 2.5초 |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| 이미지 로딩 | Next.js Image 최적화 + lazy loading |
| 번들 사이즈 | < 200KB (초기 JS) |

### 최적화 전략
- Next.js Image 컴포넌트 (WebP 자동 변환)
- 풀페이지 이미지 프리로딩 (1화면 앞까지)
- 게시판 콘텐츠 SSG (빌드 시 생성)
- 폰트: next/font (Noto Sans KR)

---

## 5. 개발 환경

| 도구 | 버전 |
|------|------|
| Node.js | 20 LTS |
| pnpm | 9.x |
| TypeScript | 5.x |
| ESLint | 9.x (flat config) |
| Prettier | 3.x |

### 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_KAKAO_MAP_KEY= (또는 NAVER_MAP_KEY)
```
