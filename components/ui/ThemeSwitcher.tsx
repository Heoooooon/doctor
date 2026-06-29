'use client'

import { useEffect, useState } from 'react'

const THEMES = [
  {
    id: 'light',
    label: '클린',
    colors: ['#F8F7F9', '#2B2D42', '#0080C8', '#006EAA'],
  },
  {
    id: 'teal',
    label: '블루',
    colors: ['#F8F7F9', '#2B2D42', '#0080C8', '#006EAA'],
  },
  {
    id: 'navy',
    label: '딥',
    colors: ['#2B2D42', '#1a1c2e', '#0080C8', '#006EAA'],
  },
  {
    id: 'blue',
    label: '블루',
    colors: ['#F8F7F9', '#0080C8', '#2B2D42', '#006EAA'],
  },
] as const

type ThemeId = (typeof THEMES)[number]['id']

export default function ThemeSwitcher() {
  const [active, setActive] = useState<ThemeId>('light')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('egun-theme') as ThemeId) || 'light'
    setActive(saved)
    applyTheme(saved)
  }, [])

  function applyTheme(id: ThemeId) {
    const root = document.documentElement
    if (id === 'light') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', id)
    }
    localStorage.setItem('egun-theme', id)
    setActive(id)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* 테마 패널 */}
      {open && (
        <div
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-4 flex flex-col gap-2"
          style={{ minWidth: 160 }}
        >
          <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-1 text-center">
            색상 테마
          </p>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => applyTheme(theme.id)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-gray-50 group"
              style={{
                background: active === theme.id ? '#f0f9ff' : undefined,
                outline: active === theme.id ? '2px solid #0080C8' : '2px solid transparent',
              }}
            >
              {/* 4색 도트 */}
              <div className="flex gap-0.5">
                {theme.colors.map((c, i) => (
                  <span
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: c,
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  />
                ))}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: active === theme.id ? '#0080C8' : '#374151' }}
              >
                {theme.label}
              </span>
              {active === theme.id && (
                <span className="ml-auto text-[10px] text-blue-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 토글 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95"
        style={{ backgroundColor: 'var(--e-primary)' }}
        title="색상 테마 선택"
      >
        <div className="grid grid-cols-2 gap-0.5">
          {(['#0080C8', '#F8F7F9', '#2B2D42', '#006EAA'] as const).map((c, i) => (
            <span
              key={i}
              className="rounded-sm"
              style={{ width: 7, height: 7, backgroundColor: c }}
            />
          ))}
        </div>
      </button>
    </div>
  )
}
