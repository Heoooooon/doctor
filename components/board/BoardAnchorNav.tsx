'use client'

// @TASK Board - 게시판 앵커 내비게이션 (sticky, 스크롤 하이라이트)
import { useState, useEffect, useCallback, useRef } from 'react'

interface NavItem {
  id: string
  label: string
}

interface BoardAnchorNavProps {
  items: NavItem[]
}

export default function BoardAnchorNav({ items }: BoardAnchorNavProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>())
  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1)
      if (hash && items.some((item) => item.id === hash)) return hash
    }
    return items[0]?.id ?? ''
  })

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()
      const el = document.getElementById(id)
      if (!el) return
      const nav = e.currentTarget.closest('nav')
      const stickyTop = nav ? Number.parseFloat(window.getComputedStyle(nav).top) : 0
      const offset = nav
        ? (Number.isFinite(stickyTop) ? stickyTop : 0) + nav.getBoundingClientRect().height
        : 164
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
      setActiveId(id)
    },
    [],
  )

  useEffect(() => {
    const sectionEls = items.flatMap((item) => {
      const section = document.getElementById(item.id)
      return section ? [section] : []
    })
    let rafId: number | null = null

    const updateActiveId = () => {
      const nav = listRef.current?.closest('nav')
      const navBottom = nav?.getBoundingClientRect().bottom ?? 136
      const activationY = window.scrollY + navBottom + 1
      let nextActiveId = sectionEls[0]?.id ?? ''

      for (const section of sectionEls) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY
        if (sectionTop <= activationY) {
          nextActiveId = section.id
        }
      }

      if (nextActiveId) setActiveId(nextActiveId)
    }

    const scheduleUpdate = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        updateActiveId()
      })
    }

    updateActiveId()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [items])

  useEffect(() => {
    const list = listRef.current
    const activeItem = itemRefs.current.get(activeId)
    if (!list || !activeItem) return

    const targetLeft = activeItem.offsetLeft - (list.clientWidth - activeItem.offsetWidth) / 2
    const maxLeft = list.scrollWidth - list.clientWidth
    list.scrollTo({
      left: Math.max(0, Math.min(targetLeft, maxLeft)),
      behavior: 'smooth',
    })
  }, [activeId])

  return (
    <nav
      className="sticky top-16 sm:top-20 z-40 bg-white border-b border-gray-100 shadow-sm"
      aria-label="치료 섹션 이동"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul ref={listRef} className="flex overflow-x-auto scrollbar-hide gap-0 pr-4" role="list">
          {items.map((item) => {
            const isActive = activeId === item.id
            return (
              <li key={item.id} className="shrink-0">
                <a
                  ref={(node) => {
                    if (node) {
                      itemRefs.current.set(item.id, node)
                    } else {
                      itemRefs.current.delete(item.id)
                    }
                  }}
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`inline-block px-4 sm:px-5 py-3 text-base font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                    isActive
                      ? 'text-[#0080C8] border-[#0080C8]'
                      : 'text-gray-500 border-transparent hover:text-[#0080C8] hover:border-[#0080C8]/40'
                  }`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
