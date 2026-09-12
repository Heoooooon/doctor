import assert from 'node:assert/strict'
import { statSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import './column-runtime.mts'

const { HeroSlideMedia } = await import('../components/main/HeroSlideMedia.tsx')
const { HERO_SLIDES, getSlideInterval, getVideoPoster } = await import('../components/main/heroSlides.ts')
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve('next'))('sharp')

// Inspect the real renderer's elements and invoke its actual event handlers.
// No component, React, media-selection, or callback implementation is mocked.
type MediaProps = {
  children?: ReactNode
  src?: string
  className: string
  style: { opacity: number; zIndex: number }
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
  loading?: string
  fetchPriority?: string
  poster?: string
  ref?: unknown
  autoPlay?: boolean
  muted?: boolean
  playsInline?: boolean
  onCanPlay?: (event: { currentTarget: { playbackRate: number } }) => void
  onEnded?: () => void
}
type Element = ReactElement<MediaProps>
function elements(node: ReactNode): Element[] {
  return Children.toArray(node).flatMap(child => {
    if (!isValidElement<MediaProps>(child)) return []
    return [child, ...elements(child.props.children)]
  })
}
function mediaBySrc(media: Element[], src: string | undefined) {
  assert.ok(src)
  const element = media.find(item => item.props.src === src)
  assert.ok(element, `Missing media: ${src}`)
  return element
}
function render(current = 0, prev = -1, isMobile = false) {
  const videoRef = { current: null }
  let ended = 0
  const tree = HeroSlideMedia({
    slides: HERO_SLIDES, slide: HERO_SLIDES[current], current, prev, isMobile,
    videoRef, onVideoEnded: () => { ended++ },
  })
  return {
    tree, videoRef, ended: () => ended,
    media: elements(tree).filter(element => (element.type === 'img' || element.type === 'video') && element.props.src),
  }
}

test('initial SSR exposes one autoplay video and its useful shared poster, not hidden-device videos', () => {
  const { tree, media, videoRef } = render()
  const videos = media.filter(element => element.type === 'video')
  assert.equal(videos.length, 1)
  assert.equal(videos[0].props.src, '/images/slides/main-02-optimized.mp4')
  assert.equal(videos[0].props.poster, getVideoPoster(HERO_SLIDES[0].image))
  assert.equal(videos[0].props.ref, videoRef)
  assert.equal(videos[0].props.autoPlay, true)
  assert.equal(videos[0].props.muted, true)
  assert.equal(videos[0].props.playsInline, true)
  const html = renderToStaticMarkup(tree)
  assert.match(html, /poster="\/images\/slides\/main-02-poster.jpg"/)
  assert.doesNotMatch(html, /slide-4-mobile.mp4|slide-1.mp4|slide-5/)
})

