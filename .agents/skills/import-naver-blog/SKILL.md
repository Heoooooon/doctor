---
name: import-naver-blog
description: 네이버 블로그 글을 원장칼럼으로 일괄(또는 단건) 불러오기. 블로그 URL → 본문·사진 추출 → 이미지 Supabase 재업로드 → AI 칼럼 템플릿 변환 → 홈페이지 칼럼으로 저장. "네이버 블로그 불러오기", "블로그 글 전부 올리기", "칼럼 일괄 임포트" 요청 시 사용.
trigger: 사용자가 네이버 블로그 글을 홈페이지 원장칼럼으로 가져오거나 일괄 업로드하려 할 때
---

# 네이버 블로그 → 원장칼럼 임포트 스킬

서울이건치과 홈페이지의 **원장칼럼**에 네이버 블로그 글을 가져오는 작업.
단건(에디터 버튼) 흐름과, 블로그 글 전체를 한 번에 올리는 **일괄(batch)** 흐름 두 가지를 지원한다.

## 한눈에 보는 파이프라인

```
블로그 URL
  └─[1 import-naver]→ 본문 텍스트+이미지 추출 → 이미지 다운로드 → Supabase 재업로드 → OpenAI 칼럼 변환
        └─ { title, category, tags, content(HTML), images, image_url }
              └─[2 save]→ POST /api/columns → 홈페이지 칼럼 등록
```

핵심 코드:
- `app/api/columns/import-naver/route.ts` — 불러오기 + 이미지 재업로드 + AI 변환 (단건 1 URL)
- `app/api/columns/route.ts` (POST) — 칼럼 저장
- `lib/column-ai.ts` — `COLUMN_SYSTEM_PROMPT` (의료법 준수 템플릿) + OpenAI 호출
- `app/admin/columns/page.tsx` — 에디터의 "네이버 블로그" 버튼 (`handleNaverImport`)

## 동작 원리 (import-naver)

1. **URL 정규화**: `naver.me` 단축링크는 리다이렉트를 따라가 실제 주소 획득. `blog.naver.com/{id}/{logNo}`, `PostView.naver?blogId=&logNo=`, `m.blog.naver.com/...` 모두 `blogId`/`logNo`로 파싱.
2. **모바일 페이지 fetch**: `https://m.blog.naver.com/{blogId}/{logNo}` 를 **모바일 UA**로 가져온다. (PC 페이지는 iframe 안에 본문이 들어가 추출이 어려움 → 모바일은 iframe 없이 바로 렌더)
3. **본문 추출**: `se-text-paragraph` 문단과 `<img>`를 **등장 순서대로** 배열로 추출.
4. **고화질 이미지만 선별**: 본문 사진은 `data-lazy-src`에 고화질 원본이 있음(`src`는 흐린 썸네일). `pstatic.net|blogfiles|postfiles`만 통과, 프로필 썸네일(`blogpfthumb`) 제외, `type=w966`로 큰 사이즈 요청. **최대 12장**.
5. **Supabase 재업로드**: 각 이미지를 `Referer: blog.naver.com` 헤더로 다운로드 → `images` 버킷의 `columns/naver-...` 경로로 재업로드 (2KB 미만은 깨진 썸네일로 보고 버림). 네이버 핫링크 방지·이미지 유실을 막기 위해 **반드시 우리 저장소로 복사**.
6. **AI 변환**: 텍스트+업로드된 이미지 URL을 등장 순서대로 합쳐 OpenAI에 전달. `NAVER_SYSTEM_PROMPT`(= `COLUMN_SYSTEM_PROMPT` + 이미지 배치 규칙)로 칼럼 HTML 템플릿 생성. **새 이미지 URL을 지어내지 않고 제공된 URL만 사용**.
7. **반환**: `{ title, category, tags, content, images, sourceUrl, image_url }`.

## 인증 (중요)

`lib/admin-auth.ts`:
- **dev (`NODE_ENV !== 'production'`) → 항상 인증 통과.** ⇒ 로컬 dev 서버로 배치를 돌리면 쿠키 불필요. **이 방식을 권장.**
- 프로덕션 → 쿠키 `admin-session=egun-admin-authenticated` 필요.

필수 환경변수(`.env.local`): `OPENAI_API_KEY`, Supabase 키(이미지 재업로드용). 없으면 각각 503 / 이미지 스킵.

## 사용법 A — 단건 (관리자 에디터)

관리자 `/admin/columns` → 칼럼 작성 → 내용 영역의 **"네이버 블로그"** 버튼 → URL 붙여넣기 → 자동 변환되어 폼이 채워짐 → 검토 후 저장.

## 사용법 B — 전부 한 번에 (일괄 배치) ← 어제 한 작업

1. **dev 서버 실행**: `npm run dev` (localhost:3000, 인증 자동 통과)
2. **블로그 글 URL 목록 확보**: `urls.txt`에 한 줄에 하나씩. 전체 글 목록은 네이버 모바일 글목록 API로 수집 가능:
   `https://m.blog.naver.com/api/blogs/{blogId}/post-list?categoryNo=0&itemCount=30&page=1` (JSON의 `logNo`로 URL 조립). 페이지를 늘려가며 전부 수집.
3. **배치 스크립트 실행**: `node .Codex/skills/import-naver-blog/batch-import.mjs urls.txt`
   - 각 URL을 import-naver로 변환 → `POST /api/columns`로 저장. 진행 로그·오류 건너뛰기·rate limit 딜레이 포함.
4. **검토**: `/admin/columns`에서 결과 확인. 필요 시 비활성/수정. **배포는 `vercel --prod`** (git push로는 배포 안 됨).

## 재사용 시 체크리스트

- [ ] dev 서버가 떠 있는가 (`npm run dev`) — 배치는 dev 인증 우회 사용
- [ ] `OPENAI_API_KEY` + Supabase 키가 `.env.local`에 있는가
- [ ] URL 목록(`urls.txt`) 준비 — 비공개 글은 추출 불가(422)
- [ ] 변환 후 `/admin/columns`에서 카테고리·이미지·의료법 표현 검토
- [ ] 만족스러우면 `vercel --prod` 배포

## 주의·한계

- 글당 콘텐츠 이미지 **최대 12장** (`MAX_IMAGES`). 더 필요하면 route.ts 상수 조정.
- 네이버가 HTML 구조(`se-text-paragraph`, `data-lazy-src`)를 바꾸면 추출이 깨질 수 있음 → 추출 로직 점검.
- AI 변환은 OpenAI 토큰 비용 발생. 대량 배치 시 비용·rate limit 고려(딜레이).
- 의료법 필터는 프롬프트 레벨이므로 **결과는 사람이 최종 검토** 필요.
