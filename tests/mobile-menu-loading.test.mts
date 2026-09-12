import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import './column-runtime.mts'

const { default: MobileNav } = await import('../components/layout/MobileNav.tsx')

test('closed mobile navigation is inert while its links remain in the HTML', () => {
  const html = renderToStaticMarkup(createElement(MobileNav, { isOpen: false, onClose() {} }))
  const nav = html.match(/<nav\b[^>]*>/)?.[0]
  assert.ok(nav)
  assert.match(nav, /\binert=""/)
  assert.match(nav, /aria-hidden="true"/)
  assert.ok(html.includes('href="/column"'))
})

test('opening mobile navigation restores interactive access to all links', () => {
  const html = renderToStaticMarkup(createElement(MobileNav, { isOpen: true, onClose() {} }))
  const nav = html.match(/<nav\b[^>]*>/)?.[0]
  assert.ok(nav)
  assert.doesNotMatch(nav, /\binert=/)
  assert.match(nav, /aria-hidden="false"/)
  assert.ok(html.includes('href="/column"'))
  assert.ok(html.includes('href="/implant"'))
})
