'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeAlt?: string
  afterAlt?: string
  beforeScale?: number
  beforeOffsetX?: number
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before',
  afterAlt = 'After',
  beforeScale,
  beforeOffsetX = 0,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(pct)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    updatePosition(e.clientX)
  }, [updatePosition])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    updatePosition(e.clientX)
  }, [updatePosition])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Prevent default drag behavior on images
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const prevent = (e: Event) => e.preventDefault()
    container.addEventListener('dragstart', prevent)
    return () => container.removeEventListener('dragstart', prevent)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl select-none cursor-col-resize"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Before image (bottom layer) */}
      <img
        src={beforeSrc}
        alt={beforeAlt}
        className="block h-auto"
        style={{
          width: beforeOffsetX ? `calc(100% + ${beforeOffsetX}px)` : '100%',
          marginLeft: beforeOffsetX ? `-${beforeOffsetX}px` : undefined,
          transform: beforeScale ? `scale(${beforeScale})` : undefined,
          transformOrigin: 'center center',
        }}
        draggable={false}
      />

      {/* After image (top layer, clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img
          src={afterSrc}
          alt={afterAlt}
          className="block w-full h-auto"
          draggable={false}
        />
      </div>

      {/* BEFORE label */}
      <span className="absolute top-3 left-3 bg-black/50 text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full tracking-wider uppercase pointer-events-none">
        Before
      </span>

      {/* AFTER label */}
      <span className="absolute top-3 right-3 bg-white/70 text-gray-900 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full tracking-wider uppercase pointer-events-none">
        After
      </span>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      />

      {/* Slider handle */}
      <div
        className="absolute top-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-none"
        style={{
          left: `${position}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="8 4 4 12 8 20" />
          <polyline points="16 4 20 12 16 20" />
        </svg>
      </div>
    </div>
  )
}