test('only current, previous and next still can request media throughout the six-slide cycle', () => {
  assert.equal(HERO_SLIDES.length, 6)
  for (const mobile of [false, true]) {
    for (let current = 0; current < HERO_SLIDES.length; current++) {
      const prev = (current + HERO_SLIDES.length - 1) % HERO_SLIDES.length
      const next = (current + 1) % HERO_SLIDES.length
      const { tree, media } = render(current, prev, mobile)
      const expected = HERO_SLIDES.filter((item, index) => index === current || index === prev || (index === next && !item.isVideo))
      assert.equal(media.length, expected.length, `slide ${current}, mobile=${mobile}`)
      assert.deepEqual(media.map(element => element.props.src), expected.map(item => mobile && item.mobileImage || item.image))
      const html = renderToStaticMarkup(tree)
      assert.equal([...html.matchAll(/<(?:img|video)\b[^>]*\bsrc="/g)].length, expected.length)
    }
  }
})

test('next still is mounted transparent and eager at low priority before becoming current', () => {
  const prepared = mediaBySrc(render(1, 0).media, HERO_SLIDES[2].image)
  assert.equal(prepared.props.style.opacity, 0)
  assert.equal(prepared.props.loading, 'eager')
  assert.equal(prepared.props.fetchPriority, 'low')
  const current = mediaBySrc(render(2, 1).media, HERO_SLIDES[2].image)
  assert.equal(current.key, prepared.key, 'preloaded element must survive the transition')
  assert.equal(current.props.style.opacity, 1)
  assert.equal(current.props.loading, 'eager')
  assert.equal(current.props.fetchPriority, 'high')
})

test('far media retain source-free keyed shells so jumps and video activation can crossfade', () => {
  const initial = elements(render().tree)
  for (let index = 2; index < HERO_SLIDES.length; index++) {
    const active = mediaBySrc(render(index, 0).media, HERO_SLIDES[index].image)
    const shell = initial.find(element => element.type === active.type && element.key === active.key)
    assert.ok(shell, `Missing transition shell for slide ${index}`)
    assert.equal(shell.props.src, undefined)
    assert.equal(shell.props.srcSet, undefined)
    assert.equal(shell.props.poster, undefined)
    assert.equal(shell.props.style.opacity, 0)
    assert.equal(active.props.style.opacity, 1)
  }
})

test('previous media survives direct jumps and keeps mobile crossfade and pan classes', () => {
  const mobile = render(4, 1, true).media
  const current = mediaBySrc(mobile, HERO_SLIDES[4].image)
  const previous = mediaBySrc(mobile, HERO_SLIDES[1].image)
  assert.equal(current.props.style.opacity, 1)
  assert.equal(previous.props.style.opacity, 1)
  assert.ok(current.props.style.zIndex > previous.props.style.zIndex)
  assert.match(current.props.className, /mobile-pan-4/)
  assert.match(previous.props.className, /mobile-pan-1/)
  assert.match(current.props.className, /duration-700/)
  const desktop = render(4, 1).media
  assert.equal(mediaBySrc(desktop, HERO_SLIDES[1].image).props.style.opacity, 0)
  assert.match(mediaBySrc(desktop, HERO_SLIDES[4].image).props.className, /hero-kenburns/)
  assert.match(mediaBySrc(desktop, HERO_SLIDES[4].image).props.className, /duration-\[2500ms\]/)
})

test('only the active video owns callbacks/ref, preserves rate, and selects the mobile source', () => {
  for (const mobile of [false, true]) {
    const rendered = render(5, 0, mobile)
    const active = mediaBySrc(rendered.media, mobile ? HERO_SLIDES[5].mobileImage : HERO_SLIDES[5].image)
    const previous = mediaBySrc(rendered.media, HERO_SLIDES[0].image)
    assert.equal(active.props.ref, rendered.videoRef)
    assert.ok(active.props.src)
    assert.equal(active.props.poster, getVideoPoster(active.props.src))
    assert.equal(active.props.autoPlay, true)
    assert.equal(previous.props.ref, undefined)
    assert.equal(previous.props.onEnded, undefined)
    assert.equal(previous.props.autoPlay, false)
    const target = { playbackRate: 1 }
    assert.ok(active.props.onCanPlay)
    active.props.onCanPlay({ currentTarget: target })
    assert.equal(target.playbackRate, 0.7)
    assert.ok(active.props.onEnded)
    active.props.onEnded()
    assert.equal(rendered.ended(), 1)
  }
})

test('all static slides have full-frame responsive assets under a combined 600KB desktop budget', async () => {
  const originals = new Map([
    [3, 'slide-3.jpg'], [4, 'slide-4.webp'], [5, 'slide-5.png'], [6, 'slide-6.jpg'],
  ])
  let bytes = 0
  for (const [index, item] of HERO_SLIDES.entries()) {
    if (item.isVideo) continue
    assert.match(item.image, /-hero-\d+\.webp$/)
    bytes += statSync(new URL(`../public${item.image}`, import.meta.url)).size
    const original = await sharp(new URL(`../public/images/slides/${originals.get(item.id)}`, import.meta.url).pathname).metadata()
    const image = mediaBySrc(render(index).media, item.image)
    assert.ok(image.props.width && image.props.width > 0)
    assert.ok(image.props.height && image.props.height > 0)
    assert.match(image.props.sizes ?? '', /^max\(100vw, \d+vh\)$/)
    assert.ok(image.props.srcSet)
    const candidates = image.props.srcSet.split(',').map(entry => entry.trim().split(/\s+/))
    assert.equal(candidates.length, 2)
    for (const [src, width] of candidates) {
      assert.match(width, /^\d+w$/)
      const file = new URL(`../public${src}`, import.meta.url)
      assert.ok(statSync(file).size > 0)
      const metadata = await sharp(file.pathname).metadata()
      assert.equal(metadata.format, 'webp')
      assert.equal(metadata.width, Number.parseInt(width, 10))
      assert.ok(metadata.width <= original.width, 'never upscale the original')
      assert.ok(Math.abs(metadata.height - metadata.width * original.height / original.width) <= 0.5, 'preserve aspect ratio to the nearest pixel')
      if (src === item.image) {
        assert.equal(metadata.width, image.props.width)
        assert.equal(metadata.height, image.props.height)
      }
    }
  }
  assert.ok(bytes < 600_000, `desktop still total: ${bytes} bytes`)
})

test('slide ordering and desktop/mobile intervals remain unchanged', () => {
  assert.deepEqual(HERO_SLIDES.map(item => item.id), [2, 3, 4, 5, 6, 1])
  assert.deepEqual(HERO_SLIDES.map(item => getSlideInterval(item, false)), [4700, 3000, 3000, 3000, 3000, 4700])
  assert.deepEqual(HERO_SLIDES.map(item => getSlideInterval(item, true)), [4700, 4000, 5000, 5000, 3000, 4700])
})

test('the first autoplay video stays within the initial media transfer budget', () => {
  const first = HERO_SLIDES[0]
  assert.equal(first.isVideo, true)
  assert.ok(statSync(new URL(`../public${first.image}`, import.meta.url)).size < 200_000)
})
