import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
// Side effect: registers the TSX/alias module hooks used by all runtime tests.
import './column-runtime.mts'

const { SlidePopupView } = await import('../components/SlidePopup.tsx')

const slides = [
  { id: 'a', title: '이벤트 1', image_url: '/a.webp', link_url: 'https://booking.naver.com/x', sort_order: 1, is_active: true, width: 1080, height: 1350 },
  { id: 'b', title: '이벤트 2', image_url: '/b.webp', link_url: null, sort_order: 2, is_active: true },
  { id: 'c', title: '이벤트 3', image_url: '/c.webp', link_url: null, sort_order: 3, is_active: true },
]

const noop = () => {}

function renderPopup(index = 0) {
  return renderToStaticMarkup(createElement(SlidePopupView, {
    slides, index,
    onClose: noop, onHideToday: noop, onPrev: noop, onNext: noop, onSelect: noop,
  }))
}

/** Resolve the CSS pixel box implied by Tailwind h-N / w-N utilities in a class list. */
function tailwindBoxPx(className: string) {
  const size = (axis: 'h' | 'w') => {
    const scale = className.match(new RegExp(`(?:^|\\s)${axis}-(\\d+(?:\\.\\d+)?)(?:\\s|$)`))
    if (scale) return Number(scale[1]) * 4
    const arbitrary = className.match(new RegExp(`(?:^|\\s)${axis}-\\[(\\d+(?:\\.\\d+)?)px\\]`))
    if (arbitrary) return Number(arbitrary[1])
    return null
  }
  return { h: size('h'), w: size('w') }
}

test('popup carousel tabs are >=24px touch targets while keeping tab semantics', () => {
  const html = renderPopup(0)
  const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map(m => m[0])
  assert.equal(tabs.length, slides.length, 'one tab per slide')

  for (const tab of tabs) {
    const className = tab.match(/class="([^"]*)"/)?.[1] ?? ''
    const { h, w } = tailwindBoxPx(className)
    assert.ok(h !== null && w !== null, `tab must declare an explicit hit box: ${tab}`)
    assert.ok(h >= 24 && w >= 24, `tab hit box must be >=24px, got ${w}x${h}: ${tab}`)
    assert.match(tab, /aria-label="\d+ \/ \d+"/, 'tab keeps positional label')
  }

  const selected = tabs.filter(tab => tab.includes('aria-selected="true"'))
  assert.equal(selected.length, 1, 'exactly one tab is selected')
  assert.ok(html.includes('role="tablist"'), 'tabs stay grouped in a tablist')
})

test('popup reserves the known image aspect ratio before the mounted image decodes', () => {
  const html = renderPopup()
  const image = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0])
    .find(tag => tag.includes('src="/a.webp"'))
  assert.ok(image)
  assert.match(image, /width="1080"/)
  assert.match(image, /height="1350"/)
})

test('popup keeps prev/next controls and hide-today/close actions', () => {
  const html = renderPopup(1)
  assert.ok(html.includes('aria-label="이전 슬라이드"'))
  assert.ok(html.includes('aria-label="다음 슬라이드"'))
  assert.ok(html.includes('오늘 하루 보지 않기'))
  assert.ok(html.includes('role="dialog"'))
  // Naver funnel/link slides keep their anchors untouched.
  assert.ok(html.includes('href="https://booking.naver.com/x"'))
})
