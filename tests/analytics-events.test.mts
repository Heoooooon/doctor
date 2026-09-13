import assert from 'node:assert/strict'
import test from 'node:test'
import './column-runtime.mts'

const { conversionEvents, trackConversion } = await import('../lib/analytics-events.ts')

type Win = {
  gtag?: (command: string, event: string, params?: Record<string, string>) => void
  dataLayer?: unknown[]
}
function withWindow<T>(value: Win, run: () => T): T {
  const original = Reflect.get(globalThis, 'window')
  Reflect.set(globalThis, 'window', value)
  try { return run() } finally {
    if (original === undefined) Reflect.deleteProperty(globalThis, 'window')
    else Reflect.set(globalThis, 'window', original)
  }
}

test('a consultation submit reports the conversion through gtag with its parameters', () => {
  const calls: unknown[][] = []
  const sent = withWindow({ gtag: (...args) => { calls.push(args) } }, () =>
    trackConversion(conversionEvents.consultSubmit, { method: 'quick_bar' }))
  assert.equal(sent, true)
  assert.deepEqual(calls, [['event', 'consult_submit', { method: 'quick_bar' }]])
})

test('without gtag the conversion is queued on dataLayer for Tag Manager', () => {
  const dataLayer: unknown[] = []
  const sent = withWindow({ dataLayer }, () =>
    trackConversion(conversionEvents.phoneClick, { location: 'board_cta' }))
  assert.equal(sent, true)
  assert.deepEqual(dataLayer, [{ event: 'phone_click', location: 'board_cta' }])
})

test('a blocked or failing analytics script never breaks the calling action', () => {
  const sent = withWindow({ gtag: () => { throw new Error('blocked by extension') } }, () =>
    trackConversion(conversionEvents.kakaoClick))
  assert.equal(sent, false)
})

test('with no analytics present the call is a no-op rather than an error', () => {
  assert.equal(withWindow({}, () => trackConversion(conversionEvents.phoneClick)), false)
})

test('conversion event names stay stable for GA4 key-event configuration', () => {
  assert.deepEqual(conversionEvents, {
    consultSubmit: 'consult_submit',
    phoneClick: 'phone_click',
    kakaoClick: 'kakao_click',
  })
})
