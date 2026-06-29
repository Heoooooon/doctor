'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

interface CaseBlog {
  id: string
  blog_url: string
  blog_title: string | null
}

interface Case {
  id: string
  board_category: string
  treatment_type: string | null
  title: string
  description: string | null
  before_image_url: string | null
  after_image_url: string | null
  sort_order: number | null
  created_at: string
  case_blogs: CaseBlog[]
}

interface FormData {
  title: string
  description: string
  board_category: string
  treatment_type: string
  before_image_url: string
  after_image_url: string
  blog_urls: { url: string; title: string }[]
}

const BOARD_CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'natural-tooth', label: '자연치아' },
  { value: 'implant', label: '임플란트' },
  { value: 'cosmetic', label: '심미보철' },
  { value: 'orthodontics', label: '교정' },
  { value: 'pediatric', label: '소아' },
]

const TREATMENT_TYPES_BY_CATEGORY: Record<
  string,
  { value: string; label: string }[]
> = {
  'natural-tooth': [
    { value: 'cavity', label: '충치치료' },
    { value: 'vpt', label: 'VPT 신경보존술' },
    { value: 'root-canal', label: '신경치료' },
    { value: 'gum', label: '잇몸치료' },
  ],
  implant: [
    { value: 'all-on', label: '올온 임플란트' },
    { value: 'immediate-loading', label: '즉시로딩 임플란트' },
    { value: 'navigation', label: '네비게이션 임플란트' },
    { value: 'sinus-lift', label: '상악동 거상술' },
    { value: 'diabetes', label: '당뇨 환자 임플란트' },
  ],
  cosmetic: [
    { value: 'laminate', label: '최소삭제 라미네이트' },
    { value: 'resin-buildup', label: '앞니 레진빌드업' },
    { value: 'gum-contouring', label: '잇몸 성형' },
  ],
  orthodontics: [
    { value: 'invisalign', label: '인비절라인 투명교정' },
    { value: 'pediatric-ortho', label: '소아교정' },
  ],
  pediatric: [
    { value: 'pediatric-cavity', label: '소아충치치료' },
    { value: 'laughing-gas', label: '웃음가스 진정치료' },
  ],
}

const CATEGORY_BADGE: Record<string, string> = {
  'natural-tooth': 'bg-emerald-100 text-emerald-800',
  implant: 'bg-blue-100 text-blue-800',
  cosmetic: 'bg-purple-100 text-purple-800',
  orthodontics: 'bg-orange-100 text-orange-800',
  pediatric: 'bg-pink-100 text-pink-800',
}

const emptyForm: FormData = {
  title: '',
  description: '',
  board_category: 'natural-tooth',
  treatment_type: '',
  before_image_url: '',
  after_image_url: '',
  blog_urls: [{ url: '', title: '' }],
}

