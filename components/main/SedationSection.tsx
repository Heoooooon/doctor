'use client'

import { useEffect, useRef, useState, type Ref } from 'react'
import { useCountUp } from '@/hooks/useCountUp'

const STATS = [
  { target: 12259, suffix: '', label: '임플란트 시술' },
  { target: 23725, suffix: '', label: '누적 진료' },
  { target: 10, suffix: '', label: '진료 경력(년)' },
]

function StatItem({
  target,
  suffix,
  label,
}: {
  target: number
  suffix: string
  label: string
}) {
  const { count, elementRef } = useCountUp({ target, duration: 2200 })

  return (
    <div ref={elementRef} className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-0.5">
        <span className="text-xl sm:text-2xl md:text-4xl font-black tabular-nums text-white drop-shadow-lg">
          {count.toLocaleString()}
        </span>
        <span className="text-[18px] sm:text-lg md:text-2xl font-bold pb-0.5 text-white/80">
          {suffix}
        </span>
      </div>
      <p className="text-[14px] sm:text-[18px] text-white/70 tracking-wide">
        {label}
      </p>
    </div>
  )
}

export type SedationObserverOptions<Root> = Pick<IntersectionObserverInit, 'threshold' | 'rootMargin'> & {
  root?: Root | null
}

/** Own the video's mutable media attributes; React keeps the treatment text rendered. */
export function startSedationMedia<Root>(
  section: { closest(selector: string): Root | null },
  video: Pick<HTMLVideoElement, 'src' | 'preload' | 'autoplay' | 'play' | 'pause'>,
  setVisible: (visible: boolean) => void,
  observe: (
    onIntersection: (isIntersecting: boolean) => void | Promise<void>,
    options: SedationObserverOptions<Root>
  ) => () => void
) {
  let ready = false
  let visible = false

  function updatePlayback() {
    if (!ready) return
    video.autoplay = visible
    if (visible) {
      return video.play().catch((error: unknown) => {
        if (!(error instanceof Error)) throw error
        console.warn('Sedation video playback unavailable', error)
      })
    }
    video.pause()
  }

  const stopViewport = observe((isIntersecting) => {
    if (visible === isIntersecting) return
    visible = isIntersecting
    setVisible(visible)
    return updatePlayback()
  }, { threshold: 0.1 })

  const stopApproach = observe((isIntersecting) => {
    if (!isIntersecting) return
    video.preload = 'metadata'
    video.src = '/images/video/sedation-hero.mp4'
    ready = true
    stopApproach()
    return updatePlayback()
  }, {
    // Desktop scrolls inside its own container; mobile uses the document viewport.
    root: section.closest('#home-desktop'),
    rootMargin: '300px 0px',
  })

  return () => {
    stopViewport()
    stopApproach()
    video.autoplay = false
    // Keep the source and last frame on exit, and resume rather than rewind.
    video.pause()
  }
}

export default function SedationSection() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return

    return startSedationMedia(section, video, setVisible, (onIntersection, options) => {
      const observer = new IntersectionObserver(
        ([entry]) => { void onIntersection(entry.isIntersecting) },
        options
      )
      observer.observe(section)
      return () => observer.disconnect()
    })
  }, [])

  return <SedationSectionView visible={visible} sectionRef={sectionRef} videoRef={videoRef} />
}

export function SedationSectionView({ visible, sectionRef, videoRef }: {
  visible: boolean
  sectionRef: Ref<HTMLElement>
  videoRef: Ref<HTMLVideoElement>
}) {
  return (
    <section ref={sectionRef} className="min-h-[620px] w-full relative overflow-hidden bg-black md:min-h-[680px] lg:min-h-[720px]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        preload="none"
        aria-hidden="true"
      />

      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 콘텐츠 오버레이 */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 gap-9">
        <div className="text-center">
          <p className={`text-[14px] md:text-[18px] tracking-[0.24em] md:tracking-[0.3em] uppercase text-white/50 mb-3 ${visible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}>
            Sedation Dentistry
          </p>
          <h2
            className={`text-[30px] sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-2 ${visible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={{
              color: '#4fc3f7',
              textShadow: '0 2px 6px rgba(0,0,0,0.7)',
              ...(visible ? { animationDelay: '0.12s' } : {}),
            }}
          >
            두려움 없는 치과치료
          </h2>
          <p className={`text-[18px] text-white/60 max-w-sm mx-auto leading-relaxed ${visible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={visible ? { animationDelay: '0.24s' } : undefined}>
            수면 상태에서 안전하게, 의식하 진정법
          </p>
        </div>

        {/* 카운팅 숫자 */}
        <div className="flex justify-center gap-5 sm:gap-8 md:gap-16 lg:gap-20 w-full max-w-3xl">
          {STATS.map((s) => (
            <StatItem key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
