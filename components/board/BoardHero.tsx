// @TASK Board - 게시판 히어로 섹션
interface BoardHeroProps {
  title: string
  subtitle: string
  videoId?: string
  localVideo?: string
  heroImage?: string
  heroFull?: boolean
}

export default function BoardHero({ title, subtitle, videoId, localVideo, heroImage, heroFull }: BoardHeroProps) {
  // 로컬 영상 히어로 (GIF는 video로 재생 불가 → img로 렌더)
  if (localVideo) {
    const isGif = /\.gif(\?|$)/i.test(localVideo)
    // heroFull(임플란트): 세로 확보(모바일 4:5 / 데스크탑 16:9) + 가운데 크롭
    // 그 외(자연치아 등): 16:9 가로 유지 — 영상 잘리지 않게
    const sectionClassName = heroFull
      ? 'relative w-full overflow-hidden bg-black aspect-[4/5] sm:aspect-video'
      : 'relative w-full overflow-hidden bg-black aspect-video'
    const mediaClassName = heroFull
      ? 'absolute inset-0 w-full h-full object-cover object-center'
      : 'absolute inset-0 w-full h-full object-cover'
    const overlayClassName = 'absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10'

    return (
      <section className={sectionClassName} aria-label={`${title} 소개`}>
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
        <div className={overlayClassName} aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10 w-full">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight animate-drop-in">{title}</h1>
            <p className="text-white/80 text-sm sm:text-base mt-2 animate-drop-in" style={{ animationDelay: '0.15s' }}>{subtitle}</p>
          </div>
        </div>
      </section>
    )
  }

  if (videoId) {
    return (
      <section className="relative w-full overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }} aria-label={`${title} 소개`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={`${title} 소개 영상`}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10 w-full">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight animate-drop-in">{title}</h1>
            <p className="text-white/80 text-sm sm:text-base mt-2 animate-drop-in" style={{ animationDelay: '0.15s' }}>{subtitle}</p>
          </div>
        </div>
      </section>
    )
  }

  // 이미지 히어로 - 원본 크기 (heroFull)
  if (heroImage && heroFull) {
    return (
      <section className="relative overflow-hidden" aria-label={`${title} 소개`}>
        <img src={heroImage} alt={title} className="w-full h-auto" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 w-full">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight animate-drop-in">{title}</h1>
            <p className="text-white/80 text-sm sm:text-lg mt-2 animate-drop-in" style={{ animationDelay: '0.15s' }}>{subtitle}</p>
          </div>
        </div>
      </section>
    )
  }

  // 이미지 히어로 - 16:9 모바일 / 60vh PC
  if (heroImage) {
    return (
      <section className="relative h-[72vh] min-h-[520px] overflow-hidden bg-black" aria-label={`${title} 소개`}>
        <img src={heroImage} alt={title} className="absolute inset-0 h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 w-full">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight animate-drop-in">{title}</h1>
            <p className="text-white/80 text-sm sm:text-lg mt-2 animate-drop-in" style={{ animationDelay: '0.15s' }}>{subtitle}</p>
          </div>
        </div>
      </section>
    )
  }

  // 기본 그라데이션 히어로
  return (
    <section className="relative flex items-center justify-center aspect-video sm:aspect-auto sm:min-h-[340px] overflow-hidden" aria-label={`${title} 소개`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#2B2D42] via-[#0080C8] to-[#006EAA]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-10" aria-hidden="true"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="relative z-10 text-center px-4 py-12 sm:py-20 max-w-3xl mx-auto">
        <p className="text-white/70 text-sm sm:text-base tracking-widest uppercase mb-3 font-medium animate-drop-in">수원치과 서울이건치과</p>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 animate-drop-in [animation-delay:0.12s]">{title}</h1>
        <p className="text-white/80 text-sm sm:text-lg leading-relaxed animate-drop-in [animation-delay:0.24s]">{subtitle}</p>
      </div>
    </section>
  )
}
