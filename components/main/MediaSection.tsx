'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const MEDIA_ITEMS = [
  { id: 'notice',  label: '공지사항',       image: '/images/media-image/notice.webp',  href: '/notice',                                                    external: false, hoverColor: '#0080C8' },
  { id: 'blog',    label: '원장님 칼럼',     image: '/images/media-image/blog.webp',    href: 'https://blog.naver.com/seoulegundc',                          external: true,  hoverColor: '#22C55E' },
  { id: 'youtube', label: '이건TV',          image: '/images/media-image/youtube.webp', href: 'https://youtube.com/@seoulegun',                             external: true,  hoverColor: '#FF0000' },
  { id: 'review',  label: '환자분 실제 후기', image: '/images/media-image/review.webp',  href: 'https://m.place.naver.com/restaurant/12872860',               external: true,  hoverColor: '#22C55E' },
]

export default function MediaSection() {
  const { ref, isVisible } = useScrollReveal(0.2)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section ref={ref}
      className="h-screen w-full flex flex-col items-center justify-center px-4 pb-24 sm:px-6 md:pb-0 lg:px-8 overflow-hidden"
      style={{ backgroundColor: 'var(--e-bg)' }}>
      <div className="text-center mb-6 md:mb-9">
        <p className={`text-[14px] md:text-[18px] tracking-[0.24em] md:tracking-[0.3em] uppercase text-stone-400 mb-3 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}>
          Egun Media
        </p>
        <h2 className={`text-[24px] md:text-[28px] lg:text-[36px] font-bold text-stone-800 leading-tight ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={isVisible ? { animationDelay: '0.12s' } : undefined}>
          이건치과 소식
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 w-full max-w-5xl">
        {MEDIA_ITEMS.map((item, i) => {
          const isHov = hovered === item.id
          return (
            <Link key={item.id} href={item.href}
              className={`group relative flex flex-col items-center ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
              style={isVisible ? { animationDelay: `${0.2 + i * 0.12}s` } : undefined}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-stone-200 flex items-center justify-center">
                <Image src={item.image} alt={item.label}
                  width={1080} height={1080}
                  className="w-[90%] h-[90%] object-cover transition-transform duration-500 group-hover:scale-105 rounded-lg" />
                {/* 호버 테두리 + 글로우 */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
                  style={{
                    border: isHov ? `6px solid ${item.hoverColor}` : '6px solid transparent',
                    boxShadow: isHov ? `inset 0 0 0 1px ${item.hoverColor}40, 0 0 28px ${item.hoverColor}55` : 'none',
                  }}
                />
              </div>
              <p className="mt-3 w-full break-keep text-center text-[18px] font-semibold leading-snug text-stone-700 transition-colors duration-300"
                style={isHov ? { color: item.hoverColor } : undefined}>
                {item.label}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