export default function CasesPage() {
  const [items, setItems] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?board_category=${filter}` : ''
      const res = await fetch(`/api/cases${params}`)
      if (res.ok) setItems(await res.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openAddModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (item: Case) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      description: item.description || '',
      board_category: item.board_category,
      treatment_type: item.treatment_type || '',
      before_image_url: item.before_image_url || '',
      after_image_url: item.after_image_url || '',
      blog_urls:
        item.case_blogs.length > 0
          ? item.case_blogs.map((b) => ({
              url: b.blog_url,
              title: b.blog_title || '',
            }))
          : [{ url: '', title: '' }],
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        board_category: form.board_category,
        treatment_type: form.treatment_type || null,
        before_image_url: form.before_image_url || null,
        after_image_url: form.after_image_url || null,
        blog_urls: form.blog_urls.filter((b) => b.url.trim()),
      }

      const url = editingId ? `/api/cases/${editingId}` : '/api/cases'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setModalOpen(false)
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await fetch(`/api/cases/${deleteId}`, { method: 'DELETE' })
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== deleteId))
      setDeleteId(null)
    }
  }

  const handleImageUpload = async (
    file: File,
    field: 'before_image_url' | 'after_image_url',
  ) => {
    const which = field === 'before_image_url' ? 'before' : 'after'
    setUploading(which)
    try {
      const fd = new window.FormData()
      fd.append('file', file)
      fd.append('folder', 'cases')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        setForm((prev) => ({ ...prev, [field]: url }))
      }
    } catch {
      // ignore
    } finally {
      setUploading(null)
    }
  }

  const addBlogUrl = () => {
    setForm((prev) => ({
      ...prev,
      blog_urls: [...prev.blog_urls, { url: '', title: '' }],
    }))
  }

  const removeBlogUrl = (index: number) => {
    setForm((prev) => ({
      ...prev,
      blog_urls: prev.blog_urls.filter((_, i) => i !== index),
    }))
  }

  const updateBlogUrl = (
    index: number,
    field: 'url' | 'title',
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      blog_urls: prev.blog_urls.map((b, i) =>
        i === index ? { ...b, [field]: value } : b,
      ),
    }))
  }

  const getCategoryLabel = (value: string) =>
    BOARD_CATEGORIES.find((c) => c.value === value)?.label || value

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">증례 관리</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#0080C8] text-white text-sm font-medium rounded-lg hover:bg-[#006aaa] transition-colors"
        >
          <Plus size={16} />
          증례 추가
        </button>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {BOARD_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === cat.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          등록된 증례가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_BADGE[item.board_category] || 'bg-gray-100 text-gray-600'}`}
                >
                  {getCategoryLabel(item.board_category)}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-gray-400 hover:text-[#0080C8] transition-colors"
                    title="수정"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              {item.treatment_type && (
                <p className="text-xs text-gray-500 mb-2">
                  {item.treatment_type}
                </p>
              )}
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.case_blogs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">
                    블로그 링크 ({item.case_blogs.length})
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 추가/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? '증례 수정' : '증례 추가'}
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
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8] focus:border-[#0080C8]"
                  placeholder="증례 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8] focus:border-[#0080C8] resize-none"
                  placeholder="증례 설명"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    게시판 카테고리 *
                  </label>
                  <select
                    value={form.board_category}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        board_category: e.target.value,
                        treatment_type: '',
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                  >
                    {BOARD_CATEGORIES.filter((c) => c.value !== 'all').map(
                      (cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    치료 유형
                  </label>
                  <select
                    value={form.treatment_type}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        treatment_type: e.target.value,
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                  >
                    <option value="">선택 안 함</option>
                    {(
                      TREATMENT_TYPES_BY_CATEGORY[form.board_category] || []
                    ).map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 이미지 업로드 */}
              <div className="grid grid-cols-2 gap-4">
                {(['before_image_url', 'after_image_url'] as const).map(
                  (field) => {
                    const label =
                      field === 'before_image_url'
                        ? 'Before 이미지'
                        : 'After 이미지'
                    const which =
                      field === 'before_image_url' ? 'before' : 'after'
                    return (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {label}
                        </label>
                        {form[field] ? (
                          <div className="relative h-32 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={form[field]}
                              alt={label}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setForm((p) => ({ ...p, [field]: '' }))
                              }
                              className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label
                            className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-xs text-gray-400 cursor-pointer hover:border-[#0080C8] hover:text-[#0080C8] transition-colors"
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.currentTarget.classList.add('border-[#0080C8]', 'bg-blue-50', 'text-[#0080C8]')
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('border-[#0080C8]', 'bg-blue-50', 'text-[#0080C8]')
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              e.currentTarget.classList.remove('border-[#0080C8]', 'bg-blue-50', 'text-[#0080C8]')
                              const file = e.dataTransfer.files?.[0]
                              if (file && file.type.startsWith('image/')) {
                                handleImageUpload(file, field)
                              }
                            }}
                          >
                            {uploading === which ? (
                              '업로드 중...'
                            ) : (
                              <>
                                <Plus size={20} className="mb-1" />
                                <span>이미지 선택</span>
                                <span className="text-[10px] mt-0.5 opacity-60">또는 드래그해서 놓기</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, field)
                                e.target.value = ''
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )
                  },
                )}
              </div>

              {/* 블로그 URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  블로그 링크
                </label>
                {form.blog_urls.map((blog, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={blog.url}
                      onChange={(e) => updateBlogUrl(i, 'url', e.target.value)}
                      placeholder="블로그 URL"
                      className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                    />
                    <input
                      type="text"
                      value={blog.title}
                      onChange={(e) =>
                        updateBlogUrl(i, 'title', e.target.value)
                      }
                      placeholder="제목 (선택)"
                      className="w-32 h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                    />
                    {form.blog_urls.length > 1 && (
                      <button
                        onClick={() => removeBlogUrl(i)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addBlogUrl}
                  className="text-xs text-[#0080C8] hover:underline"
                >
                  + 링크 추가
                </button>
              </div>
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
                disabled={saving || !form.title.trim()}
                className="px-4 py-2 text-sm bg-[#0080C8] text-white rounded-lg hover:bg-[#006aaa] disabled:opacity-60 transition-colors"
              >
                {saving ? '저장 중...' : editingId ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              증례 삭제
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              이 증례를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
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
