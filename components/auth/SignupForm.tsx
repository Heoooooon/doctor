'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FormData {
  userId: string
  password: string
  name: string
  phone: string
  birthday: string
  email: string
}

export default function SignupForm() {
  const [form, setForm] = useState<FormData>({
    userId: '',
    password: '',
    name: '',
    phone: '',
    birthday: '',
    email: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.userId.trim() || form.userId.trim().length < 4) {
      setError('아이디는 4자 이상 입력해 주세요.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.userId.trim())) {
      setError('아이디는 영문·숫자·_만 사용 가능합니다.')
      return
    }
    if (form.password.length < 8) {
      setError('비밀번호는 8자 이상 입력해 주세요.')
      return
    }
    if (!form.name.trim()) {
      setError('이름을 입력해 주세요.')
      return
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      setError('올바른 휴대폰번호를 입력해 주세요.')
      return
    }
    if (!form.birthday.trim()) {
      setError('생년월일을 입력해 주세요.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('올바른 이메일 주소를 입력해 주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/member-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId.trim(),
          password: form.password,
          name: form.name.trim(),
          phone: form.phone,
          birthday: form.birthday.trim(),
          email: form.email.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '회원가입에 실패했습니다.')
        return
      }
      setSuccess(true)
    } catch {
      setError('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-12 h-12 bg-[#0080C8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#0080C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">회원가입 완료</h2>
        <p className="text-sm text-gray-500 mb-6">서울이건치과 회원이 되신 것을 환영합니다.</p>
        <Link href="/" className="inline-block bg-[#0080C8] text-white font-semibold text-sm py-3 px-8 rounded-lg hover:bg-[#006EAA] transition-colors">
          홈으로 이동
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5 w-full max-w-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          아이디 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.userId}
          onChange={e => handleChange('userId', e.target.value)}
          placeholder="영문·숫자·_ 4자 이상"
          autoComplete="username"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0080C8] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          비밀번호 <span className="text-red-400">*</span>
        </label>
        <input
          type="password"
          value={form.password}
          onChange={e => handleChange('password', e.target.value)}
          placeholder="8자 이상"
          autoComplete="new-password"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0080C8] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          이름 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="홍길동"
          autoComplete="name"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0080C8] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          휴대폰번호 <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => handleChange('phone', e.target.value)}
          placeholder="010-0000-0000"
          autoComplete="tel"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0080C8] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          생년월일 <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={form.birthday}
          onChange={e => handleChange('birthday', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0080C8] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          이메일 <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={e => handleChange('email', e.target.value)}
          placeholder="hong@naver.com"
          autoComplete="email"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0080C8] transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2.5">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white font-semibold text-sm py-3.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '처리 중...' : '가입하기'}
      </button>
    </form>
  )
}
