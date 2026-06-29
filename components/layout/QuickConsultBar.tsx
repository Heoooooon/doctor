'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { Phone, X, MessageSquareText } from 'lucide-react'

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

  // 모달 상태: render(마운트 여부) / show(진입·이탈 애니메이션 트리거)
  const [render, setRender] = useState(false)
  const [show, setShow] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // 히어로(첫 화면)를 지나 스크롤했을 때만 FAB 노출 → 히어로 카운터와 겹침 방지.
  // 데스크탑 홈은 #home-desktop 내부 스크롤, 그 외/모바일은 window 스크롤.
  useEffect(() => {
    const desktop = document.getElementById('home-desktop')
    const compute = () => {
      const winY = window.scrollY || document.documentElement.scrollTop || 0
      const deskY = desktop ? desktop.scrollTop : 0
      setScrolled(Math.max(winY, deskY) > window.innerHeight * 0.6)
    }
    compute()
    window.addEventListener('scroll', compute, { passive: true })
    desktop?.addEventListener('scroll', compute, { passive: true })
    window.addEventListener('resize', compute)
    return () => {
      window.removeEventListener('scroll', compute)
      desktop?.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
    }
  }, [pathname])

  // 하단 고정바가 사라졌으므로, 바 높이만큼 비워두던 영역을 제거(0px)
  useEffect(() => {
    document.documentElement.style.setProperty('--mobile-bottom-bar-height', '0px')
  }, [])

  const openModal = useCallback(() => {
    setRender(true)
    // 다음 프레임에 show=true → 진입 트랜지션 발동
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
  }, [])

  const closeModal = useCallback(() => {
    setShow(false)
    setErrors({})
    window.setTimeout(() => setRender(false), 260)
  }, [])

  // 모달 열림 동안: 스크롤 잠금 + ESC 닫기 + 첫 필드 포커스
  useEffect(() => {
    if (!render) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 120)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [render, closeModal])

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
      closeModal()
    } catch {
      showToast('error', '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* 토스트 메시지 (최상단 중앙) */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 z-[70] -translate-x-1/2 px-4 py-2.5 rounded-lg text-[15px] font-medium shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      {/* 우측 하단 플로팅 버튼 */}
      <button
        type="button"
        onClick={openModal}
        aria-label="상담 신청 열기"
        aria-haspopup="dialog"
        aria-expanded={render}
        className={`fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[55] flex items-center gap-2 rounded-full bg-[#0080C8] pl-4 pr-5 h-12 sm:h-14 text-white font-semibold shadow-[0_10px_30px_rgba(0,128,200,0.45)] hover:bg-[#0a6fa8] hover:shadow-[0_14px_38px_rgba(0,128,200,0.55)] active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0080C8]/40 focus:ring-offset-2 ${
          scrolled
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <MessageSquareText size={20} aria-hidden="true" />
        <span className="text-[15px] sm:text-[16px] whitespace-nowrap">상담신청</span>
      </button>

      {/* 오버레이 모달 */}
      {render && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="상담 신청"
        >
          {/* 백드롭 */}
          <div
            onClick={closeModal}
            className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${
              show ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />

          {/* 패널 */}
          <div
            className={`relative w-full sm:max-w-md sm:mx-4 bg-gray-900 text-white rounded-t-3xl sm:rounded-2xl border border-white/10 shadow-2xl px-6 pt-6 pb-7 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              show
                ? 'translate-y-0 sm:scale-100 opacity-100'
                : 'translate-y-8 sm:translate-y-4 sm:scale-95 opacity-0'
            }`}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)' }}
          >
            {/* 닫기 */}
            <button
              type="button"
              onClick={closeModal}
              aria-label="닫기"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <p className="text-[#4FC3F7] text-[13px] font-semibold tracking-widest uppercase">
              Consulting
            </p>
            <h2 className="text-[22px] font-bold mt-1 mb-1.5">빠른 상담 신청</h2>
            <p className="text-white/55 text-[14px] mb-5 leading-relaxed">
              이름과 연락처를 남겨주시면 빠른 시일 내에 연락드리겠습니다.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
              {/* 이름 */}
              <div className="flex flex-col gap-1">
                <input
                  ref={firstFieldRef}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="이름"
                  aria-label="이름"
                  aria-invalid={!!errors.name}
                  className={`h-12 w-full px-4 rounded-xl bg-white/10 text-white text-[16px] placeholder-white/40 border outline-none focus:ring-2 focus:ring-[#0080C8] transition ${
                    errors.name ? 'border-red-400' : 'border-white/20 focus:border-[#0080C8]'
                  }`}
                />
                {errors.name && (
                  <span role="alert" className="text-red-400 text-[13px] leading-none">
                    {errors.name}
                  </span>
                )}
              </div>

              {/* 연락처 */}
              <div className="flex flex-col gap-1">
                <input
                  type="tel"
                  value={form.contact}
                  onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
                  placeholder="연락처 (숫자만)"
                  aria-label="연락처"
                  aria-invalid={!!errors.contact}
                  className={`h-12 w-full px-4 rounded-xl bg-white/10 text-white text-[16px] placeholder-white/40 border outline-none focus:ring-2 focus:ring-[#0080C8] transition ${
                    errors.contact ? 'border-red-400' : 'border-white/20 focus:border-[#0080C8]'
                  }`}
                />
                {errors.contact && (
                  <span role="alert" className="text-red-400 text-[13px] leading-none">
                    {errors.contact}
                  </span>
                )}
              </div>

              {/* 개인정보 동의 */}
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={(e) => setForm((p) => ({ ...p, agreed: e.target.checked }))}
                    aria-invalid={!!errors.agreed}
                    className="w-4 h-4 accent-[#0080C8] cursor-pointer"
                  />
                  <span className="text-[14px] text-white/65 group-hover:text-white/85 transition-colors">
                    개인정보 수집 동의
                  </span>
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[13px] text-white/40 hover:text-[#4FC3F7] underline underline-offset-2 transition-colors"
                  >
                    보기
                  </a>
                </label>
                {errors.agreed && (
                  <span role="alert" className="text-red-400 text-[13px] leading-none">
                    {errors.agreed}
                  </span>
                )}
              </div>

              {/* 상담예약 버튼 */}
              <button
                type="submit"
                disabled={submitting}
                className="h-12 mt-1 rounded-xl bg-[#0080C8] text-white text-[16px] font-semibold hover:bg-[#0a6fa8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#0080C8] focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {submitting ? '신청 중...' : '상담 신청하기'}
              </button>

              {/* 전화 상담 */}
              <a
                href="tel:031-896-5512"
                className="h-12 rounded-xl bg-white/10 text-white text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-white/15 transition-colors"
                aria-label="전화로 빠른 상담하기 031-896-5512"
              >
                <Phone size={16} aria-hidden="true" />
                전화 상담 031-896-5512
              </a>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
