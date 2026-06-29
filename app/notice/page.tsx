import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import NoticeList from '@/components/board/NoticeList'
import { readFile } from 'fs/promises'
import path from 'path'

interface Notice {
  id: string
  title: string
  content: string | null
  image_url: string | null
  notice_date: string
}

interface NoticePageProps {
  searchParams?: Promise<{
    page?: string
  }>
}

const juneScheduleNotices: Notice[] = [
  {
    id: 'june-main-clinic-schedule',
    title: '6월 본관 진료안내',
    content: '6월 본관 원장님 진료일정 안내입니다.',
    image_url: '/uploads/notices/june-doctor-schedule-1.png',
    notice_date: '2026-06-01',
  },
  {
    id: 'june-annex-clinic-schedule',
    title: '6월 별관 진료안내',
    content: '6월 별관 원장님 진료일정 안내입니다.',
    image_url: '/uploads/notices/june-doctor-schedule-2.png',
    notice_date: '2026-06-01',
  },
]

async function readLocalNotices(): Promise<Notice[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'local-notices.json')
    const items = JSON.parse(await readFile(filePath, 'utf8')) as Array<
      Notice & { is_active?: boolean }
    >

    return items.filter((item) => item.is_active !== false)
  } catch {
    return []
  }
}

export const metadata = {
  title: '공지사항 | 수원치과 서울이건치과',
  description: '수원치과 서울이건치과의 최신 공지사항, 휴무일정, 진료안내를 확인하세요.',
  keywords: ['서울이건치과 공지', '수원치과 휴무', '서울이건치과 진료시간'],
  alternates: { canonical: 'https://egundc.com/notice' },
}

export default async function NoticePage({ searchParams }: NoticePageProps) {
  const params = await searchParams
  let notices: Notice[] = []

  if (hasSupabaseConfig()) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('notice_date', { ascending: false })

    notices = data || []
  } else {
    notices = await readLocalNotices()
  }

  const items: Notice[] = notices.length > 0 ? notices : juneScheduleNotices

  const recentItems = items
  const imageNotices = items.filter((n) => n.image_url)
  const imagesPerPage = 5
  const requestedPage = Number(params?.page || '1')
  const totalImagePages = Math.max(1, Math.ceil(imageNotices.length / imagesPerPage))
  const currentImagePage = Math.min(
    Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1),
    totalImagePages,
  )
  const imagePageStart = (currentImagePage - 1) * imagesPerPage
  const pagedImageNotices = imageNotices.slice(
    imagePageStart,
    imagePageStart + imagesPerPage,
  )

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          이건공지
        </h1>
        <p className="mt-3 text-gray-500">
          서울이건치과의 소식을 알려드립니다.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          등록된 공지사항이 없습니다.
        </div>
      ) : (
        <div className="space-y-14">
          <NoticeList notices={recentItems} />

          {imageNotices.length > 0 && (
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    공지 이미지
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    등록된 이미지를 최신순으로 원본 비율 그대로 보여드립니다.
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {pagedImageNotices.map((notice) => (
                  <article
                    key={notice.id}
                    id={`notice-image-${notice.id}`}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <h3 className="text-base font-semibold text-gray-900">
                        {notice.title}
                      </h3>
                      <time className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(notice.notice_date)}
                      </time>
                    </div>
                    <div className="bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
                      <img
                        src={notice.image_url!}
                        alt={notice.title}
                        className="mx-auto h-auto max-w-full rounded-md border border-gray-100 bg-white md:max-h-[80vh] md:w-auto md:object-contain"
                      />
                    </div>
                  </article>
                ))}
              </div>

              {totalImagePages > 1 && (
                <nav
                  aria-label="공지 이미지 페이지"
                  className="mt-8 flex justify-center gap-2"
                >
                  {Array.from({ length: totalImagePages }, (_, index) => {
                    const page = index + 1
                    const isCurrent = page === currentImagePage

                    return (
                      <Link
                        key={page}
                        href={`/notice?page=${page}`}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={[
                          'flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors',
                          isCurrent
                            ? 'border-[#0080C8] bg-[#0080C8] text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#0080C8] hover:text-[#0080C8]',
                        ].join(' ')}
                      >
                        {page}
                      </Link>
                    )
                  })}
                </nav>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
