// Deployment integrity checks of initial HTML, not browser rendering or search rankings.
const verification = 'googlec8eaf265de8ba751.html'
const hexCommit = /^[a-f0-9]{40}$/i
const tokens = value => (value ?? '').toLowerCase().split(/[\s,]+/).filter(Boolean)
const requireCheck = (condition, message) => { if (!condition) throw new Error(message) }

function decode(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, key) => {
    const names = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }
    if (!key.startsWith('#')) return names[key.toLowerCase()] ?? entity
    const code = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1))
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '\ufffd'
  })
}

function tags(html) {
  const result = []
  const matcher = /<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi
  let match
  while ((match = matcher.exec(html))) {
    if (!match[1] || match[0].startsWith('</')) continue
    const name = match[1].toLowerCase()
    const attrs = Object.create(null)
    for (const attr of match[2].matchAll(/([^\s=/'"<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      const key = attr[1].toLowerCase()
      if (!(key in attrs)) attrs[key] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '')
    }
    result.push({ name, attrs })
    if (['script', 'style', 'textarea', 'title'].includes(name)) {
      const end = new RegExp(`</${name}\\s*>`, 'gi')
      end.lastIndex = matcher.lastIndex
      matcher.lastIndex = end.exec(html) ? end.lastIndex : html.length
    }
  }
  return result
}

function* srcset(value = '') {
  // HTML srcset URLs end at ASCII whitespace, not interior commas (including data:).
  const urls = /[\t\n\f\r ,]*([^\t\n\f\r ]+)/gy
  const descriptors = /(?:[^,(]|\([^)]*(?:\)|$))*/y
  let match
  while ((match = urls.exec(value))) {
    const url = match[1]
    if (url.endsWith(',')) { yield url.replace(/,+$/, ''); continue }
    // A comma separates candidates only outside URL tokens and descriptor parentheses.
    descriptors.lastIndex = urls.lastIndex
    const text = descriptors.exec(value)[0]
    urls.lastIndex = descriptors.lastIndex + (value[descriptors.lastIndex] === ',' ? 1 : 0)
    const seen = new Set()
    const valid = (text.match(/[^\t\n\f\r ]+/g) ?? []).every(descriptor => {
      const kind = descriptor.at(-1)
      const number = descriptor.slice(0, -1)
      if (seen.has(kind)) return false
      seen.add(kind)
      if (kind === 'w' || kind === 'h') return /^\d+$/.test(number) && Number(number) > 0
      return kind === 'x' && /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(number) && Number.isFinite(Number(number)) && Number(number) >= 0
    })
    if (valid && !(seen.has('x') && (seen.has('w') || seen.has('h'))) && !(seen.has('h') && !seen.has('w'))) yield url
  }
}

/** @param {string | URL} base @param {{ expectedCommit?: string }} options */
export async function smoke(base, { expectedCommit } = {}) {
  let root
  try { root = new URL(base) } catch { throw new Error('Invalid smoke base URL') }
  requireCheck(['http:', 'https:'].includes(root.protocol) && !root.username && !root.password, 'Smoke base must be HTTP(S) without credentials')
  root = new URL('/', root)
  requireCheck(expectedCommit === undefined || hexCommit.test(expectedCommit), 'Expected commit must be 40 hex characters')
  let checks = 0
  async function request(url, method = 'GET', body = false) {
    requireCheck(url.origin === root.origin && !url.username && !url.password, 'Refused cross-origin or credentialed request')
    let response, text
    try {
      response = await fetch(url, { method, redirect: 'manual', signal: AbortSignal.timeout(15_000) })
      if (body && response.status === 200) text = await response.text()
      else await response.body?.cancel()
    } catch { throw new Error(`${method} request failed or timed out: ${url.pathname}`) }
    requireCheck(response.status < 300 || response.status >= 400, `HTTP ${response.status} redirect refused: ${url.pathname}`)
    return { response, text }
  }
  function status(result, expected, url) {
    requireCheck(result.response.status === expected, `HTTP ${result.response.status}, expected ${expected}: ${url.pathname}`)
    checks++
  }
  async function get(path) {
    const url = new URL(path, root)
    const result = await request(url, 'GET', true)
    status(result, 200, url)
    return result
  }
  function json(text, path) {
    try { return JSON.parse(text) } catch { throw new Error(`Invalid JSON: ${path}`) }
  }
  const home = await get('/')
  const elements = tags(home.text)
  const links = elements.filter(tag => tag.name === 'link')
  const canonical = links.filter(tag => tokens(tag.attrs.rel).includes('canonical'))
  let canonicalURL
  try { canonicalURL = new URL(canonical[0]?.attrs.href).href } catch { canonicalURL = '' }
  requireCheck(canonical.length === 1 && canonicalURL === 'https://egundc.com/', 'Homepage canonical must be https://egundc.com/')
  const robots = elements.filter(tag => tag.name === 'meta' && ['robots', 'googlebot'].includes(tag.attrs.name?.toLowerCase()))
  const directives = [...robots.flatMap(tag => tokens(tag.attrs.content)), ...tokens(home.response.headers.get('x-robots-tag'))]
  requireCheck(robots.some(tag => tag.attrs.name.toLowerCase() === 'robots' && tokens(tag.attrs.content).includes('index') && tokens(tag.attrs.content).includes('follow')) && !directives.some(token => ['noindex', 'nofollow', 'none'].includes(token)), 'Homepage must allow index, follow')
  let assetBase = root
  const baseTag = elements.find(tag => tag.name === 'base' && tag.attrs.href)
  if (baseTag) {
    try { assetBase = new URL(baseTag.attrs.href, root) } catch { throw new Error('Invalid homepage base URL') }
    requireCheck(assetBase.origin === root.origin, 'Cross-origin homepage base URL refused')
  }
  const assets = new Set()
  function add(value) {
    if (!value?.trim()) return // Source-free lazy media is intentionally not fetched.
    let url
    try { url = new URL(value, assetBase) } catch { throw new Error('Invalid homepage resource URL') }
    if (url.origin !== root.origin || !['http:', 'https:'].includes(url.protocol)) return
    requireCheck(!url.username && !url.password, 'Credentialed homepage resource URL refused')
    url.hash = ''
    assets.add(url.href)
  }
  for (const { name, attrs } of elements) {
    add(attrs.src)
    if (name === 'img' || name === 'source') for (const candidate of srcset(attrs.srcset)) add(candidate)
    if (name === 'video') add(attrs.poster)
    if (name === 'link') {
      const rel = tokens(attrs.rel)
      if (rel.includes('preload') && attrs.as?.toLowerCase() === 'image') for (const candidate of srcset(attrs.imagesrcset)) add(candidate)
      if (rel.includes('stylesheet') || rel.includes('modulepreload') || (rel.includes('preload') && ['script', 'style', 'font', 'image', 'video', 'audio'].includes(attrs.as?.toLowerCase()))) add(attrs.href)
    }
  }
  const queue = [...assets]
  const workers = await Promise.allSettled(Array.from({ length: Math.min(8, queue.length) }, async () => {
    while (queue.length) {
      const url = new URL(queue.shift())
      let result = await request(url, 'HEAD')
      if ([405, 501].includes(result.response.status)) result = await request(url)
      status(result, 200, url)
    }
  }))
  const failed = workers.find(worker => worker.status === 'rejected')
  if (failed) throw failed.reason
  const proof = await get(`/${verification}`)
  requireCheck(proof.text.trim() === `google-site-verification: ${verification}`, `Incorrect verification token: /${verification}`)
  const privateURL = new URL('/api/columns?all=1', root)
  const privateAPI = await request(privateURL)
  status(privateAPI, 401, privateURL)
  const cache = tokens(privateAPI.response.headers.get('cache-control'))
  requireCheck(cache.includes('private') && cache.includes('no-store') && !cache.includes('public'), 'Expected private, no-store: /api/columns?all=1')
  const publicAPI = await get('/api/columns')
  const columns = json(publicAPI.text, '/api/columns')
  requireCheck(Array.isArray(columns), 'Expected array: /api/columns')
  requireCheck(columns.every(row => row && row.is_active === true && !Object.hasOwn(row, 'content')), 'Expected public-only rows without content: /api/columns')
  if (expectedCommit !== undefined) {
    const marker = json((await get('/__release.txt')).text, '/__release.txt')
    requireCheck(typeof marker?.commit === 'string' && hexCommit.test(marker.commit), 'Invalid 40-hex commit: /__release.txt')
    requireCheck(marker.commit === expectedCommit, 'Release commit mismatch: /__release.txt')
  }
  return { passed: true, base: root.origin, checks, assets: assets.size, publicColumns: columns.length, commit: expectedCommit ?? null }
}

if (import.meta.main) {
  try {
    requireCheck(process.argv.length >= 3 && process.argv.length <= 4, 'Usage: node scripts/deploy-smoke.mjs URL [COMMIT]')
    console.log(JSON.stringify(await smoke(process.argv[2], { expectedCommit: process.argv[3] })))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
