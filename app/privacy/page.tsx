import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침 | 서울이건치과의원',
  description: '서울이건치과의원 개인정보처리방침',
  robots: { index: false },
}

export default function PrivacyPage() {
  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-500 mb-10">시행일: 2026년 1월 1일</p>

        <div className="space-y-10 text-[15px] text-gray-700 leading-relaxed">

          {/* 전문 */}
          <section>
            <p>
              서울이건치과의원(이하 "병원")은 개인정보보호법, 의료법 및 관련 법령에 따라
              이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록
              다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
          </section>

          {/* 제1조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제1조 (개인정보의 처리 목적)
            </h2>
            <p className="mb-3">병원은 다음 목적을 위하여 개인정보를 처리합니다. 처리된 개인정보는 해당 목적 이외의 용도로는 사용되지 않으며, 목적이 변경될 경우에는 별도의 동의를 받겠습니다.</p>
            <ol className="list-decimal list-inside space-y-2 pl-1">
              <li>홈페이지 회원 가입·관리 및 본인 확인</li>
              <li>온라인 상담 접수 및 예약 안내 전화 연락</li>
              <li>진료 예약 및 진료 관련 안내</li>
              <li>서비스 개선 및 통계 분석</li>
              <li>법령상 의무 이행</li>
            </ol>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제2조 (처리하는 개인정보의 항목)
            </h2>
            <p className="mb-3">병원은 다음과 같은 개인정보 항목을 처리합니다.</p>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-800 mb-1">① 회원가입</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>필수: 아이디, 비밀번호, 이름, 휴대폰번호, 생년월일, 이메일 주소</li>
                  <li>만 14세 미만인 경우: 법정대리인의 이름, 연락처 및 동의 여부</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">② 온라인 상담 문의</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>필수: 이름, 전화번호, 문의 내용</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">③ 자동 수집 항목</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제3조 (개인정보의 처리 및 보유 기간)
            </h2>
            <p className="mb-3">병원은 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 동의 받은 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-800 mb-1">① 회원 가입 및 관리</p>
                <p className="pl-2">회원 탈퇴 시까지. 다만, 다음 사유에 해당하는 경우 해당 기간 종료 시까지 보존합니다.</p>
                <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-gray-600">
                  <li>관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우: 해당 수사·조사 종료 시까지</li>
                  <li>홈페이지 이용에 따른 채권·채무 관계 잔존 시: 해당 채권·채무 관계 정산 시까지</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">② 온라인 상담 문의</p>
                <p className="pl-2">상담 완료 후 1년 (예약 안내 목적 달성 후 지체 없이 파기 원칙)</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">③ 관계 법령에 따른 보존 기간</p>
                <ul className="list-disc list-inside pl-2 space-y-1 text-gray-600">
                  <li>의료법에 따른 진료기록: 10년</li>
                  <li>전자상거래 등에서의 소비자보호에 관한 법률: 계약·청약철회 기록 5년, 대금결제 기록 5년</li>
                  <li>통신비밀보호법에 따른 로그 기록: 3개월</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제4조 (개인정보의 제3자 제공)
            </h2>
            <p className="mb-2">병원은 정보주체의 개인정보를 제1조에서 명시한 목적 범위 내에서만 처리하며, 다음의 경우에만 제3자에게 제공합니다.</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>정보주체가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
            <p className="mt-3 text-gray-600">현재 병원은 개인정보를 제3자에게 제공하지 않습니다.</p>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제5조 (개인정보 처리의 위탁)
            </h2>
            <p>병원은 현재 개인정보 처리 업무를 외부에 위탁하지 않습니다. 향후 위탁이 발생할 경우 위탁 대상자 및 위탁 업무 내용을 이 방침에 공개하고 필요한 경우 별도의 동의를 받겠습니다.</p>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제6조 (정보주체의 권리·의무 및 행사 방법)
            </h2>
            <p className="mb-3">정보주체는 병원에 대해 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ol className="list-decimal list-inside space-y-2 pl-1">
              <li>개인정보 처리현황 통지 요구</li>
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정·삭제 요구</li>
              <li>개인정보 처리정지 요구</li>
              <li>개인정보 처리에 대한 동의 철회</li>
            </ol>
            <p className="mt-3">위 권리 행사는 서면, 전자우편, 전화 등을 통하여 하실 수 있으며, 병원은 이에 대해 지체 없이 조치하겠습니다.</p>
            <p className="mt-2">정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요청한 경우에는 정정 또는 삭제를 완료할 때까지 해당 개인정보를 이용하거나 제공하지 않습니다.</p>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제7조 (만 14세 미만 아동의 개인정보 처리)
            </h2>
            <p className="mb-2">병원은 만 14세 미만 아동에 대해 개인정보를 수집·이용·제공하는 경우 법정대리인의 동의를 받습니다.</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>회원 가입 시 생년월일을 기준으로 만 14세 미만 여부를 확인합니다.</li>
              <li>만 14세 미만인 경우 법정대리인(부모 등)의 이름, 연락처를 수집하고 동의를 받습니다.</li>
              <li>법정대리인은 아동의 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.</li>
            </ul>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제8조 (개인정보의 파기)
            </h2>
            <p className="mb-3">병원은 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 경우 지체 없이 해당 개인정보를 파기합니다.</p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-800 mb-1">① 파기 절차</p>
                <p className="pl-2">병원은 파기 사유가 발생한 개인정보를 선정하고, 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">② 파기 방법</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>전자적 파일 형태의 정보: 기록을 재생할 수 없는 기술적 방법으로 삭제</li>
                  <li>종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제9조 (개인정보의 안전성 확보 조치)
            </h2>
            <p className="mb-3">병원은 개인정보의 안전성 확보를 위하여 다음과 같은 조치를 취하고 있습니다.</p>
            <ol className="list-decimal list-inside space-y-2 pl-1">
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>개인정보에 대한 접근 제한 (비밀번호 암호화 저장)</li>
              <li>해킹 등에 대비한 기술적 대책 (방화벽, 보안 프로그램 설치)</li>
              <li>개인정보 처리시스템의 접속 기록 보관 및 위·변조 방지</li>
              <li>개인정보의 암호화 (전송 구간 SSL/TLS 적용)</li>
            </ol>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제10조 (쿠키의 설치·운영 및 거부)
            </h2>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-800 mb-1">① 쿠키 사용 목적</p>
                <p className="pl-2">병원 홈페이지(https://egundc.com)는 이용자에게 개인화된 서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">② 쿠키 거부 방법</p>
                <p className="pl-2">이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용이 어려울 수 있습니다.</p>
                <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-gray-600 text-[14px]">
                  <li>Chrome: 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</li>
                  <li>Edge: 설정 → 쿠키 및 사이트 권한</li>
                  <li>Safari: 환경설정 → 개인 정보 보호</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제11조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제11조 (개인정보 보호책임자)
            </h2>
            <p className="mb-3">병원은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            <div className="bg-gray-50 rounded-xl p-5 space-y-1.5 text-[15px]">
              <p><span className="font-semibold text-gray-700 w-24 inline-block">성명</span>이재성</p>
              <p><span className="font-semibold text-gray-700 w-24 inline-block">직책</span>대표원장</p>
              <p><span className="font-semibold text-gray-700 w-24 inline-block">전화</span>031-896-5512</p>
              <p>
                <span className="font-semibold text-gray-700 w-24 inline-block">이메일</span>
                <a href="mailto:seoulegunpub@gmail.com" className="text-[#0080C8] hover:underline">
                  seoulegunpub@gmail.com
                </a>
              </p>
            </div>
            <p className="mt-3">정보주체는 병원의 서비스를 이용하면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.</p>
          </section>

          {/* 제12조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제12조 (권익침해 구제 방법)
            </h2>
            <p className="mb-3">정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.</p>
            <div className="space-y-3 text-[14px]">
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="font-semibold text-gray-800">개인정보 침해신고센터 (한국인터넷진흥원 운영)</p>
                <p className="text-gray-600">홈페이지: privacy.kisa.or.kr</p>
                <p className="text-gray-600">전화: (국번 없이) 118</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="font-semibold text-gray-800">개인정보 분쟁조정위원회</p>
                <p className="text-gray-600">홈페이지: www.kopico.go.kr</p>
                <p className="text-gray-600">전화: 1833-6972</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="font-semibold text-gray-800">대검찰청 사이버수사과</p>
                <p className="text-gray-600">홈페이지: www.spo.go.kr</p>
                <p className="text-gray-600">전화: (국번 없이) 1301</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="font-semibold text-gray-800">경찰청 사이버수사국</p>
                <p className="text-gray-600">홈페이지: ecrm.cyber.go.kr</p>
                <p className="text-gray-600">전화: (국번 없이) 182</p>
              </div>
            </div>
          </section>

          {/* 제13조 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              제13조 (개인정보처리방침의 변경)
            </h2>
            <p>이 개인정보처리방침은 2026년 1월 1일부터 적용됩니다. 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항 시행 7일 전부터 홈페이지(https://egundc.com)를 통하여 고지합니다. 단, 정보주체의 권리에 중대한 변경이 발생할 경우에는 30일 전에 고지합니다.</p>
          </section>

          {/* 시행일 박스 */}
          <div className="border border-gray-200 rounded-xl p-5 text-center text-sm text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">서울이건치과의원</p>
            <p>공고일: 2025년 12월 25일 &nbsp;|&nbsp; 시행일: 2026년 1월 1일</p>
          </div>

        </div>
      </div>
    </main>
  )
}
