'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Search } from 'lucide-react'

interface Member {
  id: string
  user_id: string
  name: string
  phone: string
  email: string
  birthday: string
  created_at: string
}

export default function MembersPage() {
  const [items, setItems] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : ''
      const res = await fetch(`/api/members${params}`)
      if (res.ok) setItems(await res.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchData(q), 300)
    return () => clearTimeout(timer)
  }, [q, fetchData])

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await fetch(`/api/members/${deleteId}`, { method: 'DELETE' })
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== deleteId))
      setDeleteId(null)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  const formatPhone = (phone: string) =>
    phone.length === 11 ? phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : phone

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <span className="text-sm text-gray-400">총 {items.length}명</span>
      </div>

      <div className="relative mb-6 max-w-xs">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름·아이디·이메일·연락처 검색"
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8] focus:border-[#0080C8]"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {q ? '검색 결과가 없습니다.' : '가입한 회원이 없습니다.'}
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">이름</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">아이디</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">연락처</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">이메일</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">생년월일</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">가입일</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.user_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatPhone(item.phone)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.birthday}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="md:hidden space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-gray-600">{item.user_id} · {formatPhone(item.phone)}</p>
                <p className="text-sm text-gray-600">{item.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  생년월일 {item.birthday} · 가입일 {formatDate(item.created_at)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">회원 삭제</h3>
            <p className="text-sm text-gray-500 mb-6">
              이 회원을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
