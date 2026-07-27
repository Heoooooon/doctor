'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, Upload, RotateCcw } from 'lucide-react'

interface DoctorGroupSettings {
  desktop_image: string
  mobile_image: string
  headline: string
  subcopy: string
  button_text: string
  mobile_subcopy: string
  mobile_button_text: string
}

const DEFAULTS: DoctorGroupSettings = {
  desktop_image: '/images/doctors/doctors-team-desktop.webp',
  mobile_image: '/images/doctors/doctor-team-mobile.webp',
  headline: '한자리에서\n변하지 않는 마음',
  subcopy: '서울대학교 출신 2인 대표원장이\n처음 상담부터 차분히 설명합니다',
  button_text: '자세히보기',
  mobile_subcopy: '마음을 담아 정성을 다하여',
  mobile_button_text: '이건진료진 소개',
}

const SECTION_KEY = 'doctor-group'

export default function SectionsPage() {
  const [form, setForm] = useState<DoctorGroupSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'desktop' | 'mobile' | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const desktopFileRef = useRef<HTMLInputElement>(null)
  const mobileFileRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/section-settings?key=${SECTION_KEY}`)
      if (res.ok) {
        const data = await res.json()
        if (data.value && Object.keys(data.value).length > 0) {
          setForm({ ...DEFAULTS, ...data.value })
        }
      }
    } catch {
      // 기본값 유지
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const uploadImage = async (file: File, target: 'desktop' | 'mobile') => {
    setUploading(target)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'clinic')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || '업로드에 실패했습니다.')
        return
      }
      const data = await res.json()
      const key = target === 'desktop' ? 'desktop_image' : 'mobile_image'
      setForm((prev) => ({ ...prev, [key]: data.url }))
    } catch {
      setError('업로드에 실패했습니다.')
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/section-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: SECTION_KEY, value: form }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || '저장에 실패했습니다.')
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm(DEFAULTS)
    setSaved(false)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">불러오는 중...</div>
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">메인 섹션 관리</h1>
          <p className="text-sm text-gray-500 mt-1">의료진 소개 섹션 (두 번째 섹션)</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={14} />
          기본값 복원
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* 데스크탑 이미지 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            데스크탑 이미지
          </label>
          <p className="text-xs text-gray-500 mb-4">
            권장: 2560×1440 (16:9), WebP/JPG, 500KB 이하 · 인물을 오른쪽에 배치
          </p>
          <div className="flex items-start gap-4">
            <div className="relative w-64 h-36 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
              {form.desktop_image ? (
                <img
                  src={form.desktop_image}
                  alt="데스크탑 미리보기"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '72% 58%' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  이미지 없음
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => desktopFileRef.current?.click()}
                disabled={uploading === 'desktop'}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading === 'desktop' ? '업로드 중...' : '이미지 변경'}
              </button>
              <span className="text-xs text-gray-400 truncate max-w-[200px]">
                {form.desktop_image.split('/').pop()}
              </span>
            </div>
          </div>
          <input
            ref={desktopFileRef}
            type="file"
            accept="image/webp,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadImage(file, 'desktop')
              e.target.value = ''
            }}
          />
        </div>

        {/* 모바일 이미지 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            모바일 이미지
          </label>
          <p className="text-xs text-gray-500 mb-4">
            권장: 1080×1770 (390:640), WebP/JPG, 300KB 이하 · 인물을 하단에 배치
          </p>
          <div className="flex items-start gap-4">
            <div className="relative w-32 h-52 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
              {form.mobile_image ? (
                <img
                  src={form.mobile_image}
                  alt="모바일 미리보기"
                  className="w-full h-full object-cover object-bottom"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  이미지 없음
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => mobileFileRef.current?.click()}
                disabled={uploading === 'mobile'}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading === 'mobile' ? '업로드 중...' : '이미지 변경'}
              </button>
              <span className="text-xs text-gray-400 truncate max-w-[200px]">
                {form.mobile_image.split('/').pop()}
              </span>
            </div>
          </div>
          <input
            ref={mobileFileRef}
            type="file"
            accept="image/webp,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadImage(file, 'mobile')
              e.target.value = ''
            }}
          />
        </div>

        {/* 카피 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              헤드라인
            </label>
            <textarea
              value={form.headline}
              onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0080C8] focus:border-transparent resize-none"
              placeholder="한자리에서&#10;변하지 않는 마음"
            />
            <p className="text-xs text-gray-400 mt-1">줄바꿈 = 화면에서도 줄바꿈</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              서브카피 <span className="text-gray-400 font-normal">(데스크탑)</span>
            </label>
            <textarea
              value={form.subcopy}
              onChange={(e) => setForm((p) => ({ ...p, subcopy: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0080C8] focus:border-transparent resize-none"
              placeholder="서울대학교 출신 2인 대표원장이&#10;처음 상담부터 차분히 설명합니다"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              서브카피 <span className="text-gray-400 font-normal">(모바일)</span>
            </label>
            <textarea
              value={form.mobile_subcopy}
              onChange={(e) => setForm((p) => ({ ...p, mobile_subcopy: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0080C8] focus:border-transparent resize-none"
              placeholder="마음을 담아 정성을 다하여"
            />
            <p className="text-xs text-gray-400 mt-1">
              비워두면 데스크탑 서브카피를 그대로 사용합니다
            </p>
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                버튼 텍스트 <span className="text-gray-400 font-normal">(데스크탑)</span>
              </label>
              <input
                type="text"
                value={form.button_text}
                onChange={(e) => setForm((p) => ({ ...p, button_text: e.target.value }))}
                className="w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0080C8] focus:border-transparent"
                placeholder="자세히보기"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                버튼 텍스트 <span className="text-gray-400 font-normal">(모바일)</span>
              </label>
              <input
                type="text"
                value={form.mobile_button_text}
                onChange={(e) => setForm((p) => ({ ...p, mobile_button_text: e.target.value }))}
                className="w-48 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0080C8] focus:border-transparent"
                placeholder="이건진료진 소개"
              />
            </div>
          </div>
        </div>

        {/* 저장 */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#0080C8] text-white text-sm font-semibold rounded-lg hover:bg-[#006aaa] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? '저장 중...' : '저장'}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">저장되었습니다</span>
          )}
        </div>
      </div>
    </div>
  )
}
