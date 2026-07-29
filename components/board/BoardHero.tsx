// @TASK Board - 게시판 히어로 섹션
// 크기·폰트 기준: 심미보철 게시판 (h-[72vh] min-h-[520px], 동일 타이포그래피) — 전 게시판 통일
interface BoardHeroProps {
  title: string
  subtitle: string
  videoId?: string
  localVideo?: string
  heroImage?: string
  heroFull?: boolean
  heroImagePosition?: string   // CSS object-position (예: 'center bottom') — 기본 'center top'
  heroImageContain?: boolean   // true면 크롭 없이 이미지 전체 표시 (여백은 배경색)
}

const SECTION_CLASS = 'relative h-[72vh] min-h-[520px] overflow-hidden bg-black'
const TITLE_CLASS = 'text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight animate-drop-in'
const SUBTITLE_CLASS = 'text-white/80 text-sm sm:text-lg mt-2 animate-drop-in'
const TEXT_WRAP_CLASS = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 w-full'

function HeroText({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="absolute inset-0 flex items-end">
      <div className={TEXT_WRAP_CLASS}>
        <h1 className={TITLE_CLASS}>{title}</h1>
        <p className={SUBTITLE_CLASS} style={{ animationDelay: '0.15s' }}>{subtitle}</p>
      </div>
    </div>
  )
}

export default function BoardHero({ title, subtitle, videoId, localVideo, heroImage, heroImagePosition, heroImageContain }: BoardHeroProps) {
  // 로컬 영상 히어로 (GIF는 video로 재생 불가 → img로 렌더)
  if (localVideo) {
    const isGif = /\.gif(\?|$)/i.test(localVideo)
    const mediaClassName = 'absolute inset-0 w-full h-full object-cover object-center'

    return (
      <section className={SECTION_CLASS} aria-label={`${title} 소개`}>
        {isGif ? (
          <img
            className={mediaClassName}
            src={localVideo}
            alt={`${title} 소개`}
          />
        ) : (
          <video
            className={mediaClassName}
            src={localVideo}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10" aria-hidden="true" />
        <HeroText title={title} subtitle={subtitle} />
      </section>
    )
  }

  if (videoId) {
    return (
      <section className={SECTION_CLASS} aria-label={`${title} 소개`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={`${title} 소개 영상`}
        />
        <div className="absolute inset-0 bg-black/20" />
        <HeroText title={title} subtitle={subtitle} />
      </section>
    )
  }

  // 이미지 히어로 — 심미보철 기준
  if (heroImage) {
    return (
      <section className={SECTION_CLASS} aria-label={`${title} 소개`}>
        <img
          src={heroImage}
          alt={title}
          className={`absolute inset-0 h-full w-full ${heroImageContain ? 'object-contain' : 'object-cover'}`}
          style={{ objectPosition: heroImagePosition ?? 'center top' }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <HeroText title={title} subtitle={subtitle} />
      </section>
    )
  }

  // 기본 그라데이션 히어로
  return (
    <section className={`${SECTION_CLASS} flex items-center justify-center`} aria-label={`${title} 소개`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#2B2D42] via-[#0080C8] to-[#006EAA]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-10" aria-hidden="true"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="relative z-10 text-center px-4 py-12 sm:py-20 max-w-3xl mx-auto">
        <p className="text-white/70 text-sm sm:text-base tracking-widest uppercase mb-3 font-medium animate-drop-in">수원치과 서울이건치과</p>
        <h1 className={`${TITLE_CLASS} mb-4 [animation-delay:0.12s]`}>{title}</h1>
        <p className="text-white/80 text-sm sm:text-lg leading-relaxed animate-drop-in [animation-delay:0.24s]">{subtitle}</p>
      </div>
    </section>
  )
}
