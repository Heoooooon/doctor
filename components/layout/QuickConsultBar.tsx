'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Phone } from 'lucide-react'

interface FormState {
  name: string
  contact: string
  agreed: boolean
}

interface FormErrors {
  name?: string
  contact?: string
  agreed?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (form.name.trim().length < 2) {
    errors.name = '이름은 2자 이상 입력해주세요.'
  }
  if (!form.contact.trim()) {
    errors.contact = '연락처를 입력해주세요.'
  }
  if (!form.agreed) {
    errors.agreed = '개인정보 수집에 동의해주세요.'
  }
  return errors
}

export default function QuickConsultBar() {
  const [form, setForm] = useState<FormState>({ name: '', contact: '', agreed: false })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // 실제 렌더 높이(safe-area 포함)를 CSS 변수에 반영 → 이미지/버튼이 정확히 바 위로 정렬
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const apply = () => {
      document.documentElement.style.setProperty(
        '--mobile-bottom-bar-height',
        `${Math.round(el.getBoundingClientRect().height)}px`,
      )
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }, [])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const newErrors = validate(form)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.contact.trim(),
          privacy_agreed: form.agreed,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        showToast('error', data.error || '신청에 실패했습니다.')
        return
      }

      showToast('success', '상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.')
      setForm({ name: '', contact: '', agreed: false })
      setErrors({})
    } catch {
      showToast('error', '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="complementary"
      aria-label="빠른 상담 신청"
    >
      {/* 토스트 메시지 */}
      {toast && (
        <div
          className={`absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-[18px] font-medium shadow-lg transition-all animate-[fadeIn_0.2s_ease-out] ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 데스크톱: 풀 폼 */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="hidden sm:flex items-center gap-3 py-3"
        >
          {/* 이름 */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="이름"
              aria-label="이름"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'err-name' : undefined}
              className={`h-11 w-36 px-3 rounded bg-white/10 text-white text-[18px] placeholder-white/40 border outline-none focus:ring-2 focus:ring-[#0080C8] transition ${
                errors.name ? 'border-red-400' : 'border-white/20 focus:border-[#0080C8]'
              }`}
            />
            {errors.name && (
              <span id="err-name" role="alert" className="text-red-400 text-[18px] leading-none">
                {errors.name}
              </span>
            )}
          </div>

          {/* 연락처 */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <input
              type="tel"
              value={form.contact}
              onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
              placeholder="연락처 (숫자만)"
              aria-label="연락처"
              aria-invalid={!!errors.contact}
              aria-describedby={errors.contact ? 'err-contact' : undefined}
              className={`h-11 w-48 px-3 rounded bg-white/10 text-white text-[18px] placeholder-white/40 border outline-none focus:ring-2 focus:ring-[#0080C8] transition ${
                errors.contact ? 'border-red-400' : 'border-white/20 focus:border-[#0080C8]'
              }`}
            />
            {errors.contact && (
              <span id="err-contact" role="alert" className="text-red-400 text-[18px] leading-none">
                {errors.contact}
              </span>
            )}
          </div>

          {/* 개인정보 동의 */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => setForm((p) => ({ ...p, agreed: e.target.checked }))}
                aria-invalid={!!errors.agreed}
                aria-describedby={errors.agreed ? 'err-agreed' : undefined}
                className="w-4 h-4 accent-[#0080C8] cursor-pointer"
              />
              <span className="text-[18px] text-white/60 group-hover:text-white/80 transition-colors whitespace-nowrap">
                개인정보 수집 동의
              </span>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[13px] text-white/40 hover:text-[#0080C8] underline underline-offset-2 transition-colors whitespace-nowrap"
              >
                보기
              </a>
            </label>
            {errors.agreed && (
              <span id="err-agreed" role="alert" className="text-red-400 text-[18px] leading-none">
                {errors.agreed}
              </span>
            )}
          </div>

          {/* 상담예약 버튼 */}
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-5 rounded bg-[#0080C8] text-white text-[18px] font-semibold whitespace-nowrap hover:bg-[#2B2D42] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#0080C8] focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {submitting ? '신청 중...' : '상담예약'}
          </button>

          {/* 구분선 */}
          <div className="h-7 w-px bg-white/20 mx-1 flex-shrink-0" aria-hidden="true" />

          {/* 빠른상담 (전화) */}
          <a
            href="tel:031-896-5512"
            className="h-11 px-4 rounded bg-white/10 text-white text-[18px] font-medium whitespace-nowrap hover:bg-[#0080C8] flex items-center gap-2 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="전화로 빠른 상담하기 031-896-5512"
          >
            <Phone size={14} aria-hidden="true" />
            빠른상담
          </a>

          {/* 우측 안내 텍스트 */}
          <p className="ml-auto text-[18px] text-white/30 hidden 2xl:block whitespace-nowrap">
            평일 09:30 ~ 18:30 &nbsp;|&nbsp; 화·금 09:30 ~ 20:30 &nbsp;|&nbsp; 토 09:30 ~ 13:30
          </p>
        </form>

        {/* 모바일: 간소화 레이아웃 */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex sm:hidden items-center gap-2 py-2"
        >
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="이름"
            aria-label="이름"
            className="h-11 flex-1 min-w-0 px-3 rounded bg-white/10 text-white text-[18px] placeholder-white/40 border border-white/20 outline-none focus:border-[#0080C8] transition"
          />
          <input
            type="tel"
            value={form.contact}
            onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
            placeholder="연락처"
            aria-label="연락처"
            className="h-11 flex-1 min-w-0 px-3 rounded bg-white/10 text-white text-[18px] placeholder-white/40 border border-white/20 outline-none focus:border-[#0080C8] transition"
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-3 rounded bg-[#0080C8] text-white text-[18px] font-semibold whitespace-nowrap hover:bg-[#2B2D42] disabled:opacity-60 transition-colors flex-shrink-0"
          >
            예약
          </button>
          <a
            href="tel:031-896-5512"
            className="h-10 w-10 rounded bg-white/10 text-white flex items-center justify-center hover:bg-[#0080C8] transition-colors flex-shrink-0"
            aria-label="전화 상담"
          >
            <Phone size={16} aria-hidden="true" />
          </a>
        </form>
      </div>
    </div>
  )
}
