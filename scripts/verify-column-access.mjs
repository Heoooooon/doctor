import assert from 'node:assert/strict'

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3000')
assert.ok(['127.0.0.1', 'localhost', 'egundc.com'].includes(base.hostname))
if (base.hostname === 'egundc.com') assert.equal(base.protocol, 'https:')

async function request(path, options = {}) {
  return fetch(new URL(path, base), {
    ...options,
    signal: AbortSignal.timeout(30_000),
    redirect: 'error',
  })
}

const publicResponse = await request('/api/columns')
assert.equal(publicResponse.status, 200)
const publicRows = await publicResponse.json()
assert.ok(Array.isArray(publicRows))
assert.ok(publicRows.every(row => row.is_active && !('content' in row)))

for (const headers of [
  {},
  { Cookie: 'admin-session=forged-session' },
  { 'User-Agent': 'Googlebot' },
]) {
  const denied = await request('/api/columns?all=1', { headers })
  assert.equal(denied.status, 401)
  assert.equal(denied.headers.get('cache-control'), 'private, no-store')
  assert.equal(denied.headers.get('x-robots-tag'), 'noindex, nofollow')
  assert.ok(!Array.isArray(await denied.json()))
}

// Exercise the real login route. Credentials and returned content are never logged.
assert.ok(process.env.ADMIN_PASSWORD, 'Load ADMIN_PASSWORD before checking editor access')
const login = await request('/api/admin/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
})
assert.equal(login.status, 200, 'authorized editor login must succeed')
const session = login.headers.getSetCookie().find(value => value.startsWith('admin-session='))
assert.ok(session, 'login must issue an administrator session')
await login.body?.cancel()

const privateResponse = await request('/api/columns?all=1', {
  headers: { Cookie: session.split(';')[0] },
})
assert.equal(privateResponse.status, 200)
assert.equal(privateResponse.headers.get('cache-control'), 'private, no-store')
assert.equal(privateResponse.headers.get('x-robots-tag'), 'noindex, nofollow')
const editorRows = await privateResponse.json()
assert.ok(Array.isArray(editorRows))
assert.ok(publicRows.every(publicRow => editorRows.some(row => row.id === publicRow.id)))
assert.ok(editorRows.every(row => 'content' in row))

console.log(JSON.stringify({
  base: base.origin,
  publicStatus: publicResponse.status,
  publicColumns: publicRows.length,
  anonymousPrivateStatus: 401,
  forgedPrivateStatus: 401,
  botUserAgentPrivateStatus: 401,
  authorizedEditorStatus: privateResponse.status,
  privateCache: privateResponse.headers.get('cache-control'),
  privateIndexing: privateResponse.headers.get('x-robots-tag'),
  passed: true,
}, null, 2))
