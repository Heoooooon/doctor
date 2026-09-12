import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { createAdminSessionToken } from '../lib/admin-session.ts'
import { databaseRows, draft, installColumnDatabase, now, post, secondPost } from './column-runtime.mts'

const listPage = await import('../app/column/page.tsx')
const detailPage = await import('../app/column/[id]/page.tsx')
const sitemapModule = await import('../app/sitemap.ts')
const props = (id: string) => ({ params: Promise.resolve({ id }) })
const postUrl = `https://egundc.com/column/${post.id}`

test('public column links are present in the initial server HTML, in publication order', async t => {
  installColumnDatabase(t)
  const html = renderToStaticMarkup(await listPage.default())
  const links = [...html.matchAll(/href="(\/column\/[^\"]+)"/g)].map(match => match[1])
  assert.deepEqual([...new Set(links)], [`/column/${post.id}`, `/column/${secondPost.id}`])
  assert.ok(!html.includes(`/column/${draft.id}`))
})

test('public list remains public when an administrator is viewing it', async t => {
  installColumnDatabase(t)
  process.env.COLUMN_TEST_COOKIE = await createAdminSessionToken('column-test-signing-secret', { nowMs: now, nonce: 'fixture' })
  const html = renderToStaticMarkup(await listPage.default())
  assert.ok(html.includes(`/column/${post.id}`))
  assert.ok(!html.includes(`/column/${draft.id}`))
})

test('each detail returns its own title, summary, canonical and article social metadata', async t => {
  installColumnDatabase(t)
  assert.equal(typeof detailPage.generateMetadata, 'function')
  const metadata = await detailPage.generateMetadata(props(post.id))
  assert.ok(String(metadata.title).includes(post.title))
  assert.equal(metadata.description, 'Column fixture one Body & health information.')
  assert.equal(metadata.alternates?.canonical, postUrl)
  assert.equal(metadata.openGraph?.url, postUrl)
  assert.ok(metadata.openGraph && 'type' in metadata.openGraph)
  assert.equal(metadata.openGraph.type, 'article')
  assert.equal(metadata.openGraph.title, post.title)
  assert.equal(metadata.openGraph.description, metadata.description)
  assert.ok('publishedTime' in metadata.openGraph)
  assert.equal(metadata.openGraph.publishedTime, post.column_date)
  assert.equal(metadata.twitter?.title, post.title)
  assert.equal(metadata.twitter?.description, metadata.description)
  assert.deepEqual(metadata.twitter?.images, [post.image_url])
})

test('detail HTML includes factual BlogPosting JSON-LD without invented authors or update dates', async t => {
  installColumnDatabase(t)
  const html = renderToStaticMarkup(await detailPage.default(props(post.id)))
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  assert.equal(scripts.length, 1)
  const schema = JSON.parse(scripts[0][1])
  assert.equal(schema['@type'], 'BlogPosting')
  assert.equal(schema.headline, post.title)
  assert.equal(schema.url, postUrl)
  assert.equal(schema.mainEntityOfPage['@id'], postUrl)
  assert.equal(schema.datePublished, post.column_date)
  assert.equal(schema.publisher.name, '서울이건치과')
  assert.equal(schema.author, undefined)
  assert.equal(schema.dateModified, undefined)
})

test('sitemap discovers only active columns with stored dates rather than generation time', async t => {
  installColumnDatabase(t)
  const entries = (await sitemapModule.default()).filter(entry => entry.url.includes('/column/'))
  assert.deepEqual(entries.map(entry => entry.url), [postUrl, `https://egundc.com/column/${secondPost.id}`])
  assert.deepEqual(entries.map(entry => entry.lastModified), [post.column_date, secondPost.column_date])
})

test('sitemap omits modification dates when a static page has no stored content timestamp', async t => {
  // Given: only columns have stored publication dates.
  installColumnDatabase(t)
  // When: the dynamic sitemap is requested.
  const entries = await sitemapModule.default()
  // Then: static pages do not claim they were edited at request time.
  const staticEntries = entries.filter(entry => !entry.url.includes('/column/'))
  assert.ok(staticEntries.length > 0)
  assert.ok(staticEntries.every(entry => entry.lastModified === undefined))
})

test('an authenticated draft preview is noindex and does not publish article schema', async t => {
  installColumnDatabase(t)
  process.env.COLUMN_TEST_COOKIE = await createAdminSessionToken('column-test-signing-secret', { nowMs: now, nonce: 'fixture' })
  assert.equal(typeof detailPage.generateMetadata, 'function')
  const metadata = await detailPage.generateMetadata(props(draft.id))
  assert.deepEqual(metadata.robots, { index: false, follow: false })
  const html = renderToStaticMarkup(await detailPage.default(props(draft.id)))
  assert.ok(html.includes(draft.title))
  assert.ok(!html.includes('application/ld+json'))
  const entries = await sitemapModule.default()
  assert.ok(!entries.some(entry => entry.url.endsWith(draft.id)))
})

for (const id of [draft.id, '44ab660b-8ec4-48aa-8c72-e8f3a97b4c45', 'not-a-uuid']) {
  test(`unauthorized or missing column ${id} remains a Next 404`, async t => {
    installColumnDatabase(t)
    process.env.COLUMN_TEST_COOKIE = 'forged-session'
    await assert.rejects(detailPage.default(props(id)), { message: 'NEXT_HTTP_ERROR_FALLBACK;404' })
  })
}

test('the transport fixture preserves active filtering and projection through the real Supabase SDK', async t => {
  installColumnDatabase(t)
  const { createAdminClient } = await import('../lib/supabase/server.ts')
  const { data, error } = await createAdminClient().from('columns').select('id').eq('is_active', true).order('column_date', { ascending: false })
  assert.equal(error, null)
  assert.deepEqual(data, [{ id: post.id }, { id: secondPost.id }])
  assert.equal(databaseRows.length, 3)
})
