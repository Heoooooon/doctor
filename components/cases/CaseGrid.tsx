'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import SignupGateModal from './SignupGateModal'

export interface CaseItem {
  id: number
  category: string
  title: string
  beforeSrc: string
  afterSrc: string
  beforeAlt: string
  afterAlt: string
}

interface Props {
  cases: CaseItem[]
}

export default function CaseGrid({ cases }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  function handleAfterClick() {
    if (!isLoggedIn) setShowModal(true)
  }

  function handleSuccess() {
    setShowModal(false)
    setIsLoggedIn(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((item) => (
          <article key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            {/* 카테고리 */}
            <div className="px-4 pt-4 pb-2">
              <span className="inline-block text-[11px] font-semibold text-[#0080C8] bg-[#EAF4FC] rounded-full px-2.5 py-0.5">
                {item.category}
              </span>
              <p className="text-sm font-semibold text-gray-800 mt-1.5">{item.title}</p>
            </div>

            {/* Before / After 이미지 */}
            <div className="grid grid-cols-2 gap-1 px-4 pb-4">
              {/* Before */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Before</p>
                <div className="rounded-xl overflow-hidden aspect-square bg-gray-50">
                  <img
                    src={item.beforeSrc}
                    alt={item.beforeAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* After */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">After</p>
                <div
                  className="rounded-xl overflow-hidden aspect-square bg-gray-50 relative cursor-pointer group"
                  onClick={handleAfterClick}
                  role={isLoggedIn ? undefined : 'button'}
                  aria-label={isLoggedIn ? undefined : '회원가입 후 확인 가능'}
                >
                  <img
                    src={item.afterSrc}
                    alt={item.afterAlt}
                    className={`w-full h-full object-cover transition-all duration-300 ${isLoggedIn ? '' : 'blur-md scale-105'}`}
                  />
                  {!isLoggedIn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <Lock className="w-5 h-5 text-white mb-1" />
                      <span className="text-[11px] font-semibold text-white leading-tight text-center px-2">
                        회원 전용
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 하단 가입 유도 (비로그인 상태) */}
      {!isLoggedIn && (
        <div
          className="mt-10 flex flex-col items-center gap-3 py-8 rounded-2xl bg-[#F0F7FD] border border-[#D0E8F5] cursor-pointer hover:bg-[#E6F2FB] transition-colors"
          onClick={() => setShowModal(true)}
        >
          <Lock className="w-6 h-6 text-[#0080C8]" />
          <p className="text-sm font-semibold text-gray-800">치료 후 사진은 회원 전용입니다</p>
          <p className="text-xs text-gray-500">간단한 회원가입 후 모든 사례를 확인하세요</p>
          <button className="bg-[#0080C8] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#006BA8] transition-colors">
            무료 회원가입
          </button>
        </div>
      )}

      {showModal && (
        <SignupGateModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
