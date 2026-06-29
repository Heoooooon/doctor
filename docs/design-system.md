# 서울이건치과 디자인 시스템

> 이 파일이 디자인 기준 단일 소스(Single Source of Truth)입니다.
> `globals.css`와 항상 동기화하세요.

---

## 1. 폰트

### 기본 폰트: Pretendard

```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css`

| Weight | 이름 | 용도 |
|--------|------|------|
| 400 | Regular | 본문, 설명 텍스트 |
| 500 | Medium | 보조 강조 |
| 600 | SemiBold | 서브 타이틀, 레이블 |
| 700 | Bold | 섹션 제목 |
| 800 | ExtraBold | 히어로 타이틀 |
| 900 | Black | 임팩트 포인트 (최소 사용) |

### 타이포그래피 스케일

| 역할 | 데스크톱 | 모바일 | Weight | Line-height |
|------|----------|--------|--------|-------------|
| 히어로 타이틀 | 48px | 28px | 800 | 1.2 |
| 섹션 타이틀 | 36px | 24px | 700 | 1.3 |
| 서브 타이틀 | 24px | 20px | 600 | 1.4 |
| 본문 Large | 18px | 18px | 400 | 1.65 |
| 본문 | 16px | 16px | 400 | 1.65 |
| 캡션 / 주석 | 14px | 14px | 400 | 1.5 |

**홈페이지 최소 폰트 크기: 18px** (`globals.css` readability 규칙 적용)

---

## 2. 컬러

```css
/* globals.css :root */
--e-bg:      #F8F7F9   /* 페이지 배경 */
--e-dark:    #2B2D42   /* 헤더·네이비 섹션 */
--e-primary: #0080C8   /* CTA·링크·포인트 */
--e-accent:  #0080C8   /* 호버·하이라이트 */
```

| 역할 | HEX | 적용 |
|------|-----|------|
| 배경 | `#F8F7F9` | 섹션 기본 배경 |
| 네이비 | `#2B2D42` | 신뢰 섹션, 어두운 영역 |
| 파랑 (Primary) | `#0080C8` | 버튼, 포인트 텍스트 |
| 흰색 | `#FFFFFF` | 카드, 팝업 배경 |
| 본문 텍스트 | `#1a1a1a` | 일반 body 텍스트 |
| 보더 | `#E5E7EB` | 구분선 |
| 비활성 | `#9CA3AF` | placeholder, 비활성 |

**사용 원칙**
- 주요 CTA는 반드시 `#0080C8` (Primary)
- 배경이 어두울 때 (`--e-dark`) 텍스트는 흰색 또는 `#F8F7F9`
- 임의 색상 추가 금지 — 팔레트 외 색상은 반드시 이 파일에 먼저 추가

---

## 3. 간격 시스템

Tailwind 기준 (기본 4px 단위)

| 토큰 | 값 | 사용 |
|------|-----|------|
| 1 | 4px | 아이콘 내부 미세 간격 |
| 2 | 8px | 인라인 요소 간 |
| 4 | 16px | 컴포넌트 내부 패딩 |
| 6 | 24px | 섹션 내 요소 간격 |
| 8 | 32px | 카드 간 간격 |
| 12 | 48px | 섹션 간 간격 |
| 16 | 64px | 대형 섹션 간격 |
| 24 | 96px | 풀페이지 섹션 패딩 |

**여백 원칙**
- 섹션 좌우 패딩: 모바일 `px-4`(16px), 데스크톱 `px-8`(32px) 이상
- 섹션 상하 패딩: 최소 `py-16`(64px) 유지
- 컨텐츠 최대 너비: `max-w-5xl` (1024px) 또는 `max-w-7xl` (1280px)

---

## 4. 컴포넌트 규칙

### 버튼

```
Primary CTA:   bg-[#0080C8] text-white rounded-md px-6 py-3 font-semibold
               hover:bg-[#006BA8]
Secondary:     border border-[#0080C8] text-[#0080C8] rounded-md px-6 py-3
               hover:bg-[#0080C8]/10
Ghost:         text-[#0080C8] underline-offset-4 hover:underline
```

- 터치 최소 영역: `min-height: 44px` (모바일 필수)
- 비활성: `opacity-50 cursor-not-allowed`

### 카드

```
기본:   bg-white rounded-lg shadow-sm p-6
호버:   shadow-md transition-shadow duration-300
다크:   bg-[#2B2D42] text-white rounded-lg p-6
```

### 입력 (하단 상담바)

```
기본:   bg-transparent border-b border-gray-400 text-white px-4 py-2
포커스: border-b-2 border-[#0080C8] outline-none
에러:   border-b-2 border-red-500
```

---

## 5. 반응형 브레이크포인트

| 이름 | 값 | 대상 |
|------|-----|------|
| (기본) | — | 모바일 우선 |
| md | 768px | 태블릿 이상 |
| lg | 1024px | 노트북 이상 |
| xl | 1280px | 데스크톱 |
| 2xl | 1536px+ | 풀HD |

**모바일 특이사항**
- 우측 플로팅 사이드바: 모바일 숨김 (`hidden md:flex`)
- 하단 고정바 높이: `--mobile-bottom-bar-height: 60px`
- 헤더 높이: `--mobile-header-height: 64px`
- 가로 스크롤 금지: `overflow-x: hidden`

---

## 6. 애니메이션

현재 홈페이지에서 애니메이션은 **전역 비활성화** 상태 (`globals.css` 참고).
활성화된 예외:

| 효과 | 클래스 | 비고 |
|------|--------|------|
| 마퀴 | `.all-on-marquee-track` | 올온 섹션 로고 슬라이드 |
| 배경 팬 | `.implant-bg-img` | 임플란트 섹션 배경 |
| 모바일 슬라이드 팬 | `.mobile-pan-0~3` | 히어로 슬라이드별 |

새 애니메이션 추가 시: 필요 최소한으로, `globals.css`에 추가하고 이 파일에 기록.

---

## 7. 이미지 규격

| 용도 | 권장 크기 | 포맷 |
|------|----------|------|
| 히어로 슬라이드 | 1920 × 937px | WebP / JPG |
| 게시판 히어로 | 1920 × 600px | WebP / JPG |
| 치료 전후 사진 | 800 × 600px | WebP / JPG |
| 의료진 프로필 | 600 × 800px | WebP / JPG |
| 내부 전경 | 1200 × 800px | WebP / JPG |
| 아이콘 | 48 × 48px | SVG 우선 |

---

## 8. 이 파일 유지 규칙

- 새 색상·폰트·간격을 추가하면 반드시 이 파일도 업데이트
- `globals.css` 변경 시 섹션 2(컬러)·섹션 1(폰트) 동기화
- 컴포넌트 스타일 변경 시 섹션 4 업데이트
