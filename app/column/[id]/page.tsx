import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ColumnDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  // 비공개 초안(is_active=false)도 로그인한 관리자는 미리보기 가능
  const isAdmin = await isAdminAuthenticated()
  let postQuery = supabase.from('columns').select('*').eq('id', id)
  if (!isAdmin) postQuery = postQuery.eq('is_active', true)
  const { data: post } = await postQuery.single()

  if (!post) notFound()

  const formattedDate = new Date(post.column_date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // 다른 칼럼 더 보기 — 현재 글 제외, 최신순 3개
  const { data: others } = await supabase
    .from('columns')
    .select('id, title, image_url, column_date, category')
    .eq('is_active', true)
    .neq('id', id)
    .order('column_date', { ascending: false })
    .limit(3)

  return (
    <main className="min-h-screen bg-white pt-20 sm:pt-24">
      {/* 상단 네비 */}
      <div className="max-w-[860px] mx-auto px-5 pt-4 pb-4">
        <Link href="/column" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0080C8] transition-colors">
          ← 원장칼럼 목록
        </Link>
      </div>

      {/* 대표 이미지 */}
      {post.image_url && (
        <div className="max-w-[860px] mx-auto px-5 mb-6">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full rounded-xl object-cover max-h-[420px]"
          />
        </div>
      )}

      {/* 메타 정보 */}
      <div className="max-w-[860px] mx-auto px-5 mb-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
          {post.category && (
            <span className="bg-[#0080C8]/10 text-[#0080C8] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {post.category}
            </span>
          )}
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 본문 HTML 렌더링 */}
      <article className="max-w-[860px] mx-auto px-5 pb-20">
        {post.content ? (
          <div
            className="post-wrap"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-gray-400 py-12 text-center">내용이 없습니다.</p>
        )}

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* 다른 칼럼 더 보기 — 다음 글로 자연스럽게 유도 */}
      {others && others.length > 0 && (
        <section className="border-t border-gray-100 bg-[#FAFBFC]">
          <div className="max-w-[860px] mx-auto px-5 py-14">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">다른 칼럼 더 보기</h2>
              <Link href="/column" className="text-sm text-[#0080C8] hover:underline">
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {others.map((c) => (
                <Link key={c.id} href={`/column/${c.id}`} className="group block">
                  <div className="overflow-hidden rounded-lg bg-[#F0F0F0] mb-3 aspect-[4/3]">
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt={c.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#F8F7F9]">
                        <svg className="w-10 h-10 text-[#D0D0D0]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 10.5h18" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {c.category && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#F0F7FF] text-[#0080C8] border border-[#CCE5F7] mb-2">
                      #{c.category}
                    </span>
                  )}
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 group-hover:text-[#0080C8] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] mt-1.5">
                    {new Date(c.column_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
