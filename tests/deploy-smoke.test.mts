import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { once } from 'node:events'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import test from 'node:test'
import { promisify } from 'node:util'
import { smoke } from '../scripts/deploy-smoke.mjs'

const commit = 'a'.repeat(40)
const token = 'google-site-verification: googlec8eaf265de8ba751.html'
const home = `<!doctype html><html><head>
<link href='https://egundc.com/' data-note="a > b" rel='canonical'>
<meta content='index, follow' name='robots'>
<link href='/app.css' rel='stylesheet'><link rel=modulepreload href=/module.js>
<link as='script' href='/preload.js' rel='preload'>
<link href='/font.woff2' as='font' rel='preload'>
<link rel='preload' as='style' href='/preload.css'>
<script src='/app.js?x=1&amp;y=2'></script>
<script>const text = '<img src="/not-real.jpg">';</script>
<!-- <link rel='stylesheet' href='/comment.css'> -->
<link rel='preconnect' href='/not-an-asset'>
<script src='https://analytics.invalid/a.js'></script></head><body>
<img src='/image.webp'><video src='/video.mp4' poster='/poster.webp'></video>
<video preload='none'></video><img><source src='/audio.ogg'>
</body></html>`
type Override = (req: IncomingMessage, res: ServerResponse) => boolean
async function fixture(run: (base: string, requests: string[]) => Promise<void>, override: Override = () => false) {
  const requests: string[] = []
  const server = createServer((req, res) => {
    requests.push(`${req.method} ${req.url}`)
    if (override(req, res)) return
    if (req.url === '/') res.end(home)
    else if (req.url === '/__release.json') res.end(JSON.stringify({ commit }))
    else if (req.url === '/googlec8eaf265de8ba751.html') res.end(` ${token}\n`)
    else if (req.url === '/api/columns?all=1') {
      res.writeHead(401, { 'Cache-Control': 'private, no-store' }).end('{}')
    } else if (req.url === '/api/columns') res.end(JSON.stringify([{ is_active: true, title: 'DO_NOT_LOG' }]))
    else if (/^\/(app\.(css|js)|module\.js|preload\.(js|css)|font\.woff2|image\.webp|video\.mp4|poster\.webp|audio\.ogg)(\?|$)/.test(req.url ?? '')) res.end('asset')
    else res.writeHead(404).end('DO_NOT_LOG')
  })
  const listening = once(server, 'listening')
  server.listen(0, '127.0.0.1')
  await listening
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    await run(`http://127.0.0.1:${address.port}`, requests)
  } finally {
    const closed = once(server, 'close')
    server.close()
    server.closeAllConnections()
    await closed
  }
}
function response(path: string, status: number, body: string, headers = {}): Override {
  return (req, res) => {
    if (req.url !== path) return false
    res.writeHead(status, headers).end(body)
    return true
  }
}

test('good release checks local resources, ignores canonical/external/raw-text links, and returns no content', async () => {
  await fixture(async (base, requests) => {
    const result = await smoke(base, { expectedCommit: commit })
    assert.equal(result.passed, true)
    assert.equal(result.commit, commit)
    assert.equal(result.assets, 10)
    assert.equal(result.publicColumns, 1)
    assert.ok(!JSON.stringify(result).includes('DO_NOT_LOG'))
    assert.ok(requests.includes('HEAD /app.js?x=1&y=2'))
    assert.ok(requests.includes('HEAD /font.woff2'))
    assert.ok(requests.includes('HEAD /video.mp4'))
    assert.equal(requests.filter(path => path === 'GET /').length, 1)
    assert.ok(!requests.some(path => /not-real|comment|not-an-asset/.test(path)))
  })
})

for (const [name, markup] of [
  ['img srcset', `<img src='/image.webp' srcset='/image.webp 1x, /missing-responsive.webp 2x'>`],
  ['source srcset', `<picture><source srcset='/image.webp 640w, /missing-responsive.webp 1280w'><img src='/image.webp'></picture>`],
  ['preload imagesrcset', `<link href='/image.webp' imagesrcset='/image.webp 1x, /missing-responsive.webp 2x' as='image' rel='preload'>`],
]) {
  test(`${name} rejects a missing responsive candidate despite a working fallback`, async () => {
    await fixture(async (base, requests) => {
      const fallback = await fetch(`${base}/image.webp`)
      assert.equal(fallback.status, 200)
      await fallback.body?.cancel()
      await assert.rejects(smoke(base), /404.*\/missing-responsive\.webp/)
      assert.ok(requests.includes('HEAD /missing-responsive.webp'))
    }, response('/', 200, home.replace('</body>', `${markup}</body>`)))
  })
}

test('responsive parsing preserves URL commas, handles descriptors and data URLs, and never requests external candidates', async () => {
  await fixture(async (external, externalRequests) => {
    const paths = ['/small,wide.webp', '/large.webp?crop=1,2&quality=80', '/plain.webp', '/retina.webp', '/future.webp', '/after.webp']
    const html = home.replace('</body>', `
      <img src='/image.webp' srcset='data:image/svg+xml,%3Csvg%3E,%3C/svg%3E 1x, /small,wide.webp 2x'>
      <source srcset='/large.webp?crop=1,2&amp;quality=80 640w, ${external}/external.webp 1280w'>
      <link rel='preload' as='image' imagesrcset='data:image/png;base64,AAAA, /plain.webp, /retina.webp 2e0x'>
      <img srcset='/future.webp 640w 480h, /invalid.webp type(a,b), /after.webp .5x'>
      <link rel='preconnect' imagesrcset='/not-an-image.webp 2x'>
      </body>`)
    await fixture(async (base, requests) => {
      const result = await smoke(base)
      assert.equal(result.assets, 10 + paths.length)
      for (const path of paths) assert.equal(requests.filter(request => request === `HEAD ${path}`).length, 1)
      assert.deepEqual(externalRequests, [])
      assert.ok(!requests.some(request => /invalid|not-an-image|AAAA|%3C/.test(request)))
    }, (req, res) => {
      if (req.url === '/') { res.end(html); return true }
      if (paths.includes(req.url ?? '')) { res.end('responsive asset'); return true }
      return false
    })
  })
})

