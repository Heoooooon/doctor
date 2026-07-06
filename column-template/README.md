# 원장칼럼 템플릿 (수정 내용 모음)

블로그 URL → AI 변환 기능이 만드는 칼럼의 **템플릿**을 이 폴더에 정리했습니다.
2026-07-06 에 docx 원본 템플릿(`blog-template-for-claude-code.md.docx`)에 맞춰 정렬했습니다.

## 이 폴더 파일

| 파일 | 내용 |
|---|---|
| `README.md` | 이 문서 — 변경 요약 |
| `ai-system-prompt.md` | 실제 AI에 들어가는 시스템 프롬프트(= 코드의 `COLUMN_SYSTEM_PROMPT`) 전문 |
| `post-wrap.css` | 칼럼 본문 렌더링 CSS(= `app/globals.css`의 `.post-wrap` 부분) |
| `template-preview.html` | CSS + 예시 내용이 합쳐진 **단독 미리보기 HTML** (브라우저로 바로 열어 확인 가능) |

## 실제로 적용된 위치 (코드)

- AI 프롬프트: `lib/column-ai.ts` → `COLUMN_SYSTEM_PROMPT`, `NAVER_SYSTEM_PROMPT`
- 렌더링 CSS: `app/globals.css` → `.post-wrap` 블록
- 칼럼 상세 렌더: `app/column/[id]/page.tsx` (`<div class="post-wrap">` 안에 AI가 만든 HTML 삽입)

> 이 폴더는 **참고/기록용**입니다. 실제 동작은 위 코드 파일이 담당하므로,
> 템플릿을 바꾸려면 `lib/column-ai.ts`와 `app/globals.css`를 함께 수정해야 합니다.

## 2026-07-06 변경 요약

1. **docx 템플릿 고정 문구 반영**
   - 맺음말 마지막 고정 문장 추가: `서울이건치과에서는 남은 치아 상태와 씹는 힘을 함께 고려해 보존을 우선하는 방향으로 치료를 설명드리고 있습니다.`
   - 하단 안내 박스 문구를 docx대로 교체: `해당 케이스는 위 환자에게만 적용되는 술식이며 개인차가 있을 수 있습니다.`
2. **비교표(`<table>`) 규칙 추가** — 원문에 비교/차이 설명이 있으면 표로 정리.
3. **본문 소단원 규칙 강화** — 원문 구성에 맞춰 `<h2>` 섹션을 최소 3개 이상 번호 매겨 생성.
4. **빈 이미지 처리** — 이미지 없으면 `src=""`로 두고, CSS에서 자동 숨김(`.img-box img[src=""]{display:none}`).
5. **관리자 초안 미리보기 404 수정** — `is_active=false` 초안도 로그인한 관리자는 미리보기 가능.
6. **AI 라우트 실행시간 상한** — 변환이 30~40초 걸려도 안 잘리도록 `maxDuration=300` 적용.

## 필수 구조 (순서)

1. `<h1>` 제목 + `<span class="subtitle">` 부제
2. (선택) 대표 이미지 `.img-box` + `.img-caption`
3. 도입부 — 고정 인사 문장 + 환자 질문(`<strong>`) + 핵심 결론(`.highlight`)
4. 본문 소단원 `<h2>1. …</h2>` + `<p>` (3개 이상)
5. 섹션별 이미지 `.img-box`
6. (선택) 비교표 `<table>`
7. (선택) FAQ `<h2>자주 묻는 질문</h2>` + Q&A
8. 정리 박스 `.summary-box`(✅ 정리하면)
9. 맺음말 `.closing-box` (+ 고정 마지막 문장)
10. 안내 박스 `.summary-box`(📌 안내, 고정·수정 금지)
