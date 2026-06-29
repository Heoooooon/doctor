'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

interface PatientCase {
  id: string
  board_category: string
  treatment_type: string | null
  title: string
  description: string | null
  before_image_url: string | null
  after_image_url: string | null
  treatment_period: string | null
  patient_info: string | null
  sort_order: number | null
  is_active: boolean
  created_at: string
}

interface FormData {
  title: string
  board_category: string
  treatment_type: string
  description: string
  before_image_url: string
  after_image_url: string
  treatment_period: string
  patient_info: string
  is_active: boolean
}

const CATEGORIES: Record<string, string[]> = {
  '자연치아살리기': ['VPT', '레진빌드업', '신경치료', '최소삭제 온레이', '잇몸치료'],
  '임플란트': ['즉시로딩 임플란트', '전체 임플란트', '앞니 임플란트'],
  '심미보철': ['라미네이트', '앞니레진(diastema)', '치아미백'],
  '치아교정': ['인비절라인', '소아교정'],
}
const MAIN_CATS = Object.keys(CATEGORIES)

const emptyForm: FormData = {
  title: '',
  board_category: '자연치아살리기',
  treatment_type: '',
  description: '',
  before_image_url: '',
  after_image_url: '',
  treatment_period: '',
  patient_info: '',
  is_active: true,
}

export default function PatientCasesPage() {
  const [items, setItems] = useState<PatientCase[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/patient-cases?all=1')
      if (res.ok) setItems(await res.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (item: PatientCase) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      board_category: item.board_category,
      treatment_type: item.treatment_type || '',
      description: item.description || '',
      before_image_url: item.before_image_url || '',
      after_image_url: item.after_image_url || '',
      treatment_period: item.treatment_period || '',
      patient_info: item.patient_info || '',
      is_active: item.is_active,
    })
    setModalOpen(true)
  }

  const uploadImage = async (file: File, field: 'before_image_url' | 'after_image_url') => {
    if (!file.type.startsWith('image/')) return
    setUploading(field === 'before_image_url' ? 'before' : 'after')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'cases')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        setForm((p) => ({ ...p, [field]: url }))
      }
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const url = editingId ? `/api/patient-cases/${editingId}` : '/api/patient-cases'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setModalOpen(false)
        fetchData()
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/patient-cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    if (res.ok) setItems((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !current } : c))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await fetch(`/api/patient-cases/${deleteId}`, { method: 'DELETE' })
    if (res.ok) {
      setItems((prev) => prev.filter((c) => c.id !== deleteId))
      setDeleteId(null)
    }
  }

  const subOptions = CATEGORIES[form.board_category] || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">환자사례 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">News 게시판 환자사례 (치료 후 공개 / 치료 전 로그인)</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#0080C8] text-white text-sm font-medium rounded-lg hover:bg-[#006aaa] transition-colors"
        >
          <Plus size={16} />
          사례 추가
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">등록된 환자사례가 없습니다.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">사진</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">제목</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">분류</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">공개</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      {item.before_image_url ? (
                        <img src={item.before_image_url} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : <div className="w-10 h-10 rounded bg-gray-100" />}
                      {item.after_image_url ? (
                        <img src={item.after_image_url} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : <div className="w-10 h-10 rounded bg-gray-100" />}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{item.title}</p>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-500">
                      {item.board_category}{item.treatment_type ? ` › ${item.treatment_type}` : ''}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className={`inline-block w-8 h-4 rounded-full transition-colors relative ${item.is_active ? 'bg-green-400' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${item.is_active ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="수정">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" title="삭제">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 추가/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? '환자사례 수정' : '환자사례 추가'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                  placeholder="예: 깨진 어금니 레진 빌드업"
                />
              </div>

              {/* 대분류 + 소분류 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">대분류 *</label>
                  <select
                    value={form.board_category}
                    onChange={(e) => setForm((p) => ({ ...p, board_category: e.target.value, treatment_type: '' }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8] bg-white"
                  >
                    {MAIN_CATS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">소분류</label>
                  <select
                    value={form.treatment_type}
                    onChange={(e) => setForm((p) => ({ ...p, treatment_type: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8] bg-white"
                  >
                    <option value="">선택 안 함</option>
                    {subOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* 이미지 업로드 (Before / After) */}
              <div className="grid grid-cols-2 gap-4">
                {(['before_image_url', 'after_image_url'] as const).map((field) => {
                  const isBefore = field === 'before_image_url'
                  const which = isBefore ? 'before' : 'after'
                  const label = isBefore ? 'Before (치료 전)' : 'After (치료 후)'
                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      {form[field] ? (
                        <div className="relative h-32 rounded-lg overflow-hidden border border-gray-200">
                          <img src={form[field]} alt={label} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, [field]: '' }))}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label
                          className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-xs text-gray-400 cursor-pointer hover:border-[#0080C8] hover:text-[#0080C8] transition-colors"
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#0080C8]', 'bg-blue-50', 'text-[#0080C8]') }}
                          onDragLeave={(e) => { e.currentTarget.classList.remove('border-[#0080C8]', 'bg-blue-50', 'text-[#0080C8]') }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.remove('border-[#0080C8]', 'bg-blue-50', 'text-[#0080C8]')
                            const file = e.dataTransfer.files?.[0]
                            if (file) uploadImage(file, field)
                          }}
                        >
                          {uploading === which ? '업로드 중...' : (
                            <>
                              <Plus size={20} className="mb-1" />
                              <span>이미지 선택</span>
                              <span className="text-[10px] mt-0.5 opacity-60">또는 드래그</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) uploadImage(file, field)
                              e.target.value = ''
                            }}
                          />
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 치료기간 + 환자정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">치료기간</label>
                  <input
                    type="text"
                    value={form.treatment_period}
                    onChange={(e) => setForm((p) => ({ ...p, treatment_period: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                    placeholder="예: 약 2주"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">환자정보</label>
                  <input
                    type="text"
                    value={form.patient_info}
                    onChange={(e) => setForm((p) => ({ ...p, patient_info: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                    placeholder="예: 40대 남성"
                  />
                </div>
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8] resize-none"
                  placeholder="사례 간단 설명"
                />
              </div>

              {/* 활성화 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-[#0080C8]"
                />
                <span className="text-sm text-gray-700">공개(활성화)</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="px-6 py-2 text-sm bg-[#0080C8] text-white rounded-lg hover:bg-[#006aaa] disabled:opacity-60 transition-colors font-semibold"
              >
                {saving ? '저장 중...' : editingId ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">삭제하시겠습니까?</h3>
            <p className="text-sm text-gray-500 mb-6">삭제한 환자사례는 복구할 수 없습니다.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                취소
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
