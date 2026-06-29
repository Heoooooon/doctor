> ⚠️ 이 파일은 초기 기획 단계 문서입니다. 실제 기준은 **`docs/design-system.md`** 를 사용하세요.

# 서울이건치과 홈페이지 디자인 시스템 (기획 아카이브)

## 1. 색상 팔레트

### Primary (올리브)
| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | 올리브 | #6B7B3A |
| Primary Light | 라이트 올리브 | #8A9B5A |
| Primary Dark | 다크 올리브 | #4A5A2A |
| Primary Muted | 뮤트 올리브 | #D4DCC0 |

### Neutral (화이트 베이스)
| 용도 | 색상 | HEX |
|------|------|-----|
| White | 배경 | #FFFFFF |
| Gray 50 | 연한 배경 | #F9FAFB |
| Gray 100 | 카드 배경 | #F3F4F6 |
| Gray 200 | 보더 | #E5E7EB |
| Gray 400 | 비활성 텍스트 | #9CA3AF |
| Gray 600 | 본문 텍스트 | #4B5563 |
| Gray 800 | 제목 텍스트 | #1F2937 |
| Gray 900 | 강조 텍스트 | #111827 |
| Black | 검정 배경 (4화면) | #111111 |

### Accent
| 용도 | 색상 | HEX |
|------|------|-----|
| CTA 버튼 | 올리브 골드 | #8B7D3C |
| Error | 레드 | #EF4444 |
| Success | 그린 | #22C55E |
| Info | 블루 | #3B82F6 |

---

## 2. 타이포그래피

### 폰트 패밀리
- **한글**: Noto Sans KR (Google Fonts)
- **영문**: Noto Sans KR 또는 Inter
- **로고**: SEOUL EGUN DENTAL (커스텀 / 세리프 계열)

### 사이즈 스케일
| 용도 | 사이즈 | Weight | Line Height |
|------|--------|--------|-------------|
| Hero Title | 48px (3rem) | 700 Bold | 1.2 |
| Section Title | 36px (2.25rem) | 700 Bold | 1.3 |
| Sub Title | 24px (1.5rem) | 600 SemiBold | 1.4 |
| Body Large | 18px (1.125rem) | 400 Regular | 1.6 |
| Body | 16px (1rem) | 400 Regular | 1.6 |
| Body Small | 14px (0.875rem) | 400 Regular | 1.5 |
| Caption | 12px (0.75rem) | 400 Regular | 1.5 |

### 모바일 타이포
| 용도 | 사이즈 |
|------|--------|
| Hero Title | 28px |
| Section Title | 24px |
| Sub Title | 20px |
| Body | 15px |

---

## 3. 컴포넌트

### Button
```
Primary:    bg-olive text-white rounded-md px-6 py-3 hover:bg-olive-dark
Secondary:  border-olive text-olive rounded-md px-6 py-3 hover:bg-olive/10
CTA:        bg-olive-gold text-white rounded-md px-8 py-4 font-semibold
Ghost:      text-olive hover:underline
```

### Input (하단 고정바)
```
Default:    bg-transparent border-b border-gray-400 text-white px-4 py-2
Focus:      border-b-2 border-olive outline-none
Error:      border-b-2 border-red-500
```

### Card (게시판 치료 항목)
```
Default:    bg-white rounded-lg shadow-sm p-6
Hover:      shadow-md transition-shadow duration-300
Dark:       bg-gray-900 text-white rounded-lg p-6
```

### Accordion (FAQ)
```
Trigger:    flex justify-between items-center py-4 border-b cursor-pointer
Content:    py-4 text-gray-600 animate-accordion
Icon:       rotate-180 transition-transform duration-200
```

### Slide Indicator (메인 1화면)
```
Dot:        w-3 h-3 rounded-full bg-white/50
Active:     w-3 h-3 rounded-full bg-white border-2 border-olive
Progress:   circular progress ring around active dot
```

### Floating Sidebar (우측)
```
Container:  fixed right-5 top-1/2 -translate-y-1/2 z-50
            bg-gray-900/90 backdrop-blur-sm rounded-lg p-2
Button:     w-10 h-10 flex items-center justify-center
            hover:bg-white/10 hover:text-olive transition
Phone:      mt-2 pt-2 border-t border-white/20
```

### Bottom Bar (하단 고정)
```
Container:  fixed bottom-0 left-0 right-0 z-50
            bg-gray-900/95 backdrop-blur-sm
            flex items-center justify-center gap-4 px-6 py-3
```

---

## 4. 간격 시스템

| Token | 값 | 용도 |
|-------|-----|------|
| xs | 4px (0.25rem) | 아이콘 내부 |
| sm | 8px (0.5rem) | 인라인 요소 간격 |
| md | 16px (1rem) | 컴포넌트 내부 패딩 |
| lg | 24px (1.5rem) | 섹션 내 간격 |
| xl | 32px (2rem) | 카드 간 간격 |
| 2xl | 48px (3rem) | 섹션 간 간격 |
| 3xl | 64px (4rem) | 큰 섹션 간 간격 |
| 4xl | 96px (6rem) | 풀페이지 섹션 패딩 |

---

## 5. 반응형 브레이크포인트

| 이름 | 값 | 대상 |
|------|-----|------|
| sm | 640px | 소형 모바일 |
| md | 768px | 태블릿 |
| lg | 1024px | 노트북 |
| xl | 1280px | 데스크톱 |
| 2xl | 1920px | 풀HD 모니터 |

### 반응형 전략
| 요소 | 모바일 | 데스크톱 |
|------|--------|----------|
| 풀페이지 스크롤 | 일반 스크롤 | CSS scroll-snap |
| 우측 사이드바 | 숨김 (하단바만) | 표시 |
| 하단 고정바 | 간소화 (이름/연락처/버튼) | 풀 레이아웃 |
| 게시판 지그재그 | 세로 배치 | 좌우 교차 |
| GNB | 햄버거 메뉴 | 햄버거 메뉴 (동일) |
| 커스텀 커서 | 비활성 | 서울대 로고 따라다님 |
| 히어로 이미지 | 세로 비율 조정 | 1920x937 |

---

## 6. 애니메이션

| 효과 | 적용 | 속성 |
|------|------|------|
| 페이드인 | 섹션 진입 | opacity 0→1, translateY 20→0, 600ms ease |
| 슬라이드 | 메인 1화면 | translateX, 500ms ease-in-out |
| 카운팅 | 5화면 증례 숫자 | requestAnimationFrame 기반 |
| 호버 줌 | 증례 B/A 사진 | scale 1→1.05, 300ms |
| 아코디언 | FAQ 열기/닫기 | max-height + opacity, 300ms |
| 스크롤 스냅 | 메인 풀페이지 | scroll-snap-type: y mandatory |

---

## 7. 아이콘 시스템

- 기본: Lucide Icons (React)
- 소셜: 커스텀 SVG (카카오톡, 네이버블로그, 네이버플레이스)
- 치과 관련: 사용자 제공 아이콘 (icons 폴더)

---

## 8. 이미지 가이드

| 용도 | 사이즈 | 포맷 |
|------|--------|------|
| 메인 슬라이드 | 1920 x 937px | WebP/JPG |
| 게시판 히어로 | 1920 x 600px | WebP/JPG |
| 증례 B/A | 800 x 600px | WebP/JPG |
| 원장님 프로필 | 600 x 800px | WebP/JPG |
| 내부전경 | 1200 x 800px | WebP/JPG |
| 아이콘 | 48 x 48px | SVG/PNG |
