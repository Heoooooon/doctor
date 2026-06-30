'use client'

import { clinicInfo } from '@/data/clinic-info'
import { Clock } from 'lucide-react'

export default function ScheduleSection() {
  const mainTab = clinicInfo.scheduleTabs.find((tab) => tab.id === 'main')!

  return (
    <section
      id="schedule"
      className="py-12 sm:py-28 bg-white scroll-mt-36"
      aria-labelledby="schedule-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#0080C8] mb-4">
          Hours
        </p>
        <h2
          id="schedule-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-12"
        >
          진료일정
        </h2>

        {/* 콘텐츠 */}
        {/* 시간표 */}
        <div className="max-w-2xl">
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="bg-[#0080C8] px-6 py-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" aria-hidden="true" />
              <h3 className="text-white font-semibold text-sm">
                진료시간
              </h3>
            </div>

            <ul>
              {mainTab.hours.map((row, i) => (
                <li
                  key={row.day}
                  className={`flex items-center gap-2 px-5 py-3 text-sm ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                  } ${row.isClosed ? 'opacity-50' : ''}`}
                >
                  <span className="font-medium text-gray-700 w-[4.5rem] shrink-0">
                    {row.day}
                  </span>
                  <span className={`whitespace-nowrap ${row.isClosed ? 'text-gray-400' : 'text-gray-800'}`}>
                    {row.hours}
                  </span>
                  {row.note && (
                    <span className="shrink-0 text-xs font-medium bg-[#0080C8]/10 text-[#0080C8] px-2 py-0.5 rounded-full whitespace-nowrap">
                      {row.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 진료 안내 + 예약 카드 — 섹션 맨 아래 */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mainTab.notice && mainTab.notice.length > 0 && (
            <div className="bg-[#0080C8]/5 border border-[#0080C8]/20 rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-[#0080C8] mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0080C8] text-white flex items-center justify-center text-xs">
                  i
                </span>
                진료 안내
              </h4>
              <ul className="space-y-2">
                {mainTab.notice.map((note, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 flex items-start gap-2"
                  >
                    <span className="text-[#0080C8] mt-0.5">·</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 예약 카드 */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white">
            <h4 className="font-semibold mb-2">예약 후 방문을 권장합니다</h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              대기 시간 없이 편안하게 진료받으실 수 있도록 사전 예약을
              권장드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${clinicInfo.phone.replace(/-/g, '')}`}
                className="flex-1 bg-[#0080C8] text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-[#A08968] transition-colors"
              >
                {clinicInfo.phone}
              </a>
              <a
                href={clinicInfo.socialLinks.kakao}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#FEE500] text-[#3C1E1E] text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-[#f5db00] transition-colors"
              >
                카카오로 예약
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
