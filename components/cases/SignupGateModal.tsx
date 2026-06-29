'use client'

import { useState, useEffect } from 'react'
import { X, Lock } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: (name: string) => void
}

type Mode = 'signup' | 'login'

interface SignupForm {
  userId: string
  password: string
  name: string
  phone: string
  birthday: string
  email: string
}

interface LoginForm {
  userId: string
  password: string
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  if (!match) return null
  // 이중 인코딩된 레거시 쿠키도 정상 처리: %가 사라질 때까지 디코딩
  let value = match[2]
  try {
    while (/%[0-9A-Fa-f]{2}/.test(value)) {
      const decoded = decodeURIComponent(value)
      if (decoded === value) break
      value = decoded
    }
  } catch {
    // 디코딩 실패 시 원본 유지
  }
  return value
}

export function checkMemberSession(): string | null {
  return getCookie('member_name')
}

export default function SignupGateModal({ onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('signup')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const [signup, setSignup] = useState<SignupForm>({
    userId: '', password: '', name: '', phone: '', birthday: '', email: '',
  })
  const [login, setLogin] = useState<LoginForm>({ userId: '', password: '' })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function setS(field: keyof SignupForm, value: string) {
    setSignup(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function formatPhone(value: string) {
    const d = value.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (signup.userId.trim().length < 4) return setError('아이디는 4자 이상 입력해 주세요.')
    if (!/^[a-zA-Z0-9_]+$/.test(signup.userId.trim())) return setError('아이디는 영문·숫자·_ 만 사용할 수 있습니다.')
    if (signup.password.length < 8) return setError('비밀번호는 8자 이상 입력해 주세요.')
    if (!signup.name.trim()) return setError('이름을 입력해 주세요.')
    if (signup.phone.replace(/\D/g, '').length < 10) return setError('올바른 휴대폰번호를 입력해 주세요.')
    if (!signup.birthday) return setError('생년월일을 입력해 주세요.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signup.email.trim())) return setError('올바른 이메일을 입력해 주세요.')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/member-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: signup.userId.trim(),
          password: signup.password,
          name: signup.name.trim(),
          phone: signup.phone.replace(/\D/g, ''),
          birthday: signup.birthday,
          email: signup.email.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || '회원가입에 실패했습니다.')

      // 가입 직후 자동 로그인
      await doLogin(signup.userId.trim(), signup.password, signup.name.trim())
    } catch {
      setError('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!login.userId.trim()) return setError('아이디를 입력해 주세요.')
    if (!login.password) return setError('비밀번호를 입력해 주세요.')

    setLoading(true)
    try {
      await doLogin(login.userId.trim(), login.password)
    } catch {
      setError('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  async function doLogin(userId: string, password: string, fallbackName?: string) {
    const res = await fetch('/api/auth/member-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || '로그인에 실패했습니다.')
      return
    }
    const name = data.name || fallbackName || userId
    setDone(true)
    setTimeout(() => onSuccess(name), 1200)
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0080C8] transition-colors'
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="닫기">
          <X size={20} />
        </button>

        {done ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-[#0080C8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#0080C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-900 mb-1">
              {mode === 'signup' ? '가입 완료!' : '로그인 성공!'}
            </p>
            <p className="text-sm text-gray-500">치료 사례를 확인하실 수 있습니다.</p>
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-5 h-5 text-[#0080C8] shrink-0" />
              <div>
                <h2 className="text-base font-bold text-gray-900">치료 사례 전체 보기</h2>
                <p className="text-[12px] text-gray-500">회원 전용 — 치료 후 사진 확인 가능</p>
              </div>
            </div>

            {/* 탭 */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-5">
              {(['signup', 'login'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                    mode === m ? 'bg-white text-[#0080C8] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'signup' ? '회원가입' : '로그인'}
                </button>
              ))}
            </div>

            {/* 회원가입 폼 */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <label className={labelCls}>아이디 <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={signup.userId}
                    onChange={e => setS('userId', e.target.value.replace(/\s/g, ''))}
                    placeholder="영문·숫자·_ 4자 이상"
                    autoComplete="username"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>비밀번호 <span className="text-red-400">*</span></label>
                  <input
                    type="password"
                    value={signup.password}
                    onChange={e => setS('password', e.target.value)}
                    placeholder="8자 이상"
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>이름 <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={signup.name}
                    onChange={e => setS('name', e.target.value)}
                    placeholder="홍길동"
                    autoComplete="name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>휴대폰번호 <span className="text-red-400">*</span></label>
                  <input
                    type="tel"
                    value={signup.phone}
                    onChange={e => setS('phone', formatPhone(e.target.value))}
                    placeholder="010-0000-0000"
                    autoComplete="tel"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>생년월일 <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={signup.birthday}
                    onChange={e => setS('birthday', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>이메일 <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    value={signup.email}
                    onChange={e => setS('email', e.target.value)}
                    placeholder="example@naver.com"
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>

                {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  가입 시 <a href="/privacy" target="_blank" className="underline hover:text-[#0080C8]">개인정보처리방침</a>에 동의하는 것으로 간주합니다.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0080C8] text-white font-semibold text-sm py-3 rounded-lg hover:bg-[#006BA8] transition-colors disabled:opacity-50"
                >
                  {loading ? '처리 중...' : '가입하고 사진 보기'}
                </button>
              </form>
            )}

            {/* 로그인 폼 */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className={labelCls}>아이디 <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={login.userId}
                    onChange={e => { setLogin(p => ({ ...p, userId: e.target.value })); setError('') }}
                    placeholder="아이디 입력"
                    autoComplete="username"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>비밀번호 <span className="text-red-400">*</span></label>
                  <input
                    type="password"
                    value={login.password}
                    onChange={e => { setLogin(p => ({ ...p, password: e.target.value })); setError('') }}
                    placeholder="비밀번호 입력"
                    autoComplete="current-password"
                    className={inputCls}
                  />
                </div>

                {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0080C8] text-white font-semibold text-sm py-3 rounded-lg hover:bg-[#006BA8] transition-colors disabled:opacity-50"
                >
                  {loading ? '확인 중...' : '로그인'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  아직 회원이 아니신가요?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError('') }} className="text-[#0080C8] font-semibold hover:underline">
                    회원가입
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
