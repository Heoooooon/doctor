'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Upload, ExternalLink } from 'lucide-react'

interface SlidePopup {
  id: string
  title: string
  image_url: string
  link_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

interface FormData {
  title: string
  image_url: string
  link_url: string
  sort_order: number
  is_active: boolean
}

const emptyForm: FormData = {
  title: '',
  image_url: '',
  link_url: '',
  sort_order: 0,
  is_active: true,
}

export default function PopupsAdminPage() {
  const [items, setItems] = useState<SlidePopup[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/popups?all=1')
      if (res.ok) {
        setItems(await res.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openAddModal = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      sort_order: items.reduce((max, item) => Math.max(max, item.sort_order), -1) + 1,
    })
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (item: SlidePopup) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      image_url: item.image_url || '',
      link_url: item.link_url || '',
      sort_order: item.sort_order,
      is_active: item.is_active,
    })
    setError('')
    setModalOpen(true)
  }

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'popups')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || '이미지 업로드에 실패했습니다.')
        return
      }

      const data = await res.json()
      setForm((prev) => ({
        ...prev,
        image_url: data.url,
        title: prev.title || file.name.replace(/\.[^.]+$/, ''),
      }))
    } catch {
      setError('이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await uploadImage(file)
    e.target.value = ''
  }

  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await uploadImage(file)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!form.image_url.trim()) {
      setError('이미지를 업로드해주세요.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const url = editingId ? `/api/popups/${editingId}` : '/api/popups'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          image_url: form.image_url.trim(),
          link_url: form.link_url.trim() || null,
          sort_order: Number(form.sort_order) || 0,
          is_active: form.is_active,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || '저장에 실패했습니다.')
        return
      }

      setModalOpen(false)
      fetchData()
    } catch {
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    const res = await fetch(`/api/popups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentActive }),
    })
    if (res.ok) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: !currentActive } : item,
        ),
      )
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await fetch(`/api/popups/${deleteId}`, { method: 'DELETE' })
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== deleteId))
      setDeleteId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">슬라이드 팝업</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#0080C8] text-white text-sm font-medium rounded-lg hover:bg-[#006aaa] transition-colors"
        >
          <Plus size={16} />
          팝업 추가
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        홈페이지 인트로가 끝난 뒤 오버레이로 표시됩니다. 활성화된 이미지가 슬라이드로 순서대로 노출됩니다.
      </p>

      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          등록된 팝업이 없습니다. 이미지를 추가해 주세요.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  이미지
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  제목
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                  순서
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  활성
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-16 h-20 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                        -
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">
                      {item.title}
                    </p>
                    {item.link_url && (
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-[#0080C8] hover:underline"
                      >
                        <ExternalLink size={12} />
                        링크
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center hidden md:table-cell">
                    <span className="text-sm text-gray-500">{item.sort_order}</span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className={`inline-block w-8 h-4 rounded-full transition-colors relative ${
                        item.is_active ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                      aria-label={item.is_active ? '비활성화' : '활성화'}
                    >
                      <span
                        className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                          item.is_active ? 'left-4' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        title="수정"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                        title="삭제"
                      >
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? '팝업 수정' : '팝업 추가'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8] focus:border-[#0080C8]"
                  placeholder="관리용 제목 (예: 4월 이벤트)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이미지 *
                </label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    setDragActive(false)
                  }}
                  onDrop={handleDrop}
                  disabled={uploading}
                  className={[
                    'w-full min-h-28 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors',
                    'flex flex-col items-center justify-center',
                    dragActive
                      ? 'border-[#0080C8] bg-[#0080C8]/5 text-[#0080C8]'
                      : 'border-gray-300 text-gray-400 hover:border-[#0080C8] hover:text-[#0080C8]',
                    uploading ? 'cursor-wait opacity-70' : '',
                  ].join(' ')}
                >
                  <Upload size={22} />
                  <span className="mt-2 text-sm font-medium">
                    {uploading
                      ? '이미지 업로드 중...'
                      : '이미지를 끌어다 놓거나 클릭해서 선택'}
                  </span>
                  <span className="mt-1 text-xs text-gray-400">
                    JPG, PNG, WebP, GIF · 권장 세로형 또는 정사각
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {form.image_url && (
                  <div className="relative mt-3 mx-auto max-w-[240px] overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={form.image_url}
                      alt="미리보기"
                      className="w-full h-auto object-contain max-h-72"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, image_url: '' }))}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  클릭 시 이동 링크
                </label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                  placeholder="https://... (선택)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    정렬 순서
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, sort_order: Number(e.target.value) || 0 }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                  />
                  <p className="mt-1 text-xs text-gray-400">작을수록 먼저 표시</p>
                </div>
                <div className="flex items-end pb-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, is_active: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#0080C8]"
                    />
                    <span className="text-sm text-gray-700">활성화</span>
                  </label>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="px-4 py-2 text-sm bg-[#0080C8] text-white rounded-lg hover:bg-[#006aaa] disabled:opacity-60 transition-colors"
              >
                {saving ? '저장 중...' : editingId ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">팝업 삭제</h3>
            <p className="text-sm text-gray-500 mb-6">
              이 팝업을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
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
