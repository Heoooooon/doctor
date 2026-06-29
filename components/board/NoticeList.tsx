'use client'

import { useState } from 'react'

interface Notice {
  id: string
  title: string
  content: string | null
  image_url: string | null
  notice_date: string
}

const INITIAL_COUNT = 3

export default function NoticeList({ notices }: { notices: Notice[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const visibleNotices = expanded ? notices : notices.slice(0, INITIAL_COUNT)
  const hasMore = notices.length > INITIAL_COUNT

  const handleNoticeClick = (notice: Notice) => {
    if (!notice.image_url) {
      setOpenId(openId === notice.id ? null : notice.id)
      return
    }

    document.getElementById(`notice-image-${notice.id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900">공지 목록</h2>
      </div>
      <ol className="divide-y divide-gray-200">
        {visibleNotices.map((notice, index) => (
          <li key={notice.id}>
            <button
              type="button"
              className="w-full flex gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 sm:px-6"
              onClick={() => handleNoticeClick(notice)}
            >
              <span className="w-10 flex-shrink-0 text-base font-semibold text-[#0080C8] tabular-nums">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <span className="min-w-0 text-base sm:text-lg font-semibold text-gray-900">
                {notice.title}
              </span>
            </button>

            {openId === notice.id && !notice.image_url && notice.content && (
              <div className="bg-gray-50 px-5 pb-4 pt-2 sm:px-6 sm:pb-5">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </p>
              </div>
            )}
          </li>
        ))}
      </ol>

      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full border-t border-gray-200 py-4 text-sm font-semibold text-[#0080C8] transition-colors hover:bg-[#EAF4FC]"
        >
          더 보기 ({notices.length - INITIAL_COUNT})
        </button>
      )}
      {hasMore && expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="w-full border-t border-gray-200 py-4 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50"
        >
          접기
        </button>
      )}
    </div>
  )
}
