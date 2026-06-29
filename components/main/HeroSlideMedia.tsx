import type { RefObject } from 'react'
import type { HeroSlide } from './heroSlides'
import { getVideoPlaybackRate, getVideoPoster } from './heroSlides'

type HeroSlideMediaProps = {
  readonly slides: readonly HeroSlide[]
  readonly slide: HeroSlide
  readonly current: number
  readonly isMobile: boolean
  readonly videoRef: RefObject<HTMLVideoElement | null>
  readonly onVideoEnded: () => void
}

export function HeroSlideMedia({
  slides,
  slide,
  current,
  isMobile,
  videoRef,
  onVideoEnded,
}: HeroSlideMediaProps) {
  return (
    <>
      <div className="hidden md:block absolute inset-0">
        {slides.map((item, index) =>
          item.isVideo ? null : item.loopVideo ? (
            <video
              key={item.id}
              src={item.image}
              muted
              loop
              autoPlay
              playsInline
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2500ms] ease-in-out"
              style={{ opacity: index === current ? 1 : 0 }}
            />
          ) : (
            <img
              key={item.id}
              src={item.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover hero-kenburns transition-opacity duration-[2500ms] ease-in-out"
              style={{ opacity: index === current ? 1 : 0 }}
            />
          ),
        )}
      </div>

      {!isMobile && slide.isVideo && (
        <video
          ref={videoRef}
          key={`hero-video-${slide.id}`}
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
          src={slide.image}
          poster={getVideoPoster(slide)}
          preload="auto"
          autoPlay
          muted
          playsInline
          onCanPlay={(event) => {
            event.currentTarget.playbackRate = getVideoPlaybackRate(slide)
          }}
          onEnded={onVideoEnded}
        />
      )}

      <div className="md:hidden absolute inset-0">
        {slide.isVideo ? (
          isMobile ? (
            <video
              ref={videoRef}
              key={`hero-video-m-${slide.id}`}
              className="absolute inset-0 w-full h-full object-cover"
              src={slide.image}
              poster={getVideoPoster(slide)}
              preload="auto"
              autoPlay
              muted
              playsInline
              onCanPlay={(event) => {
                event.currentTarget.playbackRate = getVideoPlaybackRate(slide)
              }}
              onEnded={onVideoEnded}
            />
          ) : null
        ) : slide.loopVideo ? (
          <video
            key={`m-${current}`}
            src={slide.image}
            muted
            loop
            autoPlay
            playsInline
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            key={current}
            src={slide.image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover mobile-pan-${current}`}
          />
        )}
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
