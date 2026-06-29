'use client'

import { useEffect, useRef, useState } from 'react'
import { clinicInfo } from '@/data/clinic-info'

declare global {
  interface Window {
    kakao: any
  }
}

interface KakaoMapProps {
  className?: string
  showDirection?: boolean
}

function initMap(container: HTMLDivElement) {
  const { latitude, longitude } = clinicInfo
  const position = new window.kakao.maps.LatLng(latitude, longitude)

  const map = new window.kakao.maps.Map(container, {
    center: position,
    level: 3,
  })

  // 마커
  const marker = new window.kakao.maps.Marker({ position, map })

  // 커스텀 말풍선
  const overlay = new window.kakao.maps.CustomOverlay({
    content: `
      <div style="
        position:relative;
        background:#fff;
        border-radius:12px;
        padding:10px 16px;
        box-shadow:0 4px 12px rgba(0,0,0,0.15);
        font-size:14px;
        font-weight:700;
        color:#333;
        white-space:nowrap;
        border:2px solid #0080C8;
        transform:translateY(-12px);
      ">
        서울이건치과 수원점
        <div style="
          position:absolute;
          bottom:-8px;
          left:50%;
          transform:translateX(-50%);
          width:0;height:0;
          border-left:8px solid transparent;
          border-right:8px solid transparent;
          border-top:8px solid #0080C8;
        "></div>
      </div>
    `,
    position,
    yAnchor: 1.8,
  })
  overlay.setMap(map)

  // 줌 컨트롤
  map.addControl(
    new window.kakao.maps.ZoomControl(),
    window.kakao.maps.ControlPosition.RIGHT
  )

  // 반응형
  const handleResize = () => {
    map.relayout()
    map.setCenter(position)
  }
  window.addEventListener('resize', handleResize)

  return () => window.removeEventListener('resize', handleResize)
}

export default function KakaoMap({ className = '', showDirection = false }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // SDK 로드 대기
  useEffect(() => {
    if (window.kakao?.maps) {
      setReady(true)
      return
    }

    // SDK 스크립트가 아직 로드 중일 수 있으므로 폴링
    const interval = setInterval(() => {
      if (window.kakao?.maps) {
        setReady(true)
        clearInterval(interval)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // 지도 초기화
  useEffect(() => {
    if (!ready || !mapRef.current) return

    let cleanup: (() => void) | undefined

    window.kakao.maps.load(() => {
      if (mapRef.current) {
        cleanup = initMap(mapRef.current)
      }
    })

    return () => cleanup?.()
  }, [ready])

  const directionUrl = `https://map.kakao.com/link/to/서울이건치과 수원점,${clinicInfo.latitude},${clinicInfo.longitude}`

  return (
    <div>
      <div ref={mapRef} className={className} />
      {showDirection && (
        <a
          href={directionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-semibold text-sm py-3.5 rounded-xl transition-colors mt-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2C6.48 2 2 5.58 2 10c0 2.8 1.8 5.27 4.55 6.72L12 22l5.45-5.28C20.2 15.27 22 12.8 22 10c0-4.42-4.48-8-10-8z" fill="#3C1E1E"/>
            <circle cx="12" cy="10" r="3" fill="#FEE500"/>
          </svg>
          카카오맵으로 길찾기
        </a>
      )}
    </div>
  )
}
