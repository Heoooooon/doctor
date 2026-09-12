import assert from 'node:assert/strict'
import test from 'node:test'
import { createAdminSessionToken } from '../lib/admin-session.ts'
import { draft, installColumnDatabase, now, post, secondPost } from './column-runtime.mts'

const { NextRequest } = await import('next/server')
const { GET } = await import('../app/api/columns/route.ts')

for (const cookie of [undefined, 'forged-session']) {
  test(`all-column API rejects ${cookie ? 'forged' : 'missing'} authentication before database access`, async t => {
    // Given: the same public API can request private drafts using all=1.
    installColumnDatabase(t)
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    if (cookie) process.env.COLUMN_TEST_COOKIE = cookie
    const fetchSpy = t.mock.method(globalThis, 'fetch', async () => Response.json([draft]))
    // When: an anonymous or forged session requests all columns.
    const response = await GET(new NextRequest('https://egundc.com/api/columns?all=1'))
    // Then: no draft data is returned or cached.
    assert.equal(response.status, 401)
    assert.equal(fetchSpy.mock.callCount(), 0)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
    assert.ok(!JSON.stringify(await response.json()).includes(draft.title))
  })
}

test('all-column API rejects an expired signed session', async t => {
  // Given: a valid signature whose eight-hour session has expired.
  installColumnDatabase(t)
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.COLUMN_TEST_COOKIE = await createAdminSessionToken('column-test-signing-secret', {
    nowMs: now - 9 * 60 * 60 * 1000, nonce: 'expired-fixture',
  })
  // When: it requests private columns.
  const response = await GET(new NextRequest('https://egundc.com/api/columns?all=1'))
  // Then: expiry is enforced, not merely cookie presence.
  assert.equal(response.status, 401)
})

test('local-data mode cannot bypass all-column authentication', async t => {
  // Given: Supabase is unavailable and the route would normally read a local file.
  installColumnDatabase(t)
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // When: an unauthenticated caller requests all columns.
  const response = await GET(new NextRequest('https://egundc.com/api/columns?all=1'))
  // Then: the same authorization gate applies before the storage branch.
  assert.equal(response.status, 401)
})

test('signed administrators retain uncached editor access to public columns and drafts', async t => {
  // Given: a real signed administrator session and active/draft fixture rows.
  installColumnDatabase(t)
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.COLUMN_TEST_COOKIE = await createAdminSessionToken('column-test-signing-secret', {
    nowMs: now, nonce: 'authorized-fixture',
  })
  // When: the editor requests all rows.
  const response = await GET(new NextRequest('https://egundc.com/api/columns?all=1'))
  // Then: editor content is available, but cannot be shared-cached or indexed.
  assert.equal(response.status, 200)
  const rows = await response.json()
  assert.ok(rows.some((row: { id: string }) => row.id === draft.id))
  assert.ok(rows.some((row: { content: string }) => row.content === post.content))
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
})

test('public column API remains accessible without authentication and excludes draft bodies', async t => {
  // Given: a public caller and both published and unpublished columns.
  installColumnDatabase(t)
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  // When: the normal public list is requested.
  const response = await GET(new NextRequest('https://egundc.com/api/columns'))
  // Then: discovery works without leaking drafts or full editor content.
  assert.equal(response.status, 200)
  const rows = await response.json()
  assert.deepEqual(rows.map((row: { id: string }) => row.id), [post.id, secondPost.id])
  assert.ok(rows.every((row: Record<string, unknown>) => !('content' in row)))
  assert.match(response.headers.get('cache-control') ?? '', /^public,/)
})
