'use client'

import { useState, useEffect } from 'react'
import { ImageOff, X, ExternalLink } from 'lucide-react'

interface CaseItem {
  id: string
  title: string
  description: string | null
  before_image_url: string | null
  after_image_url: string | null
  board_category: string
  treatment_type: string | null
  case_blogs: { id: string; blog_url: string; blog_title: string | null }[]
}

interface CaseGalleryProps {
  boardCategory: string
  treatmentType: string
}

export default function CaseGallery({
  boardCategory,
  treatmentType,
}: CaseGalleryProps) {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CaseItem | null>(null)

  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch(`/api/cases?board_category=${boardCategory}`)
        if (res.ok) {
          const data: CaseItem[] = await res.json()
          const filtered = data.filter(
            (c) => c.treatment_type === treatmentType,
          )
          setCases(filtered)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchCases()
  }, [boardCategory, treatmentType])

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400 text-base">
        증례 불러오는 중...
      </div>
    )
  }

  if (cases.length === 0) return null

  // 모든 증례에서 블로그 링크 수집
  const allBlogs = cases.flatMap((c) => c.case_blogs)

  return (
    <>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">증례 사진</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              data-cursor-hint="자세히 보기"
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow text-left"
            >
              {item.before_image_url || item.after_image_url ? (
                <div className="flex">
                  {item.before_image_url && (
                    <div className="flex-1 relative">
                      <img
                        src={item.before_image_url}
                        alt={`${item.title} Before`}
                        className="w-full h-40 object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                        Before
                      </span>
                    </div>
                  )}
                  {item.after_image_url && (
                    <div className="flex-1 relative">
                      <img
                        src={item.after_image_url}
                        alt={`${item.title} After`}
                        className="w-full h-40 object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#0080C8] text-white text-[10px] px-1.5 py-0.5 rounded">
                        After
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  <ImageOff className="text-gray-300" size={32} />
                </div>
              )}
              <div className="p-3">
                <p className="font-semibold text-base text-gray-900 truncate">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 블로그 링크 — 증례 카드 아래에 별도 표시 */}
        {allBlogs.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-base font-semibold text-gray-500 mb-3">이원장 칼럼</h4>
            {allBlogs.map((blog) => (
              <a
                key={blog.id}
                href={blog.blog_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-[#0080C8] hover:bg-stone-50 transition-colors group"
              >
                <ExternalLink size={14} className="text-[#0080C8] shrink-0" />
                <span className="text-base text-gray-700 group-hover:text-[#0080C8] truncate">
                  {blog.blog_title || blog.blog_url}
                </span>
                <span className="text-[10px] text-gray-400 shrink-0 ml-auto hidden sm:block truncate max-w-[200px]">
                  {blog.blog_url}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h4 className="font-bold text-gray-900">{selected.title}</h4>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {(selected.before_image_url || selected.after_image_url) && (
              <div className="grid grid-cols-2 gap-0">
                {selected.before_image_url && (
                  <div className="relative">
                    <img src={selected.before_image_url} alt="Before" className="w-full object-cover" />
                    <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">Before</span>
                  </div>
                )}
                {selected.after_image_url && (
                  <div className="relative">
                    <img src={selected.after_image_url} alt="After" className="w-full object-cover" />
                    <span className="absolute top-3 left-3 bg-[#0080C8] text-white text-xs px-2 py-1 rounded">After</span>
                  </div>
                )}
              </div>
            )}

            <div className="p-5 space-y-3">
              {selected.description && (
                <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
                  {selected.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
