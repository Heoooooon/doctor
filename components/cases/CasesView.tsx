'use client'

import { useState, useEffect, useRef } from 'react'
import { Lock, ChevronRight, Pointer } from 'lucide-react'
import SignupGateModal, { checkMemberSession } from '@/components/cases/SignupGateModal'
import type { PatientCase } from '@/lib/patient-cases'

/* ── 카테고리 데이터 (전체보기 = 기본) ─────────────────────── */
const MAIN_CATEGORIES = [
  { key: '전체', label: '전체보기', subs: ['전체'] },
  { key: '자연치아살리기', label: '자연치아살리기', subs: ['전체', 'VPT', '레진빌드업', '신경치료', '최소삭제 온레이', '잇몸치료'] },
  { key: '임플란트', label: '임플란트', subs: ['전체', '즉시로딩 임플란트', '전체 임플란트', '앞니 임플란트'] },
  { key: '심미보철', label: '심미보철', subs: ['전체', '라미네이트', '앞니레진(diastema)', '치아미백'] },
  { key: '치아교정', label: '치아교정', subs: ['전체', '인비절라인', '소아교정'] },
]

export default function CasesView({ cases }: { cases: PatientCase[] }) {
  const [mainCat, setMainCat] = useState('전체')
  const [subCat, setSubCat] = useState('전체')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [showModal, setShowModal] = useState(false)
  const subScrollRef = useRef<HTMLDivElement>(null)

  const activeCatData = MAIN_CATEGORIES.find((c) => c.key === mainCat)!

  useEffect(() => {
    const name = checkMemberSession()
    if (name) { setIsLoggedIn(true); setMemberName(name) }
  }, [])

  const handleLogout = () => {
    ;['member_token', 'member_id', 'member_name'].forEach((c) => {
      document.cookie = `${c}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })
    setIsLoggedIn(false)
    setMemberName('')
  }

  useEffect(() => {
    setSubCat('전체')
    subScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }, [mainCat])

  const filtered = cases.filter((c) => {
    if (mainCat !== '전체' && c.board_category !== mainCat) return false
    if (subCat === '전체') return true
    return c.treatment_type === subCat
  })

  return (
    <main className="pt-20 pb-24 bg-[#F8F7F9] min-h-screen">
      {/* ── 페이지 헤더 ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#0080C8] mb-2">Patient Cases</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2B2D42] mb-2">환자사례</h1>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              실제 내원 환자분의 치료 전·후 사례입니다.<br className="hidden sm:block" />
              치료 결과는 개인의 구강 상태에 따라 달라질 수 있습니다.
            </p>
          </div>
          {isLoggedIn ? (
            <div className="shrink-0 flex items-center gap-3 pb-1">
              <div className="text-right">
                <p className="text-[11px] text-gray-400 mb-0.5">로그인 중</p>
                <p className="text-sm font-semibold text-[#0080C8]">{memberName} 님</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 text-sm font-semibold text-[#0080C8] border border-[#0080C8] rounded-lg px-5 py-2.5 hover:bg-[#EAF4FC] transition-colors"
            >
              로그인 / 가입
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── 대분류 탭 ── */}
        <div className="flex overflow-x-auto border-b border-gray-200 bg-white -mx-4 sm:-mx-6 px-4 sm:px-6 mb-0 scrollbar-hide">
          {MAIN_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setMainCat(cat.key)}
              className={`relative py-4 px-3 sm:px-5 text-sm sm:text-[15px] font-semibold whitespace-nowrap transition-colors ${
                mainCat === cat.key ? 'text-[#0080C8]' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {cat.label}
              {mainCat === cat.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0080C8] rounded-t" />}
            </button>
          ))}
        </div>

        {/* ── 소분류 (전체보기에서는 숨김) ── */}
        {activeCatData.subs.length > 1 && (
          <div
            ref={subScrollRef}
            className="flex gap-2 overflow-x-auto py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-white border-b border-gray-100 scrollbar-hide"
          >
            {activeCatData.subs.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubCat(sub)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  subCat === sub
                    ? 'bg-[#2B2D42] text-white border-[#2B2D42]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#2B2D42] hover:text-[#2B2D42]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* ── 카드 수 표시 ── */}
        <div className="flex items-center justify-between py-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{filtered.length}</span>개의 사례
          </p>
          {!isLoggedIn && (
            <p className="text-xs text-gray-400">
              <Lock className="w-3 h-3 inline mr-1" />
              치료 전 사진은 로그인 후 확인 가능합니다
            </p>
          )}
        </div>

        {/* ── 카드 그리드 ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">등록된 사례가 없습니다</p>
            <p className="text-sm text-gray-400">해당 카테고리의 사례를 준비 중입니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <CaseCard key={item.id} item={item} isLoggedIn={isLoggedIn} onLockClick={() => setShowModal(true)} />
            ))}
          </div>
        )}

        {/* ── 비로그인 하단 배너 ── */}
        {!isLoggedIn && filtered.length > 0 && (
          <div
            className="mt-12 rounded-2xl border border-[#D0E8F5] bg-white px-6 py-8 text-center cursor-pointer hover:bg-[#F0F7FD] transition-colors"
            onClick={() => setShowModal(true)}
          >
            <div className="w-12 h-12 bg-[#EAF4FC] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5 text-[#0080C8]" />
            </div>
            <p className="font-semibold text-gray-800 mb-1">치료 전 사진은 회원 전용입니다</p>
            <p className="text-sm text-gray-500 mb-5">간단한 가입 후 모든 치료 전·후 사례를 확인하실 수 있습니다.</p>
            <button className="bg-[#0080C8] text-white font-semibold text-sm px-8 py-3 rounded-lg hover:bg-[#006BA8] transition-colors">
              무료 회원가입
            </button>
          </div>
        )}

        <p className="mt-12 text-[11px] text-gray-400 text-center leading-relaxed">
          본 사례는 해당 환자분의 동의를 받아 게시된 자료입니다.<br />
          치료 방법과 결과는 개인의 구강 상태에 따라 달라질 수 있으며, 정확한 진단은 내원 후 결정됩니다.
        </p>
      </div>

      {showModal && (
        <SignupGateModal
          onClose={() => setShowModal(false)}
          onSuccess={(name) => { setShowModal(false); setIsLoggedIn(true); setMemberName(name) }}
        />
      )}
    </main>
  )
}

/* ── 케이스 카드 ── */
function CaseCard({
  item,
  isLoggedIn,
  onLockClick,
}: {
  item: PatientCase
  isLoggedIn: boolean
  onLockClick: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const descRef = useRef<HTMLParagraphElement>(null)

  // 설명이 2줄을 넘어 잘릴 때만 '더 보기' 노출
  useEffect(() => {
    const el = descRef.current
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1)
  }, [item.description])

  // 웹(데스크탑)에서만 라이트박스 오픈 — 모바일은 동작하지 않음
  const openLightbox = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches) {
      setLightbox(true)
    }
  }

  // 라이트박스: ESC 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox])

  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Before / After — 웹: 좌우 / 모바일: 상하, 고정 높이로 템플릿화 (object-cover) */}
      <div className="flex flex-col sm:flex-row gap-px bg-gray-100">
        {/* Before — 비로그인 시 블러 + 손가락 아이콘 */}
        <div
          className="relative sm:w-1/2 overflow-hidden bg-gray-50 cursor-pointer"
          onClick={() => { if (!isLoggedIn) { onLockClick(); return } openLightbox() }}
        >
          {item.before_image_url ? (
            <img
              src={item.before_image_url}
              alt="치료 전"
              className={`w-full h-52 sm:h-64 object-cover block transition duration-500 ${isLoggedIn ? '' : 'blur-2xl scale-110'}`}
            />
          ) : (
            <div className="w-full h-52 sm:h-64 flex items-center justify-center"><span className="text-xs text-gray-300">준비 중</span></div>
          )}
          <span className="absolute top-2.5 left-2.5 bg-black/55 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide z-10">BEFORE</span>
          {!isLoggedIn && item.before_image_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/85 backdrop-blur-sm rounded-full p-4 shadow-lg animate-pulse">
                <Pointer className="w-7 h-7 text-[#0080C8]" />
              </div>
            </div>
          )}
        </div>

        {/* After — 원본 공개 */}
        <div className="relative sm:w-1/2 overflow-hidden bg-gray-50 sm:cursor-pointer" onClick={openLightbox}>
          {item.after_image_url ? (
            <img src={item.after_image_url} alt="치료 후" className="w-full h-52 sm:h-64 object-cover block" />
          ) : (
            <div className="w-full h-52 sm:h-64 flex items-center justify-center"><span className="text-xs text-gray-300">준비 중</span></div>
          )}
          <span className="absolute top-2.5 left-2.5 bg-[#0080C8]/85 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide z-10">AFTER</span>
        </div>
      </div>

      {/* 카드 정보 */}
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[12px] font-semibold text-[#0080C8]">{item.board_category}</span>
          {item.treatment_type && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
              <span className="text-[12px] text-gray-500 font-medium">{item.treatment_type}</span>
            </>
          )}
        </div>
        <p className="text-[17px] font-bold text-[#2B2D42] leading-snug mb-2.5">{item.title}</p>
        <div className="flex items-center gap-3 text-[12px] text-gray-400">
          {item.treatment_period && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {item.treatment_period}
            </span>
          )}
          {item.patient_info && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {item.patient_info}
            </span>
          )}
        </div>
        {item.description && (
          <div className="mt-3 border-t border-gray-50 pt-3">
            <p
              ref={descRef}
              className={`text-[13px] text-gray-500 leading-relaxed ${expanded ? 'whitespace-pre-line' : 'line-clamp-2'}`}
            >
              {item.description}
            </p>
            {(clamped || expanded) && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1.5 text-[12px] font-semibold text-[#0080C8] hover:underline"
              >
                {expanded ? '접기' : '더 보기'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 웹 전용 라이트박스: 비포·애프터를 풀스크린에 한번에 맞춰서 표시 (모바일 미표시) ── */}
      {lightbox && (
        <div
          className="hidden sm:flex fixed inset-0 z-[100] bg-black/90 items-center justify-center gap-6 p-8 cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="닫기"
            className="fixed top-5 right-7 z-[110] text-white/80 hover:text-white text-3xl font-light leading-none"
          >
            ✕
          </button>
          {isLoggedIn && item.before_image_url && (
            <figure className="flex-1 min-w-0 h-full flex flex-col items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <figcaption className="bg-black/55 text-white text-xs font-bold px-3 py-1 rounded tracking-wide">BEFORE</figcaption>
              <img src={item.before_image_url} alt="치료 전 원본" className="max-w-full max-h-[82vh] object-contain cursor-default" />
            </figure>
          )}
          {item.after_image_url && (
            <figure className="flex-1 min-w-0 h-full flex flex-col items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <figcaption className="bg-[#0080C8]/85 text-white text-xs font-bold px-3 py-1 rounded tracking-wide">AFTER</figcaption>
              <img src={item.after_image_url} alt="치료 후 원본" className="max-w-full max-h-[82vh] object-contain cursor-default" />
            </figure>
          )}
        </div>
      )}
    </article>
  )
}
