'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Upload, Sparkles, ArrowUp, ArrowDown, Type, FileText, Link2 } from 'lucide-react'

const HTML_TEMPLATE = `<h1 style="font-size:26px; font-weight:700; color:#1a2b3c; border-bottom:2px solid #1a2b3c; padding-bottom:15px; margin-bottom:30px; line-height:1.4;">
  [메인 제목]<br>
  <span style="font-size:0.7em; font-weight:400; color:#555;">[부제목]</span>
</h1>

<p>안녕하세요. 서울이건치과 원장입니다.</p>

<p>
  [환자분들이 자주 하시는 말씀이 있습니다.]<br>
  <strong>"[환자가 자주 묻는 질문 또는 흔한 오해]"</strong>
</p>

<p>
  [도입 연결 문장],
  <span style="font-weight:700; color:#d35400; background:rgba(211,84,0,0.1); padding:0 4px;">[핵심 결론 문장]</span>
  [이유 보충 설명.]
</p>

<h2 style="font-size:22px; font-weight:700; color:#2c3e50; border-left:5px solid #d35400; padding-left:15px; margin-top:50px; margin-bottom:15px;">
  1. [소단원 제목]
</h2>

<p>[소단원 도입 설명.]</p>

<div style="background:#eeeeee; border-radius:8px; text-align:center; margin-bottom:20px; overflow:hidden;">
  <img src="[이미지URL]" style="max-width:100%; display:block; margin:0 auto;" alt="[이미지 설명]">
</div>
<p style="font-size:14px; color:#666; text-align:center; margin-top:-15px;">▲ [이미지 캡션]</p>

<p>[본문 설명 문장.]</p>

<h2 style="font-size:22px; font-weight:700; color:#2c3e50; border-left:5px solid #d35400; padding-left:15px; margin-top:50px; margin-bottom:15px;">
  2. [소단원 제목]
</h2>

<p>[소단원 도입 설명.]</p>

<div style="background:#f4f7fa; border:1px solid #e1e8ed; border-radius:10px; padding:20px; margin-bottom:20px;">
  <strong>✅ [박스 소제목]</strong><br><br>
  1. [포인트 1]<br>
  2. [포인트 2]<br>
  3. [포인트 3]
</div>

<div style="padding:30px 0 0;">
  <p style="font-size:18px; font-weight:700; color:#1a2b3c; margin-bottom:15px;">
    [마무리 핵심 메시지]
  </p>
  <p>
    [마무리 문장. <strong>[행동 강조]</strong> 하는 것이 원칙입니다.]<br>
    [자연 치아를 보호하기 위해 미루지 말고 검진받아보시길 권해드립니다.]
  </p>
</div>`

