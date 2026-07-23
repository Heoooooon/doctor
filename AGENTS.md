## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:

* Product ideas, "is this worth building", brainstorming → invoke office-hours
* Bugs, errors, "why is this broken", 500 errors → invoke investigate
* Ship, deploy, push, create PR → invoke ship
* QA, test the site, find bugs → invoke qa
* Code review, check my diff → invoke review
* Update docs after shipping → invoke document-release
* Weekly retro → invoke retro
* Design system, brand → invoke design-consultation
* Visual audit, design polish → invoke design-review
* Architecture review → invoke plan-eng-review
* Save progress, checkpoint, resume → invoke checkpoint
* Code quality, health check → invoke health

---

## Project Context

This is the official website project for 서울이건치과 (Seoul Egun Dental Clinic).

Before making any design, copy, layout, SEO, or component decision, always refer to:

- `docs/brand.md` — 브랜드 정체성, 슬로건, 톤앤보이스, 금지 표현, 섹션별 메시지 방향
- `docs/design-system.md` — 폰트(Pretendard), 컬러, 간격, 컴포넌트, 반응형 기준
- `docs/seo-guide.md` — 핵심 키워드, 페이지별 메타 태그, 구조화 데이터, 네이버 전략
- `docs/medical-law.md` — 의료법 금지 표현, 필수 면책 문구, 개인정보 처리 기준
- `docs/ops-handoff.md` — **서버/배포/SSH 접근 정보**. 배포, 서버 점검, nginx/pm2 작업 전 반드시 읽을 것.

### 서버 작업 (배포·SSH)

- 실서버는 VPS `172.237.29.96`, SSH 키 인증이 이미 설정돼 있어 `ssh -o BatchMode=yes root@172.237.29.96 "<명령>"`으로 비대화형 실행 가능.
- 배포는 `./scripts/deploy-vps.sh` 하나로 끝난다. 임의의 rsync/pm2 조작 금지.
- 상세 절차·철칙·롤백은 `docs/ops-handoff.md`가 단일 소스.

### 핵심 원칙 요약

- 폰트: **Pretendard** (Noto Sans KR 아님)
- 주요 컬러: `#F8F7F9` (배경) / `#2B2D42` (네이비) / `#0080C8` (CTA)
- 홈페이지 최소 폰트: **18px**
- CTA 문구: "상담 신청", "내 치아 상태 확인" 등 부담 없는 행동 유도
- 치료 결과 보장·최상급 표현 금지 (의료법 준수)
