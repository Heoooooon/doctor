import assert from 'node:assert/strict'

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3000')
const canonicalOrigin = 'https://egundc.com'
const failures = []
let checks = 0

function check(name, assertion) {
  checks += 1
  try {
    assertion()
  } catch (error) {
    if (!(error instanceof assert.AssertionError)) throw error
    failures.push({ name, message: error.message })
  }
}

async function get(path) {
  const response = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(30_000),
  })
  return { response, html: await response.text() }
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
      .map((match) => [match[1], match[2]]),
  )
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))]
    .map((match) => attributes(match[0]))
}

function metadata(html) {
  const meta = tags(html, 'meta')
  return {
    title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],
    description: meta.find((tag) => tag.name === 'description')?.content,
    canonical: tags(html, 'link').find((tag) => tag.rel === 'canonical')?.href,
    ogTitle: meta.find((tag) => tag.property === 'og:title')?.content,
    ogType: meta.find((tag) => tag.property === 'og:type')?.content,
    ogUrl: meta.find((tag) => tag.property === 'og:url')?.content,
  }
}

// Given: the site's public homepage and its existing informational case images.
const home = await get('/')
const homeMeta = metadata(home.html)
const treatmentImages = [
  'resin-buildup.jpg',
  'vpt.jpg',
  'preserve_treat.jpg',
  'endo-1.jpg',
  'sc-rp.jpg',
]
const images = tags(home.html, 'img')

// When: a crawler reads the initial HTML without executing JavaScript.
check('homepage responds successfully', () => assert.equal(home.response.status, 200))
check('homepage retains its canonical origin', () =>
  assert.equal(new URL(homeMeta.canonical).origin, canonicalOrigin))
check('homepage has one main heading', () =>
  assert.equal([...home.html.matchAll(/<h1\b/gi)].length, 1))
check('homepage search and sharing titles agree', () =>
  assert.equal(homeMeta.title, homeMeta.ogTitle))

// Then: informative images are real image elements with descriptive alternatives.
for (const filename of treatmentImages) {
  check(`informative image ${filename} is discoverable with alt`, () => {
    const matches = images.filter((image) =>
      decodeURIComponent(image.src ?? '').includes(`/natural-tooth/${filename}`))
    assert.ok(matches.length > 0, `${filename} is missing from img elements`)
    assert.ok(matches.every((image) => image.alt?.trim()), `${filename} has empty alt`)
  })
}

// Given: the public API is the authoritative set of currently published articles.
const api = await get('/api/columns')
assert.equal(api.response.status, 200)
const columns = JSON.parse(api.html)
assert.ok(Array.isArray(columns), 'public columns response must be an array')
assert.ok(columns.length > 0, 'this deployment must have published columns to verify')
const list = await get('/column')
const sitemap = await get('/sitemap.xml')
const hrefs = new Set(tags(list.html, 'a').map((link) => link.href))
const sitemapUrls = new Set(
  [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]),
)
check('column list responds successfully', () => assert.equal(list.response.status, 200))
check('sitemap responds successfully', () => assert.equal(sitemap.response.status, 200))

for (const column of columns) {
  const path = `/column/${column.id}`
  const canonical = `${canonicalOrigin}${path}`
  check(`initial column list links to ${column.id}`, () => assert.ok(hrefs.has(path)))
  check(`sitemap includes ${column.id}`, () => assert.ok(sitemapUrls.has(canonical)))

  // When: each public article is fetched directly.
  const detail = await get(path)
  const meta = metadata(detail.html)
  check(`article ${column.id} responds successfully`, () =>
    assert.equal(detail.response.status, 200))
  check(`article ${column.id} declares itself canonical`, () =>
    assert.equal(meta.canonical, canonical))
  check(`article ${column.id} has its own search metadata`, () => {
    assert.ok(meta.title && meta.description)
    assert.notEqual(meta.title, homeMeta.title)
    assert.notEqual(meta.description, homeMeta.description)
  })
  check(`article ${column.id} shares its own URL as an article`, () => {
    assert.equal(meta.ogType, 'article')
    assert.equal(meta.ogUrl, canonical)
  })
  check(`article ${column.id} has parseable article JSON-LD`, () => {
    const schemas = [...detail.html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    )].map((match) => JSON.parse(match[1]))
    const article = schemas.find((schema) =>
      ['Article', 'BlogPosting'].includes(schema['@type']))
    assert.ok(article, 'article schema is missing')
    assert.equal(article.headline, column.title)
    assert.equal(article.url, canonical)
  })
}

const missing = await get('/column/00000000-0000-4000-8000-000000000000')
check('unknown article remains unavailable', () => assert.equal(missing.response.status, 404))

console.log(JSON.stringify({
  base: base.origin, columns: columns.length, checks,
  passed: checks - failures.length, failures,
}, null, 2))
if (failures.length > 0) process.exitCode = 1
