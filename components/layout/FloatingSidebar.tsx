'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { clinicInfo } from '@/data/clinic-info'

/* ── 커스텀 아이콘 SVG ─────────────────────────────── */

function ToothIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2c-2.2 0-4 .9-5 2.3C6 5.6 6 7 6.5 8.5c.4 1.2.5 2.2.5 3C7 14.5 8 22 9.5 22c.8 0 1.2-1.5 1.5-3 .2-.8.5-2 1-2s.8 1.2 1 2c.3 1.5.7 3 1.5 3C16 22 17 14.5 17 11.5c0-.8.1-1.8.5-3C18 7 18 5.6 17 4.3 16 2.9 14.2 2 12 2z"/>
    </svg>
  )
}

function YoutubeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
    </svg>
  )
}

function BlogNIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 3H8C5.24 3 3 5.24 3 8v8c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5V8c0-2.76-2.24-5-5-5zm-1.5 12.5L10 11.25V15.5H8.5v-7h1.5l4.5 4.25V8.5H16v7h-1.5z"/>
    </svg>
  )
}

function TalkIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 44" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="46" height="34" rx="12" fill="currentColor" fillOpacity="0.85"/>
      <text x="24" y="23" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1a1a" fontFamily="Arial, sans-serif" letterSpacing="0.5">TALK</text>
      <path d="M16 35 L24 44 L32 35" fill="currentColor" fillOpacity="0.85"/>
    </svg>
  )
}

/* ── 사이드바 아이템 타입 ─────────────────────────── */

interface Item {
  label: string
  icon: React.ReactNode
  href: string
  external?: boolean
  tel?: boolean
}

/* ── 컴포넌트 ────────────────────────────────────── */

export default function FloatingSidebar() {
  // 메인 히어로 섹션을 지나(두 번째 챕터부터) 노출, 이후 고정
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const items: Item[] = [
    {
      label: '치료전후',
      icon: <ToothIcon />,
      href: '/cases',
    },
    {
      label: '유튜브',
      icon: <YoutubeIcon />,
      href: clinicInfo.socialLinks.youtube,
      external: true,
    },
    {
      label: '오시는길',
      icon: <MapPin size={22} />,
      href: clinicInfo.socialLinks.naverPlace,
      external: true,
    },
    {
      label: '원장블로그',
      icon: <BlogNIcon />,
      href: clinicInfo.socialLinks.blog,
      external: true,
    },
    {
      label: '카카오톡',
      icon: <TalkIcon />,
      href: clinicInfo.socialLinks.kakao,
      external: true,
    },
    {
      label: '상담/문의',
      icon: <Phone size={22} />,
      href: `tel:${clinicInfo.phone}`,
      tel: true,
    },
  ]

  const itemClass =
    'group w-full flex flex-col items-center justify-center gap-1.5 py-3 px-1 cursor-pointer ' +
    'text-white/55 hover:text-white hover:bg-white/8 transition-all duration-200'
  const labelClass = 'text-[10px] font-medium leading-none tracking-wide'

  return (
    /* 데스크탑 전용 — 모바일에서는 숨김. 히어로 이후부터 노출 */
    <aside
      className={`hidden md:flex fixed right-3 top-1/2 -translate-y-1/2 z-50 flex-col w-[64px] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{
        background: '#181818',
        borderRadius: '32px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}
      aria-label="빠른 링크"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        const style: React.CSSProperties = isLast
          ? {}
          : { borderBottom: '1px solid rgba(255,255,255,0.08)' }

        const inner = (
          <>
            <span className="group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </span>
            <span className={labelClass}>{item.label}</span>
          </>
        )

        if (item.tel || item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              aria-label={item.label}
              className={itemClass}
              style={style}
            >
              {inner}
            </a>
          )
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            className={itemClass}
            style={style}
          >
            {inner}
          </Link>
        )
      })}
    </aside>
  )
}
