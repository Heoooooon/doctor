'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  hasIntroEnded,
  isPopupHiddenToday,
  markIntroEnded,
  markPopupHiddenToday,
  markPopupShownThisPageLoad,
  startPopupPrefetch,
  wasPopupShownThisPageLoad,
  type SlidePopupItem,
} from '@/lib/slide-popup-prefetch'

export default function SlidePopup() {
  const [slides, setSlides] = useState<SlidePopupItem[]>([])
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const slidesRef = useRef<SlidePopupItem[]>([])
  const readyRef = useRef(false)
  const openedRef = useRef(false)
  const indexRef = useRef(0)

  const openIfReady = useCallback(() => {
    if (openedRef.current || wasPopupShownThisPageLoad()) return
    if (!hasIntroEnded()) return
    if (!readyRef.current) return
    if (slidesRef.current.length === 0) return
    if (isPopupHiddenToday()) return

    openedRef.current = true
    markPopupShownThisPageLoad()
    setSlides(slidesRef.current)
    indexRef.current = 0
    setIndex(0)
    setOpen(true)
  }, [])

  useEffect(() => {
    let alive = true

    startPopupPrefetch().then((active) => {
      if (!alive) return
      slidesRef.current = active
      readyRef.current = true
      openIfReady()
    })

    if (hasIntroEnded()) {
      openIfReady()
    }

    const onIntroEnd = () => {
      markIntroEnded()
      openIfReady()
      void startPopupPrefetch().then((active) => {
        if (!alive) return
        slidesRef.current = active
        readyRef.current = true
        openIfReady()
      })
    }

    window.addEventListener('egun:intro-end', onIntroEnd)
    return () => {
      alive = false
      window.removeEventListener('egun:intro-end', onIntroEnd)
    }
  }, [openIfReady])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const hideTodayAndClose = useCallback(() => {
    markPopupHiddenToday()
    setOpen(false)
  }, [])

  const goTo = useCallback((next: number) => {
    const len = slidesRef.current.length
    if (len === 0) return
    const clamped = Math.max(0, Math.min(len - 1, next))
    if (clamped === indexRef.current) return
    indexRef.current = clamped
    setIndex(clamped)
  }, [])

  const goPrev = useCallback(() => {
    goTo(indexRef.current - 1)
  }, [goTo])

  const goNext = useCallback(() => {
    goTo(indexRef.current + 1)
  }, [goTo])

  useEffect(() => {
    if (!open) return

    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close, goPrev, goNext])

  if (!open || slides.length === 0) return null

  const hasMultiple = slides.length > 1
  const atStart = index === 0
  const atEnd = index === slides.length - 1

  return (
    <div
      className="slide-popup-overlay fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="안내 팝업"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="팝업 닫기"
        onClick={close}
      />

      {/*
        고정 폭 컨테이너 + 가로 트랙 translate
        → 이미지 remount/opacity:0 없음 → 장 넘김 깜빡임 제거
      */}
      <div className="relative z-10 mx-auto w-full max-w-[min(94vw,480px)] md:max-w-[min(90vw,560px)] animate-slide-popup-in">
        <div
          className="overflow-hidden bg-white shadow-2xl"
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0]?.clientX ?? null
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current == null || !hasMultiple) return
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current
            touchStartX.current = null
            if (Math.abs(dx) < 40) return
            if (dx > 0) goPrev()
            else goNext()
          }}
        >
          <div className="relative leading-none overflow-hidden">
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/50 transition-colors"
              aria-label="닫기"
            >
              <X size={18} strokeWidth={2.25} />
            </button>

            <div
              className="slide-popup-track flex will-change-transform"
              style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
            >
              {slides.map((slide) => {
                const img = (
                  <img
                    src={slide.image_url}
                    alt={slide.title || '팝업 이미지'}
                    className="block w-full h-auto max-h-[min(68vh,740px)] md:max-h-[min(72vh,820px)] object-contain object-top bg-white"
                    draggable={false}
                  />
                )

                return (
                  <div
                    key={slide.id}
                    className="w-full min-w-full shrink-0 grow-0 basis-full"
                  >
                    {slide.link_url ? (
                      <a
                        href={slide.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block leading-none"
                      >
                        {img}
                      </a>
                    ) : (
                      img
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/*
            1) 슬라이드 네비 (여러 장일 때)
            2) 하단 2분할 버튼 — 참고: 「다시 보지 않기 | 닫기」
          */}
          <div className="bg-[#2B2D42]">
            {hasMultiple && (
              <div className="flex items-center justify-center gap-2 px-3 pt-3 pb-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={atStart}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-[#0080C8]/45 bg-[#0080C8] text-white shadow-sm hover:bg-[#006aaa] transition-colors disabled:opacity-35 disabled:pointer-events-none"
                  aria-label="이전 슬라이드"
                >
                  <ChevronLeft size={18} />
                </button>

                <div
                  className="flex items-center gap-1.5"
                  role="tablist"
                  aria-label="슬라이드"
                >
                  {slides.map((slide, i) => (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      onClick={() => goTo(i)}
                      aria-label={`${i + 1} / ${slides.length}`}
                      className={`rounded-full transition-all ${
                        i === index
                          ? 'h-2 w-2 bg-white'
                          : 'h-2 w-2 bg-white/35 hover:bg-white/55'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={atEnd}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-[#0080C8]/45 bg-[#0080C8] text-white shadow-sm hover:bg-[#006aaa] transition-colors disabled:opacity-35 disabled:pointer-events-none"
                  aria-label="다음 슬라이드"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div className="flex border-t border-white/10">
              <button
                type="button"
                onClick={hideTodayAndClose}
                className="flex-1 px-2 py-3.5 text-center text-xs sm:text-sm font-medium text-white/90 hover:bg-white/10 active:bg-white/15 transition-colors"
              >
                오늘 하루 보지 않기
              </button>
              <div className="w-px self-stretch bg-white/15" aria-hidden="true" />
              <button
                type="button"
                onClick={close}
                className="flex-1 px-2 py-3.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-white/10 active:bg-white/15 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
