'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2 } from 'lucide-react'

interface Consultation {
  id: string
  name: string
  phone: string
  status: string
  memo: string | null
  created_at: string
}

const STATUS_TABS = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '미확인' },
  { value: 'contacted', label: '연락완료' },
  { value: 'completed', label: '완료' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: '미확인' },
  { value: 'contacted', label: '연락완료' },
  { value: 'completed', label: '완료' },
]

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

export default function ConsultationsPage() {
  const [items, setItems] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [editingMemo, setEditingMemo] = useState<string | null>(null)
  const [memoValue, setMemoValue] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const res = await fetch(`/api/consultations${params}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/consultations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item)),
      )
    }
  }

  const saveMemo = async (id: string) => {
    const res = await fetch(`/api/consultations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memo: memoValue }),
    })
    if (res.ok) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, memo: memoValue } : item,
        ),
      )
      setEditingMemo(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await fetch(`/api/consultations/${deleteId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== deleteId))
      setDeleteId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">상담 DB</h1>

      {/* 상태 필터 탭 */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          상담 내역이 없습니다.
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    이름
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    연락처
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    신청일
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    상태
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    메모
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {editingMemo === item.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={memoValue}
                            onChange={(e) => setMemoValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveMemo(item.id)
                              if (e.key === 'Escape') setEditingMemo(null)
                            }}
                            autoFocus
                            className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0080C8]"
                          />
                          <button
                            onClick={() => saveMemo(item.id)}
                            className="text-xs px-2 py-1 bg-[#0080C8] text-white rounded hover:bg-[#006aaa]"
                          >
                            저장
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingMemo(item.id)
                            setMemoValue(item.memo || '')
                          }}
                          className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer text-left"
                          title="클릭하여 메모 편집"
                        >
                          {item.memo || '메모 추가...'}
                        </button>
                      )}
                    </td>
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
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 ${STATUS_BADGE[item.status] || 'bg-gray-100'}`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-600">{item.phone}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(item.created_at)}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {item.memo || '메모 없음'}
                  </span>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              상담 내역 삭제
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              이 상담 내역을 삭제하시겠습니까? 삭제된 데이터는 복구할 수
              없습니다.
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
