> ⚠️ 이 파일은 초기 기획 단계 문서입니다. 참고용으로만 사용하세요.

# 서울이건치과 홈페이지 코딩 컨벤션 (기획 아카이브)

## 1. 파일 구조

```
src/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (헤더, 하단바, 사이드바, 푸터)
│   ├── page.tsx                      # 메인 페이지 (풀페이지 스크롤)
│   ├── globals.css                   # 전역 스타일
│   ├── about/page.tsx                # 이건치과소개
│   ├── natural-tooth/page.tsx        # 자연치아살리기
│   ├── implant/page.tsx              # 임플란트
│   ├── cosmetic/page.tsx             # 심미보철
│   ├── orthodontics/page.tsx         # 교정치료
│   ├── pediatric/page.tsx            # 소아치과
│   ├── media/page.tsx                # 이건미디어
│   ├── notice/page.tsx               # 공지사항(휴무일정) 표시
│   ├── admin/
│   │   ├── login/page.tsx            # 관리자 로그인
│   │   ├── page.tsx                  # 대시보드
│   │   ├── layout.tsx                # 관리자 레이아웃 (인증 체크)
│   │   ├── consultations/page.tsx    # 상담 DB 관리
│   │   ├── cases/page.tsx            # 증례 관리
│   │   └── notices/page.tsx          # 공지사항 관리
│   └── api/
│       ├── consultations/route.ts    # 상담 CRUD
│       ├── cases/route.ts            # 증례 CRUD
│       ├── notices/route.ts          # 공지 CRUD
│       └── upload/route.ts           # 파일 업로드
├── components/
│   ├── layout/
│   │   ├── Header.tsx                # 고정 헤더 (로고 + 햄버거)
│   │   ├── Footer.tsx                # 푸터
│   │   ├── QuickConsultBar.tsx       # 하단 고정 상담바
│   │   ├── FloatingSidebar.tsx       # 우측 플로팅 사이드바
│   │   ├── MobileNav.tsx             # 모바일 네비게이션
│   │   └── CustomCursor.tsx          # 서울대 로고 커서
│   ├── main/
│   │   ├── HeroSlider.tsx            # 1화면 슬라이드
│   │   ├── DoctorGroup.tsx           # 2화면 의료진
│   │   ├── NaturalSolution.tsx       # 3화면 보존솔루션
│   │   ├── ImplantSection.tsx        # 4화면 올온임플란트
│   │   ├── SedationSection.tsx       # 5화면 의식하진정법
│   │   └── MediaSection.tsx          # 6화면 미디어
│   ├── board/
│   │   ├── AnchorNav.tsx             # 서브메뉴 앵커 네비게이션
│   │   ├── TreatmentSection.tsx      # 치료 설명 섹션 (지그재그)
│   │   ├── BenefitList.tsx           # 치료 장점 체크리스트
│   │   ├── CaseGallery.tsx           # 증례사진 갤러리 (DB 연동)
│   │   ├── FaqAccordion.tsx          # FAQ 아코디언
│   │   ├── BlogLink.tsx              # 관련 블로그 링크
│   │   ├── CtaSection.tsx            # 상담 CTA 섹션
│   │   └── BoardHero.tsx             # 게시판 히어로 섹션
│   ├── about/
│   │   ├── DoctorProfile.tsx         # 원장님 프로필 카드
│   │   ├── ClinicCalendar.tsx        # 진료일정 캘린더
│   │   ├── PhotoGallery.tsx          # 사진 갤러리
│   │   └── MapSection.tsx            # 오시는길 지도
│   ├── ui/
│   │   ├── Button.tsx                # 공통 버튼
│   │   ├── Card.tsx                  # 공통 카드
│   │   ├── Input.tsx                 # 공통 인풋
│   │   ├── Checkbox.tsx              # 체크박스
│   │   ├── Modal.tsx                 # 모달
│   │   └── Toast.tsx                 # 토스트 알림
│   └── admin/
│       ├── DataTable.tsx             # 데이터 테이블
│       ├── ImageUploader.tsx         # 이미지 업로더
│       └── StatusBadge.tsx           # 상태 배지
├── data/
│   ├── clinic-info.ts                # 치과 기본 정보 (주소, 전화, SNS 등)
│   ├── treatments/
│   │   ├── natural-tooth.ts          # 자연치아 콘텐츠 (텍스트, FAQ)
│   │   ├── implant.ts               # 임플란트 콘텐츠
│   │   ├── cosmetic.ts              # 심미보철 콘텐츠
│   │   ├── orthodontics.ts          # 교정치료 콘텐츠
│   │   └── pediatric.ts             # 소아치과 콘텐츠
│   └── doctors.ts                    # 의료진 정보
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Supabase 브라우저 클라이언트
│   │   ├── server.ts                 # Supabase 서버 클라이언트
│   │   └── admin.ts                  # Supabase 관리자 클라이언트
│   ├── utils.ts                      # 유틸리티 함수
│   └── validators.ts                 # 입력 검증 함수
├── hooks/
│   ├── useScrollSnap.ts              # 풀페이지 스크롤 훅
│   ├── useCountUp.ts                 # 숫자 카운팅 훅
│   ├── useIntersectionObserver.ts    # 뷰포트 감지 훅
│   └── useCustomCursor.ts            # 커스텀 커서 훅
└── types/
    ├── consultation.ts               # 상담 타입
    ├── case.ts                       # 증례 타입
    ├── notice.ts                     # 공지 타입
    └── treatment.ts                  # 치료 콘텐츠 타입

public/
├── images/
│   ├── cases/                        # 증례사진 (비포/애프터)
│   │   ├── natural-tooth/
│   │   ├── implant/
│   │   ├── cosmetic/
│   │   ├── orthodontics/
│   │   └── pediatric/
│   ├── doctors/                      # 원장님 사진, 면허증, 손글씨
│   ├── clinic/                       # 내부전경 (본관/별관)
│   ├── equipment/                    # 디지털 기공소
│   ├── slides/                       # 메인 슬라이드 이미지
│   ├── icons/                        # 아이콘 (블로그, 유튜브 등)
│   └── access/                       # 오시는길 실사진
├── logo/                             # 서울대 로고, 치과 로고
└── fonts/                            # 커스텀 폰트 (필요 시)
```

