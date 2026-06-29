import Link from 'next/link'
import { clinicInfo } from '@/data/clinic-info'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white text-gray-800 border-t border-gray-100">

      {/* 하단 바 — 사업자 정보 + 면책 + 저작권 */}
      <div className="border-t border-gray-100 bg-gray-50 px-6 lg:px-10 py-5">
        <div className="max-w-7xl mx-auto">
          {/* 사업자 정보 한 줄 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] text-gray-400 mb-2">
            <span><span className="text-gray-300">대표</span> {clinicInfo.representative}</span>
            <span className="text-gray-200">|</span>
            <span><span className="text-gray-300">주소</span> {clinicInfo.address}</span>
            <span className="text-gray-200">|</span>
            <span>
              <span className="text-gray-300">전화</span>{' '}
              <a href={`tel:${clinicInfo.phone}`} className="hover:text-[#0080C8] transition-colors">
                {clinicInfo.phone}
              </a>
            </span>
            <span className="text-gray-200">|</span>
            <span><span className="text-gray-300">팩스</span> {clinicInfo.fax}</span>
            <span className="text-gray-200">|</span>
            <span><span className="text-gray-300">사업자명</span> 서울이건치과의원</span>
            <span className="text-gray-200">|</span>
            <span><span className="text-gray-300">사업자번호</span> {clinicInfo.businessNumber}</span>
          </div>

          {/* 면책 + 저작권 */}
          <p className="text-[8px] text-gray-300 leading-relaxed">
            본 페이지의 내용은 의료법에 따라 참고용 정보이며, 정확한 진단과 치료는 내원 상담을 통해 결정됩니다.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[8px] text-gray-300">
              &copy; {currentYear} {clinicInfo.name}. All rights reserved.
            </p>
            <span className="text-gray-200 text-[8px]">|</span>
            <Link href="/privacy" className="text-[8px] text-gray-400 hover:text-[#0080C8] transition-colors">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>

    </footer>
  )
}
