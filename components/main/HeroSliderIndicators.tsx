import type { HeroSlide } from './heroSlides'
import {
  INDICATOR_CIRCUMFERENCE,
  INDICATOR_RADIUS,
} from './heroSlides'

type HeroSliderIndicatorsProps = {
  readonly slides: readonly HeroSlide[]
  readonly current: number
  readonly progress: number
  readonly onGoTo: (index: number) => void
}

export function HeroSliderIndicators({
  slides,
  current,
  progress,
  onGoTo,
}: HeroSliderIndicatorsProps) {
  return (
    <>
      <div className="md:hidden absolute bottom-10 inset-x-0 flex justify-center items-center gap-2.5 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => onGoTo(index)}
            aria-label={`슬라이드 ${index + 1}로 이동`}
            className="group flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300"
          >
            <span
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === current
                  ? 'bg-white scale-125'
                  : 'bg-white/45 group-hover:bg-white/70'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="hidden md:flex absolute left-6 md:left-10 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-10">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => onGoTo(index)}
            aria-label={`슬라이드 ${index + 1}로 이동`}
            className="relative flex items-center justify-center w-11 h-11"
          >
            {index === current ? (
              <>
                <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r={INDICATOR_RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r={INDICATOR_RADIUS}
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={INDICATOR_CIRCUMFERENCE}
                    strokeDashoffset={INDICATOR_CIRCUMFERENCE * (1 - progress)}
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                  />
                </svg>
                <span className="absolute w-2 h-2 rounded-full bg-white" />
              </>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/70 transition-colors" />
            )}
          </button>
        ))}
      </div>

      <div className="hidden md:block absolute bottom-20 right-6 md:right-10 text-white/50 text-[18px] tracking-widest font-mono">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </>
  )
}
