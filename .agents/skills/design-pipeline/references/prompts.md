# 재사용 위임 프롬프트

[절차로 돌아가기](../SKILL.md) | [루브릭](rubric.md)

실제 위임 전에 `<...>`를 대상 경로·파일 목록·명령·버전으로 채운다. 없는 도구·승인·산출물을 있다고 쓰지 않는다. 아래 프롬프트는 네이티브 태스크 위임용으로 영어를 유지한다. 오케스트레이터만 Aside를 운전하며 이미지 리뷰어에게는 같은 원본 묶음을 각각 전달한다.

## 취향·레퍼런스 정리 담당

```text
Task: Produce an evidence-based taste and reference brief for <audience and page>.
Read <AGENTS path>, <brand/design/SEO/medical paths>, and existing evidence at
<taste profile, direction, concept review, DESIGN, research README paths>.
Allowed worktree/files: <exact scope>. Output: <exact brief and reference manifest paths>.
Preserve user changes. Do not restart completed large research or reopen an approved
direction without a new contradiction. Separate direct quotes, hearsay, inference,
observed screens, and unknowns. Cite source locations. Map each section to a user
question, evidence, and action. Record what to borrow and reject from references.
No browser driving: request precise captures from the orchestrator. Do not claim
pixel inspection unless you can actually read the provided images. Record asset
rights and missing evidence; do not invent statistics, credentials, or contacts.
Return the brief, unresolved decisions, and actual sources read. No app edits,
commits, merges, deployment, or prerecorded approval claims.
```

## 3방향 시안 제작 담당

```text
Task: Create three readable section-by-section directions A/B/C for <page scope>.
Inputs: <taste/reference manifests>, <project constraints>, <section inventory>.
Allowed worktree/files: <exact concept files>. Outputs: <A/B/C source and image
paths>, <MANIFEST path>. Use the same safe, realistic content in all directions.
Make information order, image emphasis, typography, and density meaningfully
different, not just colors. Include every section plus header/footer, readable
desktop/mobile section images, and an overview. Record CSS viewport, DPR, actual
pixel size, asset provenance, and proposed states; fixed boards are not proof of
responsive behavior. Ask the sole orchestrator browser driver for HTML captures.
If image generation is available, record the actual tool outcome. A 403 means
generation failed, with no model-generated image. Label any HTML/CSS fallback
as an HTML-rendered comp, never as generated-model output. Do not fabricate files
or success. If generated images are a required deliverable, leave that gate open.
No application edits, approval claims, commits, merges, or deployment.
```

## 독립 이미지 리뷰어 R1 / R2

같은 템플릿으로 두 개의 독립 태스크를 시작한다. 비교 시안 리뷰와 실제 DOM 리뷰 모두 사용한다. 다른 리뷰어 답변·추천 결과는 두 원문 수령 전 전달하지 않는다.

```text
Task: Independently review <concept directions OR actual DOM candidate>.
Reviewer ID: <R1 or R2>. Required capability: actual image understanding.
Inputs: <taste profile>, <constraints or approved DESIGN>, <rubric path>,
<exact manifest listing every section, viewport, state, and original image>.
Output only to <assigned review path>; no other edits. Do not drive any browser,
modify the app, commit, merge, or read another reviewer's output. The orchestrator
is the only Aside driver. If a capture is missing, request it by exact surface.
First list images actually opened and any failures. If you cannot inspect pixels,
say so and do not score visual quality from code, filenames, OCR, or summaries.
For every section, including header/footer and shared interactions, score the six
rubric axes from 1 to 5. Inspect all supplied viewport/state variants and use the
worst score per axis for the section rollup. Identify strongest/weakest sections.
Provide image path, viewport/state, precise location or coordinates, observed
defect, user impact, and concrete correction. Evaluate commercial quality, not
just correct layout. A neat proposal, swatches without product previews, weak
imagery, awkward CJK wrapping, or wasteful density may still fail.
Each section average must be at least 4/5 in EACH independent review. No overall
mean can hide a failing section. Unresolved clipping, CJK, accessibility, other
blockers, or missing evidence means HOLD regardless of scores. Do not round up
to pass. Separate image-visible implementation plausibility from verified runtime
behavior and asset rights. Return your complete score table, blockers, suggested
direction (for concepts), limitations, and evidence-backed verdict.
```

## DESIGN 계약·구현 담당

```text
Task: <write DESIGN contract OR implement the approved image-to-code contract>.
Inputs: <approved direction and actual owner instruction reference>, <selected
and re-reviewed image manifest>, <DESIGN path>, <project guidance paths>.
Allowed worktree/files: <exact scope>. Required artifacts: <exact paths>.
Check approval scope before implementation; a recommendation is not approval.
Map source geometry, visual hierarchy, content, assets, and responsive intent to
semantic DOM, real text, links, and controls. Record intentional differences.
Never replace the page with a screenshot or fake a working CTA. Keep product
screenshots identifiable as static evidence. Preserve safety controls and user
changes. Do not import contacts, palettes, or section counts from an unrelated site.
For behavioral changes, demonstrate RED at the real seam, then GREEN using
<repository-discovered test command>. Subscribe to exact async events before the
action, with bounded timeouts; no sleep/polling-delay tests. Preserve integration
behavior in mocks. Run Bun targets reliably in a single run. For visual/copy-only
work, use real-surface review, not prose/prompt-pinning tests.
Run <diagnostics>, <related tests when applicable>, <build>, and report actual
commands/results. Ask the sole orchestrator browser driver for the complete
<route x section x viewport x state matrix>. Do not claim browser or pixel review
you did not perform. Return changes, command evidence, missing assets, and blockers.
No commit, merge, release, cookie reset, or live booking submission authorization.
```

## fresh ultrabrain 최종 리뷰어 1명

오케스트레이터가 새 컨텍스트·ultrabrain으로 실행한다. `<candidate HEAD>`는 실행 시 `git rev-parse HEAD`로 얻은 값이며 이 템플릿에 현재 저장소 값을 미리 넣지 않는다.

```text
Task: Fresh final review of exactly <candidate HEAD>, using ultrabrain.
Repository/worktree: <path>. Base/diff range: <base..candidate>.
Inputs: <AGENTS and four guidance docs>, <owner instruction and approval scope>,
<taste/direction/DESIGN>, <two independent image reviews>, <actual browser evidence
manifest bound to this candidate>, <diagnostics/test/build command logs>.
Report destination: <approved evidence location outside the candidate tree>.
Read-only review; no app edits, browser driving, commits, merges, or deployment.
Verify HEAD and tree consistency before and after review. Dirty changes, stale
screenshots, or a changed candidate cannot be reviewed as exact HEAD. Confirm the
served build and assets correspond to the candidate, not another worktree.
Inspect the diff and affected integration seams, contract fidelity, every-section
score gates, visual/copy corrections, CJK/a11y, medical/privacy controls, truthful
assets, and actual CTA behavior. Do not accept earlier PASS labels as evidence.
If you cannot read images, state that limitation and cite precise observations
from the two image-capable reviewers; never claim personal pixel inspection.
Separate verified local/noindex quality from owner-dependent public release and
unmeasured SEO/booking outcomes. Do not request removing safety controls for a
Lighthouse score. Check explicit merge authority separately from direction approval.
Return the exact reviewed HEAD, files/evidence actually inspected, findings with
locations and severity, missing evidence, and an evidence-backed PASS or HOLD.
PASS requires no unresolved blockers; recommendations and unknowns are not prior
approvals. Any subsequent candidate change invalidates this verdict.
```
