'use client'

import { useEffect, useRef } from 'react'

const CHAPTER_IDS = [
  'philosophy',
  'doctor-intro',
  'doctors',
  'lee-jaesung',
  'jung-chaeyun',
  'yoo-suhyun',
  'park-jiwon',
  'baek-seola',
  'schedule',
  'interior',
  'interior-annex',
  'lab',
  'lab-facilities',
  'access',
]

const HEADER_OFFSET = 144
const SNAP_PROGRESS = 0.5
const SNAP_LOCK_MS = 1000

export default function AboutChapterSnap() {
  const lastYRef = useRef(0)
  const lockedUntilRef = useRef(0)
  const touchStartYRef = useRef<number | null>(null)

  useEffect(() => {
    lastYRef.current = window.scrollY

    const getTop = (el: HTMLElement) =>
      el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET

    const getChapters = () =>
      CHAPTER_IDS.map((id) => document.getElementById(id)).filter(
        (el): el is HTMLElement => el !== null,
      )

    const snapToSection = (el: HTMLElement) => {
      const top = Math.max(getTop(el), 0)
      lockedUntilRef.current = Date.now() + SNAP_LOCK_MS
      lastYRef.current = top
      window.scrollTo({
        top,
        behavior: 'auto',
      })
    }

    const findCurrentChapter = (currentY: number) => {
      const chapters = getChapters()

      for (let index = 0; index < chapters.length - 1; index += 1) {
        const chapter = chapters[index]
        const nextChapter = chapters[index + 1]
        const chapterTop = getTop(chapter)
        const nextChapterTop = getTop(nextChapter)
        const chapterHeight = nextChapterTop - chapterTop

        if (chapterHeight <= 0 || currentY < chapterTop || currentY >= nextChapterTop) {
          continue
        }

        return { chapterTop, chapterHeight, nextChapter }
      }

      return null
    }

    const handleWheel = (event: WheelEvent) => {
      const now = Date.now()

      if (event.deltaY <= 0 || now < lockedUntilRef.current) {
        return
      }

      const currentY = window.scrollY
      const current = findCurrentChapter(currentY)

      if (!current) {
        return
      }

      const projectedProgress =
        (currentY + event.deltaY - current.chapterTop) / current.chapterHeight

      if (projectedProgress >= SNAP_PROGRESS) {
        event.preventDefault()
        snapToSection(current.nextChapter)
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null
    }

    const handleTouchMove = (event: TouchEvent) => {
      const now = Date.now()
      const touchStartY = touchStartYRef.current
      const currentTouchY = event.touches[0]?.clientY

      if (
        touchStartY === null ||
        currentTouchY === undefined ||
        now < lockedUntilRef.current
      ) {
        return
      }

      const deltaY = touchStartY - currentTouchY

      if (deltaY <= 0) {
        return
      }

      const currentY = window.scrollY
      const current = findCurrentChapter(currentY)

      if (!current) {
        return
      }

      const projectedProgress =
        (currentY + deltaY - current.chapterTop) / current.chapterHeight

      if (projectedProgress >= SNAP_PROGRESS) {
        event.preventDefault()
        touchStartYRef.current = null
        snapToSection(current.nextChapter)
      }
    }

    const handleScroll = () => {
      const now = Date.now()
      const currentY = window.scrollY
      const isScrollingDown = currentY > lastYRef.current
      lastYRef.current = currentY

      if (!isScrollingDown || now < lockedUntilRef.current) {
        return
      }

      const current = findCurrentChapter(currentY)

      if (!current) {
        return
      }

      const progress = (currentY - current.chapterTop) / current.chapterHeight

      if (progress >= SNAP_PROGRESS) {
        snapToSection(current.nextChapter)
      }
    }

    const handleAnchorScroll = () => {
      lockedUntilRef.current = Date.now() + 3000
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('about-anchor-scroll', handleAnchorScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('about-anchor-scroll', handleAnchorScroll)
    }
  }, [])

  return null
}
