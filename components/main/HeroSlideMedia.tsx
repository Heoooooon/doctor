import type { RefObject } from 'react'
import type { HeroSlide } from './heroSlides'
import {
  INTRO_SLIDE,
  getSlideMedia,
  getVideoPlaybackRate,
  getVideoPoster,
} from './heroSlides'

type HeroSlideMediaProps = {
  readonly slides: readonly HeroSlide[]
  readonly slide: HeroSlide
  /** 인트로 중에는 -1 (캐러셀 슬라이드 모두 비활성) */
  readonly current: number
  readonly prev: number
  readonly isIntro: boolean
  readonly isMobile: boolean
  readonly videoRef: RefObject<HTMLVideoElement | null>
  readonly onVideoEnded: () => void
}

export function HeroSlideMedia({
  slides,
  slide,
  current,
  prev,
  isIntro,
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
          poster={getVideoPoster(slide.image)}
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

      {/* 모바일 미디어 — 데스크탑과 같은 슬라이드 소스를 SSR부터 렌더해
          새로고침 첫 페인트에서도 데스크탑과 동일한 첫 슬라이드가 보인다.
          (md:hidden으로 데스크탑에서는 숨김. ref/이벤트는 모바일에서만 연결) */}
      <div className="md:hidden absolute inset-0">
        {/* 모바일 인트로 프리슬라이드 — SSR부터 렌더되어 새로고침 첫 페인트에 바로 보임 */}
        <video
          ref={isMobile && isIntro ? videoRef : undefined}
          key="hero-video-m-intro"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          style={{ opacity: isIntro ? 1 : 0, zIndex: isIntro ? 3 : 0 }}
          src={getSlideMedia(INTRO_SLIDE, true)}
          poster={getVideoPoster(getSlideMedia(INTRO_SLIDE, true))}
          preload="auto"
          muted
          playsInline
          autoPlay
          onCanPlay={(event) => {
            event.currentTarget.playbackRate = getVideoPlaybackRate(INTRO_SLIDE)
          }}
          onEnded={isMobile && isIntro ? onVideoEnded : undefined}
        />
        {slides.map((item, index) => {
          const active = index === current
          const isPrev = index === prev
          const visible = active || isPrev
          const panClass = active || isPrev ? `mobile-pan-${index}` : ''
          const zIndex = active ? 2 : isPrev ? 1 : 0
          const src = getSlideMedia(item, true)

          if (item.isVideo) {
            return (
              <video
                ref={isMobile && active ? videoRef : undefined}
                key={`hero-video-m-${item.id}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${panClass}`}
                style={{ opacity: visible ? 1 : 0, zIndex }}
                src={src}
                poster={getVideoPoster(src)}
                preload={active ? 'auto' : 'metadata'}
                muted
                playsInline
                autoPlay={active}
                onCanPlay={(event) => {
                  event.currentTarget.playbackRate = getVideoPlaybackRate(item)
                }}
                onEnded={isMobile && active ? onVideoEnded : undefined}
              />
            )
          }

          if (item.loopVideo) {
            return (
              <video
                key={item.id}
                src={src}
                muted
                loop
                autoPlay
                playsInline
                aria-hidden="true"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${panClass}`}
                style={{ opacity: visible ? 1 : 0, zIndex }}
              />
            )
          }

          return (
            <img
              key={item.id}
              src={src}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${panClass}`}
              style={{ opacity: visible ? 1 : 0, zIndex }}
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
