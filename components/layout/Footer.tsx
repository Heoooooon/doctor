import Link from 'next/link'
import { clinicInfo } from '@/data/clinic-info'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer bg-[#0a0c0f] text-white/55 border-t border-white/10">
      <div className="site-footer-inner max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 py-7 sm:py-8">

        {/* 상단: 로고 + 바로가기 링크 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <p className="footer-brand-ko text-white font-extrabold text-[18px] tracking-tight">서울이건치과</p>
            <p className="footer-brand-en text-white/35 text-[18px] tracking-[0.18em] uppercase mt-1">
              Seoul Egun Dental Clinic
            </p>
          </div>
          <div className="footer-links flex flex-wrap items-center gap-x-4 gap-y-2 text-[18px]">
            <Link href="/privacy" className="inline-flex min-h-11 sm:min-h-0 items-center text-white/60 hover:text-[#38b6ff] transition-colors">
              개인정보처리방침
            </Link>
            <span className="text-white/15">|</span>
            <Link href="/terms" className="inline-flex min-h-11 sm:min-h-0 items-center text-white/60 hover:text-[#38b6ff] transition-colors">
              이용약관
            </Link>
            <span className="text-white/15">|</span>
            <a
              href={clinicInfo.socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 sm:min-h-0 items-center text-white/60 hover:text-[#38b6ff] transition-colors"
            >
              유튜브
            </a>
            <span className="text-white/15">|</span>
            <a
              href={clinicInfo.socialLinks.blog}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 sm:min-h-0 items-center text-white/60 hover:text-[#38b6ff] transition-colors"
            >
              블로그
            </a>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="footer-meta flex flex-wrap items-center gap-x-3 gap-y-2 text-[18px] text-white/45 mt-6">
          <span><span className="text-white/30">대표</span> {clinicInfo.representative}</span>
          <span className="text-white/15">|</span>
          <span><span className="text-white/30">사업자명</span> 서울이건치과의원</span>
          <span className="text-white/15">|</span>
          <span><span className="text-white/30">사업자번호</span> {clinicInfo.businessNumber}</span>
          <span className="text-white/15">|</span>
          <span>
            <span className="text-white/30">TEL</span>{' '}
            <a href={`tel:${clinicInfo.phone}`} className="hover:text-[#38b6ff] transition-colors">
              {clinicInfo.phone}
            </a>
          </span>
          <span className="text-white/15">|</span>
          <span><span className="text-white/30">FAX</span> {clinicInfo.fax}</span>
        </div>
        <p className="footer-address text-[18px] text-white/45 mt-2">
          <span className="text-white/30">주소</span> {clinicInfo.address}
        </p>

        {/* 면책 + 저작권 */}
        <p className="footer-disclaimer text-[18px] text-white/30 leading-relaxed mt-5">
          본 페이지의 내용은 의료법에 따라 참고용 정보이며, 정확한 진단과 치료는 내원 상담을 통해 결정됩니다.
        </p>
        <p className="footer-copyright text-[18px] text-white/30 mt-2 tracking-wide">
          COPYRIGHT &copy; {currentYear} {clinicInfo.name}. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  )
}
