import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire, registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { TestContext } from 'node:test'
import ts from 'typescript'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const nextRoot = new URL('./', pathToFileURL(require.resolve('next/package.json')))
const headersUrl = new URL('headers.js', nextRoot).href

// Use the installed compiler to execute the real Next TSX modules in node:test.
// Only the request cookie boundary is replaced; auth and Supabase stay real.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/^next\/[^/]+$/.test(specifier)) {
      return nextResolve(new URL(`${specifier.slice(5)}.js`, nextRoot).href, context)
    }
    const candidate = specifier.startsWith('@/')
      ? pathToFileURL(`${root}${specifier.slice(2)}`).href
      : specifier.startsWith('.') && context.parentURL
        ? new URL(specifier, context.parentURL).href
        : undefined
    if (candidate?.startsWith(pathToFileURL(root).href) && !candidate.includes('/node_modules/')) {
      for (const extension of ['', '.ts', '.tsx']) {
        if (existsSync(fileURLToPath(`${candidate}${extension}`))) {
          return nextResolve(`${candidate}${extension}`, context)
        }
      }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url === headersUrl) {
      return { format: 'module', shortCircuit: true, source: `
        export async function cookies() {
          return { get: (name) => name === 'admin-session' && process.env.COLUMN_TEST_COOKIE
            ? { value: process.env.COLUMN_TEST_COOKIE } : undefined }
        }
      ` }
    }
    if (url.startsWith(pathToFileURL(root).href) && /\.(ts|tsx)$/.test(url) && !url.includes('/node_modules/')) {
      return {
        format: 'module', shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
          fileName: fileURLToPath(url),
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
        }).outputText,
      }
    }
    return nextLoad(url, context)
  },
})

export const post = {
  id: '24ab660b-8ec4-48aa-8c72-e8f3a97b4c45', title: 'Column fixture one',
  content: '<style>.post-wrap { color: red; }</style><h1>Column fixture one</h1><p>Body &amp; health information.</p>',
  image_url: 'https://cdn.example.com/column.jpg', column_date: '2026-08-15',
  category: '임플란트', tags: ['fixture-tag'], is_active: true,
  created_at: '2026-08-17T02:00:00.000Z',
}
export const secondPost = { ...post, id: '14ab660b-8ec4-48aa-8c72-e8f3a97b4c45', title: 'Column fixture two', category: '일반진료', column_date: '2026-07-31' }
export const draft = { ...post, id: '34ab660b-8ec4-48aa-8c72-e8f3a97b4c45', title: 'Private fixture', is_active: false }
export const databaseRows = [draft, secondPost, post]
export const now = Date.parse('2026-09-09T00:00:00.000Z')

export function installColumnDatabase(t: TestContext, rows = databaseRows) {
  const environment = { ...process.env }
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://column-test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role'
  process.env.ADMIN_PASSWORD = 'column-test-signing-secret'
  delete process.env.COLUMN_TEST_COOKIE
  t.after(() => { process.env = environment })
  t.mock.method(Date, 'now', () => now)
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input)
    assert.equal(url.origin, 'https://column-test.supabase.co', 'tests must never access production')
    assert.equal(url.pathname, '/rest/v1/columns')
    assert.equal(init?.method ?? 'GET', 'GET', 'column reads must never write')
    const params = url.searchParams
    let result = rows.filter(row => {
      for (const [key, value] of Object.entries(row)) {
        const filter = params.get(key)
        if (filter?.startsWith('eq.') && String(value) !== filter.slice(3)) return false
        if (filter?.startsWith('neq.') && String(value) === filter.slice(4)) return false
      }
      return true
    })
    if (params.get('order') === 'column_date.desc') result = result.toSorted((a, b) => b.column_date.localeCompare(a.column_date))
    if (params.has('limit')) result = result.slice(0, Number(params.get('limit')))
    const fields = params.get('select')
    const projected = result.map(row => fields && fields !== '*'
      ? Object.fromEntries(Object.entries(row).filter(([key]) => fields.split(',').includes(key))) : row)
    if (new Headers(init?.headers).get('accept')?.includes('application/vnd.pgrst.object+json')) {
      return projected.length === 1 ? Response.json(projected[0])
        : Response.json({ code: 'PGRST116', details: 'The result contains 0 rows', message: 'No rows' }, { status: 406 })
    }
    return Response.json(projected)
  })
}
