'use client'

import { useEffect, useState, useMemo } from 'react'

interface Column {
  id: string
  title: string
  image_url: string | null
  column_date: string
  category: string | null
  tags: string[] | null
}

const CATEGORIES = ['전체', '자연치아살리기', '임플란트', '심미보철', '교정치료', '소아치과', '일반진료']

function formatDate(dateStr: string) {
  return dateStr.replace(/-/g, '. ')
}

function PostCard({ post }: { post: Column }) {
  const tag = post.category ?? '원장칼럼'
  return (
    <article className="group cursor-pointer">
      <a href={`/column/${post.id}`}>
        {/* 이미지 — 원본 비율 유지 */}
        <div className="overflow-hidden rounded-lg bg-[#F0F0F0] mb-3">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="w-full aspect-[4/3] flex items-center justify-center bg-[#F8F7F9]">
              <svg className="w-10 h-10 text-[#D0D0D0]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 10.5h18" />
              </svg>
            </div>
          )}
        </div>
        {/* 태그 */}
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#F0F7FF] text-[#0080C8] border border-[#CCE5F7] mb-2">
          #{tag}
        </span>
        {/* 제목 */}
        <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 mb-1.5 group-hover:text-[#0080C8] transition-colors">
          {post.title}
        </h3>
        {/* 날짜 */}
        <p className="text-xs text-[#9CA3AF]">{formatDate(post.column_date)}</p>
      </a>
    </article>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-gray-100 mb-3" />
      <div className="h-5 bg-gray-100 rounded-full w-1/4 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-4/5 mb-1" />
      <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
  )
}

export default function ColumnBoard() {
  const [posts, setPosts] = useState<Column[]>([])
  const [selected, setSelected] = useState('전체')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/columns')
      .then((r) => r.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => (selected === '전체' ? posts : posts.filter((p) => p.category === selected)),
    [posts, selected],
  )

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 전체: posts.length }
    CATEGORIES.slice(1).forEach((cat) => {
      counts[cat] = posts.filter((p) => p.category === cat).length
    })
    return counts
  }, [posts])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((p) => p.tags?.forEach((t) => set.add(t)))
    return Array.from(set).slice(0, 10)
  }, [posts])

  const popularPosts = posts.slice(0, 7)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3 mb-10">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Blog</h1>
        {selected !== '전체' && (
          <>
            <span className="text-[#D0D0D0] text-xl">|</span>
            <span className="text-xl font-bold text-[#1a1a1a]">{selected}</span>
          </>
        )}
      </div>

      {/* ── 모바일 카테고리 그리드 (lg 미만) ── */}
      <div className="lg:hidden mb-8 grid grid-cols-3 border-t border-l border-gray-200">
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat
          return (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`border-r border-b border-gray-200 py-3.5 px-2 text-[14px] text-center transition-colors ${
                isActive
                  ? 'bg-[#6B7280] text-white font-bold'
                  : 'bg-white text-[#555] font-medium hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* ── Sidebar ── */}
        <aside className="lg:w-52 flex-shrink-0">
          {/* 카테고리 (데스크탑 전용 — 모바일은 상단 그리드 사용) */}
          <div className="mb-10 hidden lg:block">
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] ?? 0
                const isActive = selected === cat
                return (
                  <li key={cat}>
                    <button
                      onClick={() => setSelected(cat)}
                      className={`w-full flex justify-between items-center text-[15px] py-0.5 transition-colors ${
                        isActive
                          ? 'font-bold text-[#1a1a1a]'
                          : 'font-medium text-[#9CA3AF] hover:text-[#1a1a1a]'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={isActive ? 'text-[#1a1a1a] font-bold' : 'text-[#9CA3AF]'}>
                        {count}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* 인기 태그 Top 10 */}
          {allTags.length > 0 && (
            <div className="mb-10">
              <p className="text-[13px] font-bold text-[#1a1a1a] mb-3">인기 태그 Top 10</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#F0F7FF] text-[#0080C8] border border-[#CCE5F7] hover:bg-[#CCE5F7] transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 인기 게시물 */}
          {popularPosts.length > 0 && (
            <div className="mb-10">
              <p className="text-[13px] font-bold text-[#1a1a1a] mb-3">인기 게시물</p>
              <ol className="space-y-3">
                {popularPosts.map((post, i) => (
                  <li key={post.id}>
                    <a
                      href={`/column/${post.id}`}
                      className="flex items-start gap-2.5 text-[13px] font-medium text-[#555] leading-snug hover:text-[#0080C8] transition-colors"
                    >
                      <span className="flex-shrink-0 w-[20px] h-[20px] rounded-full bg-[#0080C8] text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      {post.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

        </aside>

        {/* ── Post Grid ── */}
        <section className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-[#9CA3AF]">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-base font-medium">해당 카테고리에 게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {filtered.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
