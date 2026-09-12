import assert from 'node:assert/strict'
import test from 'node:test'
import { Children, createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { SedationObserverOptions } from '../components/main/SedationSection.tsx'
import './column-runtime.mts'

const { default: SedationSection, SedationSectionView, startSedationMedia } = await import('../components/main/SedationSection.tsx')
const { default: DoctorGroup } = await import('../components/main/DoctorGroup.tsx')

type Props = {
  children?: ReactNode
  src?: string
  priority?: boolean
  className?: string
}
function elements(node: ReactNode): ReactElement<Props>[] {
  return Children.toArray(node).flatMap(child => isValidElement<Props>(child)
    ? [child, ...elements(child.props.children)] : [])
}

// Exercise the lifecycle called by the real effect. The observer's notifications
// and the video API are boundaries; React and browser layout are not emulated.
function mountMedia(desktop = false) {
  assert.equal(typeof startSedationMedia, 'function')
  type Root = { id: string }
  type Subscription = {
    options: SedationObserverOptions<Root>
    disconnected: boolean
    notify: (isIntersecting: boolean) => void | Promise<void>
  }
  const subscriptions: Subscription[] = []
  const calls: string[] = []
  const visibility: boolean[] = []
  const scrollRoot = desktop ? { id: 'home-desktop' } : null
  const section = { closest(selector: string) {
    assert.equal(selector, '#home-desktop')
    return scrollRoot
  } }
  let source = ''
  let sourceAssignments = 0
  let rejection: { reason: unknown } | undefined
  const video: Pick<HTMLVideoElement, 'src' | 'preload' | 'autoplay' | 'currentTime' | 'play' | 'pause'> = {
    get src() { return source },
    set src(value: string) { source = value; sourceAssignments++ },
    preload: 'none',
    autoplay: false,
    currentTime: 12,
    play() {
      calls.push('play')
      return rejection ? Promise.reject(rejection.reason) : Promise.resolve()
    },
    pause() { calls.push('pause') },
  }
  const cleanup = startSedationMedia(section, video, visible => visibility.push(visible), (onIntersection, options) => {
    const subscription: Subscription = {
      options,
      disconnected: false,
      notify(isIntersecting) {
        assert.equal(subscription.disconnected, false)
        return onIntersection(isIntersecting)
      },
    }
    subscriptions.push(subscription)
    return () => { subscription.disconnected = true }
  })
  function observer(approaching: boolean) {
    const subscription = subscriptions.find(item => approaching
      ? item.options.rootMargin === '300px 0px' : !item.options.rootMargin)
    assert.ok(subscription)
    return subscription
  }
  return {
    video, calls, visibility, subscriptions, scrollRoot, cleanup,
    sourceAssignments: () => sourceAssignments,
    rejectPlay(reason: unknown) { rejection = { reason } },
    approach: () => observer(true),
    viewport: () => observer(false),
  }
}

function renderView(visible: boolean) {
  return renderToStaticMarkup(createElement(SedationSectionView, { visible, sectionRef: null, videoRef: null }))
}

function videoTag(html: string) {
  const video = html.match(/<video\b[^>]*>/)?.[0]
  assert.ok(video)
  return video
}

test('SSR keeps the section and treatment content but exposes no video request', () => {
  const html = renderToStaticMarkup(createElement(SedationSection))
  const video = videoTag(html)
  assert.doesNotMatch(video, /\bsrc=/)
  assert.doesNotMatch(video, /autoplay/i)
  assert.match(video, /preload="none"/)
  for (const attribute of ['loop', 'muted', 'playsInline']) assert.ok(video.includes(`${attribute}=""`))
  assert.doesNotMatch(html, /<source\b|sedation-hero\.mp4/)
  assert.match(html, /<h2\b[^>]*>[^<]+<\/h2>/)
  assert.ok([...html.matchAll(/<p\b[^>]*>[^<]+<\/p>/g)].length >= 5)
  assert.equal(html, renderView(false), 'the component uses the tested view for SSR')
})

for (const desktop of [false, true]) {
  test(`approach loads once, viewport plays, exit pauses and re-entry resumes (${desktop ? 'desktop' : 'mobile'})`, { timeout: 1000 }, async t => {
    const mounted = mountMedia(desktop)
    t.after(mounted.cleanup)
    assert.equal(mounted.video.src, '')
    assert.equal(mounted.video.autoplay, false)
    await mounted.approach().notify(false)
    await mounted.viewport().notify(false)
    assert.equal(mounted.video.src, '')
    assert.equal(mounted.sourceAssignments(), 0)
    assert.equal(mounted.calls.includes('play'), false)
    assert.equal(mounted.approach().options.root ?? null, mounted.scrollRoot)
    assert.equal(mounted.viewport().options.root ?? null, null)
    assert.equal(mounted.viewport().options.threshold, 0.1)

    await mounted.approach().notify(true)
    assert.equal(mounted.video.src, '/images/video/sedation-hero.mp4')
    assert.equal(mounted.sourceAssignments(), 1)
    assert.equal(mounted.video.preload, 'metadata')
    assert.equal(mounted.approach().disconnected, true)
    assert.equal(mounted.video.autoplay, false)
    assert.equal(mounted.calls.includes('play'), false, 'preparation must not autoplay offscreen')
    await mounted.viewport().notify(true)
    assert.equal(mounted.calls.at(-1), 'play')
    assert.equal(mounted.video.autoplay, true)
    assert.equal(mounted.visibility.at(-1), true)
    const text = (html: string) => html.replace(/<[^>]+>/g, '')
    assert.equal(text(renderView(true)), text(renderToStaticMarkup(createElement(SedationSection))), 'revealing the section preserves all shipped text')
    for (const attribute of ['loop', 'muted', 'playsInline']) assert.ok(videoTag(renderView(true)).includes(`${attribute}=""`))

    await mounted.viewport().notify(false)
    assert.equal(mounted.calls.at(-1), 'pause')
    assert.equal(mounted.visibility.at(-1), false)
    assert.equal(mounted.video.autoplay, false)
    assert.equal(mounted.video.src, '/images/video/sedation-hero.mp4', 'keep the last frame and loaded source')
    assert.equal(mounted.video.currentTime, 12, 'do not rewind when leaving')
    await mounted.viewport().notify(true)
    assert.equal(mounted.calls.filter(call => call === 'play').length, 2)
    assert.equal(mounted.sourceAssignments(), 1, 're-entry does not reassign the source')
    mounted.cleanup()
    assert.equal(mounted.calls.at(-1), 'pause')
    assert.equal(mounted.video.autoplay, false)
    assert.ok(mounted.subscriptions.every(subscription => subscription.disconnected))
  })
}

test('viewport entry before the approach notification still starts once media is ready', { timeout: 1000 }, async t => {
  const mounted = mountMedia()
  t.after(mounted.cleanup)
  await mounted.viewport().notify(true)
  assert.equal(mounted.video.src, '')
  assert.equal(mounted.video.autoplay, false)
  assert.equal(mounted.calls.includes('play'), false)
  await mounted.approach().notify(true)
  assert.equal(mounted.calls.at(-1), 'play')
  assert.equal(mounted.video.autoplay, true)
})

test('autoplay errors are reported, while non-Error rejection values propagate', { timeout: 1000 }, async t => {
  const mounted = mountMedia()
  t.after(mounted.cleanup)
  await mounted.approach().notify(true)
  const reports: unknown[] = []
  t.mock.method(console, 'warn', (_message: string, reason: unknown) => reports.push(reason))
  const error = new DOMException('Playback denied', 'NotAllowedError')
  mounted.rejectPlay(error)
  await mounted.viewport().notify(true)
  assert.deepEqual(reports, [error])

  await mounted.viewport().notify(false)
  const unknownReason = { failure: 'not-an-Error' }
  mounted.rejectPlay(unknownReason)
  await assert.rejects(async () => mounted.viewport().notify(true), (reason: unknown) => reason === unknownReason)
  assert.deepEqual(reports, [error], 'unknown failures are not swallowed by logging')
})

test('below-fold doctor images retain Next lazy loading without priority preloads', async t => {
  const environment = { ...process.env }
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  t.after(() => { process.env = environment })
  const images = elements(await DoctorGroup()).filter(element => element.props.src)
  assert.equal(images.length, 2)
  for (const image of images) assert.notEqual(image.props.priority, true)
  assert.ok(images.some(image => image.props.className === 'hidden md:block object-cover'))
})