for (const [name, path, status, body, pattern, headers] of [
  ['root failure', '/', 503, 'DO_NOT_LOG', /503.*\//, {}],
  ['root 200 but CSS failure', '/app.css', 500, 'DO_NOT_LOG', /500.*\/app\.css/, {}],
  ['wrong release', '/__release.json', 200, JSON.stringify({ commit: 'b'.repeat(40) }), /commit.*mismatch/, {}],
  ['missing release', '/__release.json', 404, 'DO_NOT_LOG', /404.*\/__release\.json/, {}],
  ['malformed release', '/__release.json', 200, '{', /JSON.*\/__release\.json/, {}],
  ['private API exposed', '/api/columns?all=1', 200, 'DO_NOT_LOG', /200.*\/api\/columns/, {}],
  ['private API cached', '/api/columns?all=1', 401, '{}', /private, no-store/, {}],
  ['verification token incorrect', '/googlec8eaf265de8ba751.html', 200, 'wrong', /verification.*googlec8eaf265de8ba751/, {}],
  ['draft leaked', '/api/columns', 200, '[{"is_active":false,"title":"DO_NOT_LOG"}]', /public-only/, {}],
  ['body leaked', '/api/columns', 200, '[{"is_active":true,"content":"DO_NOT_LOG"}]', /public-only/, {}],
  ['non-array public data', '/api/columns', 200, '{}', /array/, {}],
  ['cross-origin asset redirect', '/app.css', 302, '', /redirect.*\/app\.css/, { Location: 'https://external.invalid/secret' }],
  ['same-origin asset redirect', '/app.css', 307, '', /redirect.*\/app\.css/, { Location: '/other.css' }],
] as const) {
  test(name, async () => {
    await fixture(async base => {
      await assert.rejects(smoke(base, { expectedCommit: commit }), error => {
        assert.ok(error instanceof Error)
        assert.match(error.message, new RegExp(pattern.source))
        assert.ok(!error.message.includes('DO_NOT_LOG'))
        assert.ok(!error.message.includes('external.invalid'))
        return true
      })
    }, response(path, status, body, headers))
  })
}

for (const [name, html] of [
  ['noindex', home.replace('index, follow', 'noindex, follow')],
  ['nofollow', home.replace('index, follow', 'index, nofollow')],
  ['wrong canonical root', home.replace('https://egundc.com/', 'https://egundc.com/other')],
  ['canonical hostname spoof', home.replace('https://egundc.com/', 'https://egundc.com.attacker.invalid/')],
]) {
  test(`rejects ${name}`, async () => {
    await fixture(async base => { await assert.rejects(smoke(base), /canonical|index, follow/) }, response('/', 200, html))
  })
}

test('legacy rollback needs no marker when no expected commit is supplied', async () => {
  await fixture(async (base, requests) => {
    assert.equal((await smoke(base)).passed, true)
    assert.ok(!requests.includes('GET /__release.json'))
  }, response('/__release.json', 404, ''))
})

test('HEAD unsupported falls back to GET', async () => {
  await fixture(async (base, requests) => {
    await smoke(base)
    assert.ok(requests.includes('GET /app.css'))
  }, (req, res) => {
    if (req.url !== '/app.css' || req.method !== 'HEAD') return false
    res.writeHead(405).end()
    return true
  })
})

test('asset concurrency is bounded at eight without serializing all requests', { timeout: 10_000 }, async () => {
  let active = 0
  let peak = 0
  const waiting: ServerResponse[] = []
  const candidates = Array.from({ length: 12 }, (_, index) => `/responsive-${index}.webp`)
  const html = home.replace('</body>', `<img srcset='${candidates.map((path, index) => `${path} ${index + 1}x`).join(', ')}'></body>`)
  await fixture(async (base, requests) => {
    await smoke(base)
    assert.equal(peak, 8)
    for (const path of candidates) assert.ok(requests.includes(`HEAD ${path}`))
  }, (req, res) => {
    if (req.url === '/') { res.end(html); return true }
    if (req.method !== 'HEAD') return false
    active++
    peak = Math.max(peak, active)
    assert.ok(active <= 8)
    if (peak === 8) {
      res.end()
      active--
      for (const held of waiting.splice(0)) { held.end(); active-- }
    } else waiting.push(res)
    return true
  })
})

test('CLI emits JSON and exits successfully against the real fixture', async () => {
  await fixture(async base => {
    const { stdout, stderr } = await promisify(execFile)(process.execPath, ['scripts/deploy-smoke.mjs', base, commit], { timeout: 10_000 })
    assert.equal(JSON.parse(stdout).passed, true)
    assert.equal(stderr, '')
  })
})

test('CLI fails without leaking response content', async () => {
  await fixture(async base => {
    await assert.rejects(promisify(execFile)(process.execPath, ['scripts/deploy-smoke.mjs', base], { timeout: 10_000 }), error => {
      const result = error as Error & { code: number, stderr: string }
      assert.equal(result.code, 1)
      assert.match(result.stderr, /500.*\/app\.css/)
      assert.ok(!result.stderr.includes('DO_NOT_LOG'))
      return true
    })
  }, response('/app.css', 500, 'DO_NOT_LOG'))
})
