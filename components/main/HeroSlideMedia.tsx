import type { RefObject } from 'react'
import type { HeroSlide } from './heroSlides'
import { getSlideMedia, getVideoPlaybackRate, getVideoPoster } from './heroSlides'

type HeroSlideMediaProps = {
  readonly slides: readonly HeroSlide[]
  readonly slide: HeroSlide
  readonly current: number
  readonly prev: number
  readonly isMobile: boolean
  readonly videoRef: RefObject<HTMLVideoElement | null>
  readonly onVideoEnded: () => void
}

export function HeroSlideMedia({
  slides,
  current,
  prev,
  isMobile,
  videoRef,
  onVideoEnded,
}: HeroSlideMediaProps) {
  return (
    <>
      {/* One media layer avoids downloads from CSS-hidden device variants. The
          first video and its shared poster remain useful before mobile detection. */}
      <div className="absolute inset-0 isolate">
        {slides.map((item, index) => {
          const active = index === current
          const isPrev = index === prev
          const video = item.isVideo || item.loopVideo
          const prepareNext = index === (current + 1) % slides.length && !video
          // Keep source-free shells mounted: their opacity can transition even
          // on direct jumps, without requesting distant images or video posters.
          // Retain the outgoing source and prepare only the next still.
          const shouldLoad = active || isPrev || prepareNext
          const src = shouldLoad ? getSlideMedia(item, isMobile) : undefined
          const motionClass = isMobile
            ? active || isPrev ? `mobile-pan-${index}` : ''
            : video ? '' : 'hero-kenburns'
          const className = `absolute inset-0 w-full h-full object-cover transition-opacity duration-700 md:duration-[2500ms] ease-in-out ${motionClass}`
          const style = {
            opacity: active || (isMobile && isPrev) ? 1 : 0,
            zIndex: active ? 2 : isPrev ? 1 : 0,
          }

          if (video) {
            return (
              <video
                ref={active && item.isVideo ? videoRef : undefined}
                key={item.id}
                className={className}
                style={style}
                src={src}
                poster={src ? getVideoPoster(src) : undefined}
                preload={active ? 'auto' : 'none'}
                muted
                playsInline
                loop={item.loopVideo}
                autoPlay={active}
                onCanPlay={(event) => {
                  event.currentTarget.playbackRate = getVideoPlaybackRate(item)
                }}
                onEnded={active && item.isVideo ? onVideoEnded : undefined}
              />
            )
          }

          return (
            <img
              key={item.id}
              src={src}
              srcSet={shouldLoad ? item.srcSet : undefined}
              // Cover fills the viewport height on portrait devices. Account for
              // that rather than selecting a blurry 960px frame by width alone.
              sizes={item.width && item.height ? `max(100vw, ${Math.ceil(100 * item.width / item.height)}vh)` : '100vw'}
              width={item.width}
              height={item.height}
              loading="eager"
              fetchPriority={active ? 'high' : 'low'}
              alt=""
              aria-hidden="true"
              className={className}
              style={style}
            />
          )
        })}
      </div>

      <div
        className="hidden md:block absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      <div
        className="hidden md:block absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
        }}
      />

      <div
        className="md:hidden absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: 'calc(var(--mobile-bottom-bar-height) + 160px)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}
      />
    </>
  )
}
