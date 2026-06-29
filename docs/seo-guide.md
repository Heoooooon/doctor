# 서울이건치과 SEO 가이드

## 1. 핵심 키워드

### Primary (메인 타겟)
- 수원 임플란트
- 수원 교정치과
- 수원 영통 치과
- 수원 소아치과
- 수원 올온4

### Secondary (서브 타겟)
- 영통 임플란트
- 인계동 치과
- 수원 인비절라인
- 수원 어린이치과
- 수원 라미네이트

### Brand (브랜드)
- 서울이건치과
- 이건치과
- 서울대 치과 수원

---

## 2. 페이지별 SEO 설정

### 메인 페이지 (`/`)
```
title: 서울이건치과 | 수원 영통 임플란트·교정·소아치과 전문
description: 서울대 출신 전문의 5인이 직접 진료하는 수원 영통 대형 치과.
             임플란트, 교정, 소아치과, 올온4 전문. 031-896-5512
keywords: 수원 치과, 수원 임플란트, 수원 교정, 영통 치과, 소아치과
```

### 임플란트 게시판 (`/implant`)
```
title: 수원 임플란트 | 서울이건치과 - 올온4·즉시로딩·네비게이션
description: 서울대 출신 원장이 직접 집도하는 수원 임플란트.
             올온4, 즉시로딩, 네비게이션 가이드 임플란트 전문
```

### 교정 게시판 (`/orthodontics`)
```
title: 수원 교정치과 | 서울이건치과 - 인비절라인 투명교정
description: 교정과 전문의 유수현 원장의 인비절라인 투명교정, 소아 성장기 교정
```

### 소아치과 (`/pediatric`)
```
title: 수원 소아치과 | 서울이건치과 - 소아전문의 직접 진료
description: 소아치과 전문의 백설아 원장. 웃음가스 치료로 아이도 편안한 진료
```

---

## 3. 구조화 데이터 (Schema.org)

필수 적용 타입:

```json
{
  "@type": "Dentist",
  "name": "서울이건치과",
  "telephone": "031-896-5512",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "인계로220번길 6-3 미산빌딩 2층",
    "addressLocality": "수원시 영통구",
    "addressRegion": "경기도",
    "postalCode": "16509",
    "addressCountry": "KR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.264707,
    "longitude": 127.041222
  },
  "openingHoursSpecification": [...]
}
```

---

## 4. 기술 SEO 체크리스트

### 필수
- [ ] `next/metadata` API로 각 페이지 title/description 설정
- [ ] `robots.txt` — 관리자 경로 (`/admin`) 차단
- [ ] `sitemap.xml` — 게시판 7개 + 메인 포함
- [ ] OG 이미지 (`og:image`) — 각 게시판별 1200×630px
- [ ] canonical URL 설정

### 권장
- [ ] `alt` 텍스트 — 모든 이미지에 한국어로 작성
- [ ] 구조화 데이터 (Dentist 타입) 메인 페이지 적용
- [ ] Core Web Vitals — LCP 2.5초 이하, CLS 0.1 이하
- [ ] 모바일 친화성 — Google Mobile-Friendly Test 통과

---

## 5. 네이버 SEO

네이버 플레이스가 주요 유입 채널이므로 별도 관리:

- **네이버 플레이스**: 사진·진료시간·소개 주기적 업데이트
- **네이버 블로그** (`blog.naver.com/seoulegundc`): 월 2회 이상 치료 정보 포스팅
- **네이버 검색**: `site:seoulegundc.com` 으로 인덱싱 확인

---

## 6. 콘텐츠 가이드

- 치료 설명 글: 환자 관점, 쉬운 용어 우선 / 전문 용어는 괄호 안에 병기
- 이미지 파일명: `수원-임플란트-전후.webp` 형식 (한글 허용, 공백 대신 하이픈)
- 내부 링크: 게시판 간 연관 치료 링크 연결 (임플란트 ↔ 올온4 등)