## 2. 네이밍 규칙

### 파일/폴더
- **컴포넌트**: PascalCase (`HeroSlider.tsx`)
- **페이지**: kebab-case 폴더 (`natural-tooth/page.tsx`)
- **훅**: camelCase with `use` prefix (`useScrollSnap.ts`)
- **유틸리티**: camelCase (`validators.ts`)
- **데이터**: kebab-case (`clinic-info.ts`)
- **타입**: camelCase (`consultation.ts`)

### 코드
- **변수/함수**: camelCase (`handleSubmit`, `consultationData`)
- **컴포넌트**: PascalCase (`FaqAccordion`, `DoctorProfile`)
- **상수**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `CLINIC_PHONE`)
- **타입/인터페이스**: PascalCase (`Consultation`, `TreatmentContent`)
- **이벤트 핸들러**: `handle` + 동사 (`handleClick`, `handleSubmit`)
- **Boolean**: `is`/`has`/`should` prefix (`isLoading`, `hasError`)

### CSS (Tailwind)
- 커스텀 클래스: kebab-case (`scroll-snap-section`)
- CSS 변수: `--color-olive`, `--font-heading`

## 3. 코드 스타일

### 컴포넌트 구조
```typescript
// 1. imports
import { useState } from 'react'

// 2. types (간단하면 인라인, 복잡하면 별도 파일)
interface Props {
  title: string
  onSubmit: (data: FormData) => void
}

// 3. component
export default function ComponentName({ title, onSubmit }: Props) {
  // hooks
  const [isOpen, setIsOpen] = useState(false)

  // handlers
  function handleClick() { ... }

  // render
  return ( ... )
}
```

### Server vs Client 컴포넌트
```typescript
// Server Component (기본값) - 정적 콘텐츠
// 파일 상단에 아무것도 안 씀
export default function TreatmentPage() { ... }

// Client Component - 인터랙션 필요 시
'use client'
export default function HeroSlider() { ... }
```

## 4. Lint / Formatter

### ESLint
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

### Prettier
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

## 5. Git 커밋 메시지

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅 (기능 변경 없음)
refactor: 리팩토링
chore: 빌드, 설정 변경
content: 콘텐츠 추가/수정 (치료 텍스트, FAQ 등)
```

### 예시
```
feat: 하단 고정 상담바 DB 저장 기능 추가
fix: 모바일에서 풀페이지 스크롤 깨지는 문제 수정
content: 임플란트 게시판 FAQ 3개 추가
chore: Supabase 초기 설정 및 테이블 생성
```

## 6. 데이터 관리 원칙

### 정적 콘텐츠 (코드에 포함)
- 치료 설명 텍스트, 치료 장점, FAQ → `data/treatments/*.ts`
- 의료진 정보, 치과 기본 정보 → `data/doctors.ts`, `data/clinic-info.ts`

### 동적 콘텐츠 (Supabase DB)
- 증례사진 (before/after) → `cases` 테이블 + Storage
- 공지사항 (휴무일정) → `notices` 테이블
- 상담 신청 → `consultations` 테이블
