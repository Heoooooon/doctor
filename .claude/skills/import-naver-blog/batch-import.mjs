#!/usr/bin/env node
// 네이버 블로그 글 일괄 → 원장칼럼 저장
// 사용: npm run dev (먼저 실행) → node .claude/skills/import-naver-blog/batch-import.mjs urls.txt
//   urls.txt: 블로그 글 주소를 한 줄에 하나씩 (blog.naver.com/{id}/{logNo} 또는 naver.me 단축링크)
// dev 서버는 NODE_ENV !== production 이라 관리자 인증을 자동 통과한다(쿠키 불필요).
//
// 옵션(환경변수):
//   BASE=http://localhost:3000   대상 서버 (기본 localhost:3000)
//   DELAY=1500                   글 사이 대기(ms), OpenAI/네이버 rate limit 완화
//   INACTIVE=1                   저장 시 비활성(is_active:false)으로 — 검토 후 노출하고 싶을 때

import { readFileSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:3000'
const DELAY = Number(process.env.DELAY || 1500)
const ACTIVE = process.env.INACTIVE ? false : true

const file = process.argv[2]
if (!file) {
  console.error('사용법: node batch-import.mjs urls.txt')
  process.exit(1)
}

const urls = readFileSync(file, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let ok = 0
let fail = 0

for (const [i, url] of urls.entries()) {
  const tag = `[${i + 1}/${urls.length}]`
  try {
    // 1) 불러오기 + 이미지 재업로드 + AI 변환
    const impRes = await fetch(`${BASE}/api/columns/import-naver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const imp = await impRes.json()
    if (!impRes.ok) {
      console.error(`${tag} ❌ import 실패 (${impRes.status}): ${imp.error || ''} — ${url}`)
      fail++
      await sleep(DELAY)
      continue
    }

    // 2) 칼럼 저장
    const payload = {
      title: imp.title,
      content: imp.content,
      category: imp.category,
      tags: imp.tags,
      image_url: imp.image_url || imp.images?.[0]?.url || null,
      is_active: ACTIVE,
    }
    const saveRes = await fetch(`${BASE}/api/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!saveRes.ok) {
      const err = await saveRes.json().catch(() => ({}))
      console.error(`${tag} ❌ save 실패 (${saveRes.status}): ${err.error || ''} — ${imp.title}`)
      fail++
    } else {
      console.log(`${tag} ✅ ${imp.title}  (이미지 ${imp.images?.length || 0}장)`)
      ok++
    }
  } catch (e) {
    console.error(`${tag} ❌ 예외: ${e.message} — ${url}`)
    fail++
  }
  await sleep(DELAY)
}

console.log(`\n완료: 성공 ${ok} / 실패 ${fail} / 전체 ${urls.length}`)
console.log('검토: /admin/columns  ·  배포: vercel --prod')
