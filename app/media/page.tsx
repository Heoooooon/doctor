// @TASK Board - 이건미디어 페이지
import type { Metadata } from 'next'
import {
  MessageCircle,
  Star,
  BookOpen,
  Youtube,
  ExternalLink,
} from 'lucide-react'
import { clinicInfo } from '@/data/clinic-info'

export const metadata: Metadata = {
  title: '이건미디어 | 환자후기·이건TV - 서울이건치과',
  description:
    '카카오톡 상담, 환자후기, 원장칼럼, 이건TV를 통해 수원 영통 서울이건치과를 만나보세요.',
  keywords: ['서울이건치과 후기', '수원치과 후기', '이건TV', '서울이건치과 미디어'],
  alternates: { canonical: 'https://egundc.com/media' },
}

const MEDIA_SECTIONS = [
  {
    id: 'kakao',
    icon: MessageCircle,
    title: '카카오톡 상담',
    description:
      '궁금한 점이 있으시면 편하게 카카오톡으로 문의해주세요. 빠르고 친절하게 답변드리겠습니다.',
    href: clinicInfo.socialLinks.kakao,
    linkText: '카카오톡 상담하기',
    color: 'bg-[#FAE300]',
    iconColor: 'text-gray-800',
    textColor: 'text-gray-900',
  },
  {
    id: 'reviews',
    icon: Star,
    title: '실제 환자후기',
    description:
      '서울이건치과에서 치료받으신 환자분들의 솔직한 후기를 네이버 플레이스에서 확인해보세요.',
    href: clinicInfo.socialLinks.naverPlace,
    linkText: '네이버 플레이스에서 후기 보기',
    color: 'bg-[#03C75A]',
    iconColor: 'text-white',
    textColor: 'text-white',
  },
  {
    id: 'column',
    icon: BookOpen,
    title: '이원장칼럼',
    description:
      '이재성 원장이 직접 작성하는 치과 칼럼입니다. 치료 정보와 구강 건강 관리 팁을 전해드립니다.',
    href: clinicInfo.socialLinks.blog,
    linkText: '블로그에서 칼럼 읽기',
    color: 'bg-[#03C75A]',
    iconColor: 'text-white',
    textColor: 'text-white',
  },
  {
    id: 'tv',
    icon: Youtube,
    title: '이건TV',
    description:
      '치료 과정, 치과 상식, 의료진 인터뷰 등 다양한 영상 콘텐츠를 이건TV에서 만나보세요.',
    href: clinicInfo.socialLinks.youtube,
    linkText: '유튜브에서 영상 보기',
    color: 'bg-[#FF0000]',
    iconColor: 'text-white',
    textColor: 'text-white',
  },
]

export default function MediaPage() {
  return (
    <>
      {/* 페이지 헤더 */}
      <section className="relative flex items-center justify-center min-h-[220px] sm:min-h-[280px] overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#2B2D42] via-[#0080C8] to-[#006EAA]"
          aria-hidden="true"
        />
        <div className="relative z-10 text-center px-4 py-12 sm:py-16">
          <p className="text-white/70 text-sm tracking-widest uppercase mb-2 font-medium">
            Seoul Egun Media
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            이건미디어
          </h1>
          <p className="text-white/75 text-base mt-2">
            다양한 채널에서 서울이건치과를 만나보세요
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        {MEDIA_SECTIONS.map(
          ({ id, icon: Icon, title, description, href, linkText, color, iconColor, textColor }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row">
                  {/* 아이콘 영역 */}
                  <div
                    className={`${color} flex items-center justify-center p-8 sm:p-10 sm:w-48 shrink-0`}
                  >
                    <Icon size={48} className={iconColor} />
                  </div>

                  {/* 텍스트 영역 */}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {title}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0080C8] group-hover:text-[#2B2D42] transition-colors">
                      {linkText}
                      <ExternalLink size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ),
        )}
      </main>
    </>
  )
}
