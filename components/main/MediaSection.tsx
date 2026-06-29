'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const MEDIA_ITEMS = [
  { id: 'notice', label: '공지사항', image: '/images/media-image/notice.webp', href: '/notice', external: false },
  { id: 'blog', label: '원장님 칼럼', image: '/images/media-image/blog.webp', href: 'https://blog.naver.com/seoulegundc', external: true },
  { id: 'youtube', label: '이건TV', image: '/images/media-image/youtube.webp', href: 'https://youtube.com/@seoulegun', external: true },
  { id: 'review', label: '환자분 실제 후기', image: '/images/media-image/review.webp', href: 'https://m.place.naver.com/restaurant/12872860', external: true },
] as const

export default function MediaSection() {
  const { ref, isVisible } = useScrollReveal(0.2)

  return (
    <section ref={ref}
      className="min-h-[640px] w-full flex flex-col items-center justify-center px-4 py-16 sm:px-6 md:min-h-[680px] md:py-20 lg:min-h-[720px] lg:px-8 overflow-hidden"
      style={{ backgroundColor: 'var(--e-bg)' }}>
      <div className="text-center mb-7 md:mb-8">
        <p className={`text-[14px] md:text-[18px] tracking-[0.24em] md:tracking-[0.3em] uppercase text-stone-400 mb-3 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}>
          Egun Media
        </p>
        <h2 className={`text-[24px] md:text-[28px] lg:text-[36px] font-bold text-stone-800 leading-tight ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={isVisible ? { animationDelay: '0.12s' } : undefined}>
          이건치과 소식
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl">
        {MEDIA_ITEMS.map((item, i) => (
          <Link key={item.id} href={item.href}
            className={`group relative flex flex-col items-center rounded-lg outline-none transition-transform duration-500 ease-out hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:ring-2 focus-visible:ring-[var(--e-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--e-bg)] ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={isVisible ? { animationDelay: `${0.2 + i * 0.12}s` } : undefined}
            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg bg-white p-2 shadow-[0_16px_36px_rgba(43,45,66,0.10)] ring-1 ring-[#E5E7EB]/80 transition-all duration-500 ease-out group-hover:shadow-[0_26px_60px_rgba(43,45,66,0.18)] group-hover:ring-[#D6D9DF] group-focus-visible:shadow-[0_26px_60px_rgba(43,45,66,0.18)]">
              <div className="relative h-full w-full overflow-hidden rounded-md bg-stone-200">
                <Image src={item.image} alt={item.label}
                  fill
                  sizes="(max-width: 768px) 45vw, (max-width: 1280px) 25vw, 300px"
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.035] group-hover:brightness-105 group-focus-visible:scale-[1.035] group-focus-visible:brightness-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/0 opacity-70 transition-opacity duration-500 group-hover:opacity-35 group-focus-visible:opacity-35" />
                <div className="absolute inset-x-0 top-0 h-1/2 -translate-y-full bg-gradient-to-b from-white/28 to-transparent opacity-0 transition duration-700 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100" />
              </div>
            </div>
            <p className="mt-4 w-full break-keep text-center text-[20px] font-semibold leading-snug text-stone-700 transition-colors duration-300 group-hover:text-[#2B2D42] group-focus-visible:text-[#2B2D42]">
              {item.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
