'use client'

import { useEffect, useRef, useState } from 'react'

interface NavItem {
  id: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'philosophy', label: '진료철학' },
  { id: 'doctors', label: '의료진소개' },
  { id: 'interior', label: '내부전경' },
  { id: 'lab', label: '디지털기공소' },
  { id: 'access', label: '오시는길' },
]

export default function AnchorNav() {
  const [activeId, setActiveId] = useState<string>('philosophy')
  const observerRef = useRef<IntersectionObserver | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id)
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 화면에 가장 많이 보이는 섹션을 active로
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    sections.forEach((section) => observerRef.current?.observe(section))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    const keepActiveVisible = () => {
      const list = listRef.current
      const active = list?.querySelector<HTMLButtonElement>(
        '[aria-current="location"]',
      )
      const item = active?.parentElement
      if (!list || !item) return

      const itemLeft = item.offsetLeft
      const itemRight = itemLeft + item.offsetWidth
      if (list.scrollLeft > itemLeft) {
        list.scrollLeft = itemLeft
      } else if (itemRight > list.scrollLeft + list.clientWidth) {
        list.scrollLeft = itemRight - list.clientWidth
      }
    }

    keepActiveVisible()
    window.addEventListener('scroll', keepActiveVisible, { passive: true })
    return () => window.removeEventListener('scroll', keepActiveVisible)
  }, [activeId])

  const handleClick = (id: string, target: HTMLButtonElement) => {
    const el = document.getElementById(id)
    if (!el) return
    const item = target.parentElement
    const scroller = item?.parentElement
    const OFFSET = 144 // fixed header (80px) + AnchorNav (~52px) + buffer
    const top = el.getBoundingClientRect().top + window.scrollY - OFFSET
    window.dispatchEvent(new CustomEvent('about-anchor-scroll'))
    window.scrollTo({ top, behavior: 'auto' })
    if (item && scroller) {
      const centeredLeft =
        item.offsetLeft + item.offsetWidth / 2 - scroller.clientWidth / 2
      scroller.scrollTo({ left: Math.max(0, centeredLeft), behavior: 'auto' })
    }
    target.blur()
  }

  return (
    <nav
      className="sticky top-16 sm:top-20 z-40 bg-white border-b border-gray-200 shadow-sm"
      aria-label="페이지 내 이동"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul ref={listRef} className="flex items-center overflow-x-auto scrollbar-hide gap-0">
          {NAV_ITEMS.map((item) => (
            <li key={item.id} className="shrink-0">
              <button
                onClick={(event) => handleClick(item.id, event.currentTarget)}
                onMouseDown={(event) => event.preventDefault()}
                className={`relative px-3 sm:px-5 py-3.5 text-[17px] font-medium transition-colors whitespace-nowrap ${
                  activeId === item.id
                    ? 'text-[#0080C8]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                aria-current={activeId === item.id ? 'location' : undefined}
              >
                {item.label}
                {activeId === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0080C8]" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
