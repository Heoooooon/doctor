# 환자사례 폴더 사용법

`/cases` (환자사례 게시판)에 표시되는 사례는 이 폴더 안의 **하위 폴더**를 자동으로 읽어 만들어집니다.
DB·관리자 업로드 불필요 — 폴더만 넣고 커밋·배포하면 사이트에 나타납니다.

## 사례 1건 추가 방법

1. 이 폴더 안에 새 폴더를 만든다 (영문/숫자 폴더명 권장, 예: `implant-01`)
2. 그 안에 사진 2장을 넣는다:
   - `before.jpg` (치료 전) — 파일명이 `before`로 시작하면 됨 (jpg/png/webp 가능)
   - `after.jpg`  (치료 후) — 파일명이 `after`로 시작하면 됨
3. `info.json` 파일을 만든다 (아래 형식)

```
public/images/case/
  implant-01/
    before.jpg
    after.jpg
    info.json
```

## info.json 형식

```json
{
  "title": "10년전에 한 임플란트가 빠질것 같아요",
  "category": "임플란트",
  "treatment_type": "전체 임플란트",
  "treatment_period": "약 2주",
  "patient_info": "50대 남성",
  "description": "사례 간단 설명 (선택)",
  "order": 1
}
```

- `category` (필수): 자연치아살리기 / 임플란트 / 심미보철 / 치아교정 中 하나 (정확히)
- `treatment_type` (선택): 소분류 탭 이름과 일치시키면 해당 소분류에서도 보임
  - 자연치아살리기: VPT / 레진빌드업 / 신경치료 / 최소삭제 온레이 / 잇몸치료
  - 임플란트: 즉시로딩 임플란트 / 전체 임플란트 / 앞니 임플란트
  - 심미보철: 라미네이트 / 앞니레진(diastema) / 치아미백
  - 치아교정: 인비절라인 / 소아교정
- `treatment_period`, `patient_info`, `description` (선택): 카드에 표시
- `order` (선택): 숫자가 작을수록 앞에 표시

## 표시 방식
- **치료 후(AFTER)**: 누구나 공개
- **치료 전(BEFORE)**: 블러 처리 → 로그인하면 공개

> `_` 또는 `.` 으로 시작하는 폴더(예: `_TEMPLATE`)는 무시됩니다.