// 붙여넣은 HTML을 본문(.post-wrap 내부)만 남도록 변환
function normalizeHtml(raw: string): string {
  if (!raw) return ''
  let html = raw
  html = html.replace(/<!DOCTYPE[^>]*>/gi, '')
  html = html.replace(/<\/?(?:html|head|body)[^>]*>/gi, '')
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
  html = html.replace(/<title[\s\S]*?<\/title>/gi, '')
  html = html.replace(/<meta[^>]*>/gi, '')
  html = html.replace(/<link[^>]*>/gi, '')
  // post-wrap 래퍼가 있으면 내부만 추출
  const m = html.match(/<div[^>]*class=["'][^"']*post-wrap[^"']*["'][^>]*>([\s\S]*)<\/div>/i)
  if (m) html = m[1]
  return html.trim()
}

interface Column {
  id: string
  title: string
  content: string | null
  image_url: string | null
  column_date: string
  category: string | null
  tags: string[] | null
  is_active: boolean
  created_at: string
}

interface FormData {
  title: string
  content: string
  column_date: string
  category: string
  tags: string
  is_active: boolean
  image_url: string
}

interface UploadedImage {
  url: string
  name: string
}

const CATEGORIES = ['자연치아살리기', '임플란트', '심미보철', '교정치료', '소아치과', '일반진료']

const emptyForm: FormData = {
  title: '',
  content: '',
  column_date: new Date().toISOString().split('T')[0],
  category: '',
  tags: '',
  is_active: true,
  image_url: '',
}

export default function ColumnsPage() {
  const [items, setItems] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit')
  const [insertingImg, setInsertingImg] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [docxLoading, setDocxLoading] = useState(false)
  const [naverLoading, setNaverLoading] = useState(false)
  const [imgSelected, setImgSelected] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const docxRef = useRef<HTMLInputElement>(null)
  const contentImgRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const selectedImgRef = useRef<HTMLImageElement | null>(null)
  const draggingBoxRef = useRef<HTMLElement | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/columns?all=1')
      if (res.ok) setItems(await res.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // 미리보기 탭 진입 시에만 변환된 HTML을 렌더링 (편집 중에는 덮어쓰지 않음)
  useEffect(() => {
    if (editorTab === 'preview' && previewRef.current) {
      previewRef.current.innerHTML = form.content
      lockImages()
    } else {
      clearImgSel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorTab])

  const openAddModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setUploadedImages([])
    setEditorTab('edit')
    setModalOpen(true)
  }

  const openEditModal = (item: Column) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      content: item.content || '',
      column_date: item.column_date,
      category: item.category || '',
      tags: item.tags?.join(', ') || '',
      is_active: item.is_active,
      image_url: item.image_url || '',
    })
    setUploadedImages([])
    setEditorTab('edit')
    setModalOpen(true)
  }

  const uploadImages = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (!imageFiles.length) return
    setUploading(true)
    try {
      const uploaded: UploadedImage[] = []
      for (const file of imageFiles) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', 'columns')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const data = await res.json()
          uploaded.push({ url: data.url, name: file.name })
        }
      }
      setUploadedImages((prev) => [...prev, ...uploaded])
      if (uploaded[0]) setForm((p) => ({ ...p, image_url: p.image_url || uploaded[0].url }))
    } catch {
      // ignore
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadImages(Array.from(e.target.files || []))
    e.target.value = ''
  }

  const insertImageAtPos = async (file: File, x?: number, y?: number) => {
    if (!file.type.startsWith('image/')) return
    setInsertingImg(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'columns')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) return
      const { url } = await res.json()

      // img-box + caption 요소 생성 — 이미지는 편집/드래그 불가한 "위젯"으로 만들어
      // contentEditable 안에서 선택이 고착되거나 텍스트 드래그와 충돌하는 문제를 방지
      const wrapper = document.createElement('div')
      wrapper.className = 'img-box'
      wrapper.contentEditable = 'false'
      wrapper.draggable = true
      wrapper.style.cursor = 'grab'
      const img = document.createElement('img')
      img.src = url
      img.alt = ''
      wrapper.appendChild(img)
      const caption = document.createElement('p')
      caption.className = 'img-caption'
      caption.textContent = '▲ 캡션을 입력하세요'

      const editor = previewRef.current
      if (!editor) return

      // 드롭 위치에 삽입
      if (x !== undefined && y !== undefined) {
        const range = (document as any).caretRangeFromPoint?.(x, y)
          ?? (document as any).caretPositionFromPoint?.(x, y)
        if (range) {
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
          range.collapse(true)
          range.insertNode(caption)
          range.insertNode(wrapper)
        } else {
          editor.appendChild(wrapper)
          editor.appendChild(caption)
        }
      } else {
        editor.appendChild(wrapper)
        editor.appendChild(caption)
      }
      setForm((p) => ({ ...p, content: editor.innerHTML }))
    } finally {
      setInsertingImg(false)
    }
  }

  // 미리보기 내 img-box를 편집 불가 + 드래그 가능한 "위젯"으로 고정
  const lockImages = () => {
    const root = previewRef.current
    if (!root) return
    root.querySelectorAll('.img-box').forEach((b) => {
      const el = b as HTMLElement
      el.contentEditable = 'false'
      el.draggable = true
      el.style.cursor = 'grab'
    })
  }

  // 직렬화 시 선택 표시(outline)를 제거한 깨끗한 HTML 반환
  const readContent = (): string => {
    const root = previewRef.current
    if (!root) return form.content
    const sel = selectedImgRef.current
    if (sel) sel.removeAttribute('style')
    const html = root.innerHTML
    if (sel) {
      sel.style.outline = '3px solid #0080C8'
      sel.style.outlineOffset = '2px'
    }
    return html
  }

  const syncPreview = () => {
    setForm((p) => ({ ...p, content: readContent() }))
  }

  // 드래그한 이미지 묶음을 커서 위치(최상위 블록 기준)로 이동
  const insertGroupAtPoint = (group: HTMLElement[], y: number) => {
    const root = previewRef.current
    if (!root) return
    const blocks = Array.from(root.children).filter((c) => !group.includes(c as HTMLElement))
    let ref: Element | null = null
    for (const b of blocks) {
      const r = b.getBoundingClientRect()
      if (y < r.top + r.height / 2) { ref = b; break }
    }
    if (ref) ref.before(...group)
    else root.append(...group)
  }

  const clearImgSel = () => {
    if (selectedImgRef.current) selectedImgRef.current.style.outline = ''
    selectedImgRef.current = null
    setImgSelected(false)
  }

  const selectImg = (img: HTMLImageElement) => {
    if (selectedImgRef.current && selectedImgRef.current !== img) selectedImgRef.current.style.outline = ''
    selectedImgRef.current = img
    img.style.outline = '3px solid #0080C8'
    img.style.outlineOffset = '2px'
    setImgSelected(true)
  }

  // 선택된 이미지의 img-box(+바로 뒤 캡션)를 한 묶음으로 반환
  const selectedGroup = (): HTMLElement[] => {
    const img = selectedImgRef.current
    if (!img) return []
    const box = (img.closest('.img-box') as HTMLElement) || img
    const next = box.nextElementSibling
    const cap = next && next.classList.contains('img-caption') ? (next as HTMLElement) : null
    return cap ? [box, cap] : [box]
  }

  const moveSelectedImg = (dir: 'up' | 'down') => {
    const group = selectedGroup()
    if (!group.length) return
    const box = group[0]
    if (dir === 'up') {
      const prev = box.previousElementSibling
      if (prev) prev.before(...group)
    } else {
      const after = group[group.length - 1].nextElementSibling
      if (after) after.after(...group)
    }
    syncPreview()
  }

  const deleteSelectedImg = () => {
    selectedGroup().forEach((el) => el.remove())
    clearImgSel()
    syncPreview()
  }

  const editSelectedCaption = () => {
    const group = selectedGroup()
    if (!group.length) return
    const box = group[0]
    let cap = group[1] as HTMLElement | undefined
    const current = cap ? (cap.textContent ?? '').replace(/^▲\s*/, '') : ''
    const text = window.prompt('이미지 캡션을 입력하세요', current)
    if (text === null) return
    if (!cap) {
      cap = document.createElement('p')
      cap.className = 'img-caption'
      box.after(cap)
    }
    cap.textContent = text.trim() ? `▲ ${text.trim()}` : ''
    syncPreview()
  }

  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setDragActive(false)
    await uploadImages(Array.from(e.dataTransfer.files || []))
  }

  const removeUploadedImage = (url: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.url !== url))
    setForm((prev) => ({
      ...prev,
      image_url: prev.image_url === url
        ? uploadedImages.find((img) => img.url !== url)?.url || ''
        : prev.image_url,
    }))
  }

  const parseTags = (raw: string): string[] =>
    raw.split(',').map((t) => t.trim()).filter(Boolean)

  // 네이버 블로그 URL → 글+사진을 불러와 칼럼 템플릿으로 자동 변환 (이미지는 우리 저장소에 재업로드)
  const handleNaverImport = async () => {
    const url = window.prompt('네이버 블로그 글 주소(URL)를 붙여넣으세요')
    if (!url || !url.trim()) return
    setNaverLoading(true)
    try {
      const res = await fetch('/api/columns/import-naver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || '블로그 글을 불러오지 못했습니다.')
        return
      }

      const images: UploadedImage[] = Array.isArray(data.images)
        ? data.images.map((img: { url: string; name?: string }, i: number) => ({
          url: img.url,
          name: img.name || `naver-image-${i + 1}`,
        }))
        : []

      setUploadedImages((prev) => [...prev, ...images])
      setForm((p) => ({
        ...p,
        title: data.title || p.title,
        category: CATEGORIES.includes(data.category) ? data.category : p.category,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : p.tags,
        content: data.content || p.content,
        image_url: p.image_url || images[0]?.url || '',
      }))
      setEditorTab('preview')
    } catch {
      alert('블로그 글을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setNaverLoading(false)
    }
  }

  // 메모하듯 쓴 글 → AI가 템플릿 HTML로 변환 (제목/카테고리/태그/본문 자동 채움)
  const handleAiGenerate = async () => {
    const notes = form.content.trim()
    if (!notes) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/columns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'AI 변환에 실패했습니다.')
        return
      }
      setForm((p) => ({
        ...p,
        title: data.title || p.title,
        category: CATEGORIES.includes(data.category) ? data.category : p.category,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : p.tags,
        content: data.content || p.content,
      }))
      setEditorTab('preview')
    } catch {
      alert('AI 변환 중 오류가 발생했습니다.')
    } finally {
      setAiLoading(false)
    }
  }

  // Word(.docx) 파일 → 문서 내 이미지 자동 업로드 → AI 템플릿 변환
  const handleDocxGenerate = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert('.docx Word 파일만 업로드할 수 있습니다.')
      return
    }

    setDocxLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/columns/generate-from-docx', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Word 파일 변환에 실패했습니다.')
        return
      }

      const images: UploadedImage[] = Array.isArray(data.images)
        ? data.images.map((img: { url: string; name?: string }, i: number) => ({
          url: img.url,
          name: img.name || `word-image-${i + 1}`,
        }))
        : []

      setUploadedImages((prev) => [...prev, ...images])
      setForm((p) => ({
        ...p,
        title: data.title || p.title,
        category: CATEGORIES.includes(data.category) ? data.category : p.category,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : p.tags,
        content: data.content || p.content,
        image_url: p.image_url || images[0]?.url || '',
      }))
      setEditorTab('preview')
    } catch {
      alert('Word 파일 변환 중 오류가 발생했습니다.')
    } finally {
      setDocxLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    // 활성 탭 기준 최신 HTML 읽기 + 변환
    const latestContent = normalizeHtml(
      editorTab === 'preview' && previewRef.current ? readContent() : form.content,
    )
    try {
      const payload = {
        ...form,
        content: latestContent,
        tags: parseTags(form.tags),
        image_url: form.image_url || uploadedImages[0]?.url || null,
      }
      const url = editingId ? `/api/columns/${editingId}` : '/api/columns'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setModalOpen(false)
        setUploadedImages([])
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/columns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    if (res.ok) setItems((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !current } : c))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await fetch(`/api/columns/${deleteId}`, { method: 'DELETE' })
    if (res.ok) {
      setItems((prev) => prev.filter((c) => c.id !== deleteId))
      setDeleteId(null)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">원장칼럼</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#0080C8] text-white text-sm font-medium rounded-lg hover:bg-[#006aaa] transition-colors"
        >
          <Plus size={16} />
          칼럼 추가
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">등록된 칼럼이 없습니다.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">이미지</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">제목</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">카테고리</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">날짜</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">활성</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">-</div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <a href={`/column/${item.id}`} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 truncate max-w-[200px] hover:text-[#0080C8] transition-colors block">
                      {item.title}
                    </a>
                    {item.tags && item.tags.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                        {item.tags.map((t) => `#${t}`).join(' ')}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-500">{item.category || '–'}</span>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-500">{formatDate(item.column_date)}</span>
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
                      <button onClick={() => openEditModal(item)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="수정">
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

      {/* 추가/수정 모달 — 전체화면 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? '칼럼 수정' : '칼럼 추가'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-w-4xl mx-auto w-full space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                  placeholder="칼럼 제목"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8] bg-white"
                >
                  <option value="">선택 안 함</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                  placeholder="앞니임플란트, 신경치료, 크라운 (쉼표로 구분)"
                />
              </div>

              {/* 내용 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">내용</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleNaverImport}
                      disabled={naverLoading || aiLoading || docxLoading}
                      title="네이버 블로그 글 주소를 붙여넣으면 글과 사진을 불러와 칼럼 템플릿으로 변환합니다"
                      className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border border-[#03C75A] text-[#03C75A] bg-white font-medium hover:bg-[#03C75A]/5 transition-colors disabled:opacity-50"
                    >
                      <Link2 size={13} />
                      {naverLoading ? '불러오는 중...' : '네이버 블로그'}
                    </button>
                    <button
                      type="button"
                      onClick={() => docxRef.current?.click()}
                      disabled={docxLoading || aiLoading}
                      title="Word(.docx) 파일의 글과 사진을 칼럼 템플릿으로 자동 변환합니다"
                      className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border border-[#0080C8] text-[#0080C8] bg-white font-medium hover:bg-[#0080C8]/5 transition-colors disabled:opacity-50"
                    >
                      <FileText size={13} />
                      {docxLoading ? 'Word 변환 중...' : 'Word로 AI 변환'}
                    </button>
                    <input
                      ref={docxRef}
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) await handleDocxGenerate(file)
                        e.target.value = ''
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={aiLoading || docxLoading || !form.content.trim()}
                      title="메모하듯 쓴 글을 칼럼 템플릿으로 변환합니다"
                      className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#0080C8] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Sparkles size={13} />
                      {aiLoading ? 'AI 변환 중...' : 'AI 변환'}
                    </button>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (previewRef.current) setForm((p) => ({ ...p, content: readContent() }))
                          setEditorTab('edit')
                        }}
                        className={`px-3 py-1 transition-colors ${editorTab === 'edit' ? 'bg-[#0080C8] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                      >HTML 편집</button>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((p) => ({ ...p, content: normalizeHtml(p.content) }))
                          setEditorTab('preview')
                        }}
                        className={`px-3 py-1 transition-colors ${editorTab === 'preview' ? 'bg-[#0080C8] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                      >미리보기</button>
                    </div>
                  </div>
                </div>
                {editorTab === 'edit' ? (
                  <div>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                      spellCheck={false}
                      className="w-full min-h-[400px] px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0080C8] bg-white font-mono text-xs leading-relaxed"
                      placeholder="① Word 파일이 있으면 [Word로 AI 변환]을 눌러 문서 글과 사진을 한 번에 칼럼 템플릿으로 변환합니다.&#10;② 메모하듯 자유롭게 글을 쓴 뒤 [AI 변환]을 누르면 칼럼 템플릿(제목·소제목·요약·FAQ·마무리)으로 자동 변환됩니다.&#10;③ 또는 완성된 HTML을 붙여넣어도 됩니다. <style>·<head> 등 전체 문서를 붙여넣어도 미리보기에서 본문만 자동 추출됩니다."
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      Word 파일은 <span className="font-semibold text-[#0080C8]">Word로 AI 변환</span>을 누르면 문서 속 이미지까지 업로드해 본문에 배치합니다. 메모하듯 쓴 글은 <span className="font-semibold text-[#7C3AED]">AI 변환</span>으로 템플릿을 입힐 수 있습니다. 미리보기 안에서 이미지를 드래그해 위치를 편집할 수 있습니다.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* 이미지 컨트롤 바 — 이미지를 클릭하면 나타남 */}
                    {imgSelected && (
                      <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-[#0080C8]/5 border border-[#0080C8]/30">
                        <span className="text-xs font-medium text-[#0080C8]">선택된 이미지</span>
                        <button type="button" onClick={() => moveSelectedImg('up')}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:border-[#0080C8] hover:text-[#0080C8]">
                          <ArrowUp size={12} /> 위로
                        </button>
                        <button type="button" onClick={() => moveSelectedImg('down')}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:border-[#0080C8] hover:text-[#0080C8]">
                          <ArrowDown size={12} /> 아래로
                        </button>
                        <button type="button" onClick={editSelectedCaption}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:border-[#0080C8] hover:text-[#0080C8]">
                          <Type size={12} /> 캡션
                        </button>
                        <button type="button" onClick={deleteSelectedImg}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-200 bg-white text-red-500 hover:bg-red-50">
                          <Trash2 size={12} /> 삭제
                        </button>
                        <button type="button" onClick={clearImgSel}
                          className="ml-auto text-xs px-2 py-1 text-gray-400 hover:text-gray-600">선택 해제</button>
                      </div>
                    )}
                    <div
                      ref={previewRef}
                      contentEditable
                      suppressContentEditableWarning
                      className="post-wrap w-full min-h-[400px] px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0080C8] overflow-auto bg-white cursor-text"
                      onClick={(e) => {
                        const t = e.target as HTMLElement
                        if (t.tagName === 'IMG' && previewRef.current?.contains(t)) {
                          selectImg(t as HTMLImageElement)
                        } else {
                          clearImgSel()
                        }
                      }}
                      onDragStart={(e) => {
                        const box = (e.target as HTMLElement).closest?.('.img-box') as HTMLElement | null
                        if (box && previewRef.current?.contains(box)) {
                          draggingBoxRef.current = box
                          e.dataTransfer.effectAllowed = 'move'
                          e.dataTransfer.setData('text/plain', 'img-box')
                        }
                      }}
                      onDragEnd={() => { draggingBoxRef.current = null }}
                      onDragOver={(e) => {
                        // 내부 이미지 이동 또는 파일 드롭을 허용
                        if (draggingBoxRef.current || e.dataTransfer.types.includes('Files')) {
                          e.preventDefault()
                        }
                      }}
                      onDrop={async (e) => {
                        // 1) OS 파일 드롭 → 새 이미지 삽입
                        const file = e.dataTransfer.files?.[0]
                        if (file?.type.startsWith('image/')) {
                          e.preventDefault()
                          await insertImageAtPos(file, e.clientX, e.clientY)
                          return
                        }
                        // 2) 내부 이미지 위치 이동
                        const box = draggingBoxRef.current
                        if (box) {
                          e.preventDefault()
                          const next = box.nextElementSibling
                          const cap = next && next.classList.contains('img-caption') ? (next as HTMLElement) : null
                          const group = cap ? [box, cap] : [box]
                          insertGroupAtPoint(group, e.clientY)
                          draggingBoxRef.current = null
                          syncPreview()
                        }
                      }}
                    />
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => contentImgRef.current?.click()}
                        disabled={insertingImg}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:border-[#0080C8] hover:text-[#0080C8] transition-colors disabled:opacity-50"
                      >
                        <Upload size={12} />
                        {insertingImg ? '업로드 중...' : '이미지 삽입'}
                      </button>
                      <span className="text-xs text-gray-400">이미지는 <b>직접 드래그</b>해서 위치를 옮기거나, <b>클릭</b>하면 위로/아래로·캡션·삭제할 수 있습니다. 캡션 글씨는 미리보기에서 바로 타이핑해 고칠 수 있어요.</span>
                    </div>
                    <input
                      ref={contentImgRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) await insertImageAtPos(file)
                        e.target.value = ''
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                  onDrop={handleDrop}
                  disabled={uploading}
                  className={[
                    'w-full min-h-28 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors flex flex-col items-center justify-center',
                    dragActive ? 'border-[#0080C8] bg-[#0080C8]/5 text-[#0080C8]' : 'border-gray-300 text-gray-400 hover:border-[#0080C8] hover:text-[#0080C8]',
                    uploading ? 'cursor-wait opacity-70' : '',
                  ].join(' ')}
                >
                  <Upload size={22} />
                  <span className="mt-2 text-sm font-medium">
                    {uploading ? '업로드 중...' : '이미지를 끌어다 놓거나 클릭해서 선택'}
                  </span>
                </button>

                {uploadedImages.length > 0 ? (
                  <>
                    <p className="mt-1 text-xs text-gray-400">사진을 <b>클릭</b>하면 대표 이미지(목록 썸네일)로 지정됩니다.</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {uploadedImages.map((img, i) => {
                        const isRep = form.image_url ? form.image_url === img.url : i === 0
                        return (
                          <div
                            key={img.url}
                            onClick={() => setForm((p) => ({ ...p, image_url: img.url }))}
                            className={`relative overflow-hidden rounded-lg border cursor-pointer transition-shadow ${isRep ? 'border-[#0080C8] ring-2 ring-[#0080C8]' : 'border-gray-200 hover:border-[#0080C8]'}`}
                          >
                            <img src={img.url} alt={`이미지 ${i + 1}`} className="h-28 w-full object-cover" />
                            {isRep && (
                              <span className="absolute left-2 top-2 px-1.5 py-0.5 rounded bg-[#0080C8] text-white text-[10px] font-bold">대표</span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeUploadedImage(img.url) }}
                              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : form.image_url ? (
                  <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg bg-gray-100">
                    <img src={form.image_url} alt="미리보기" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, image_url: '' }))}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null}

                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              {/* 날짜 + 활성화 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">작성 날짜</label>
                  <input
                    type="date"
                    value={form.column_date}
                    onChange={(e) => setForm((p) => ({ ...p, column_date: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080C8]"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-[#0080C8]"
                    />
                    <span className="text-sm text-gray-700">활성화</span>
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* 하단 버튼 바 — 전체화면 고정 */}
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200 bg-white shrink-0">
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
      )}

      {/* 삭제 확인 */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">칼럼 삭제</h3>
            <p className="text-sm text-gray-500 mb-6">이 칼럼을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">취소</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
