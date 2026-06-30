import type { Metadata } from 'next'
import { clinicInfo } from '@/data/clinic-info'

const CLINIC_LEGAL_NAME = '서울이건치과의원'
const EFFECTIVE_DATE = '2026년 6월 30일'

type TermsArticle = { readonly title: string; readonly paragraphs?: readonly string[]; readonly items?: readonly string[] }
type TermsChapter = { readonly title: string; readonly articles: readonly TermsArticle[] }

const TERMS_CHAPTERS = [
  {
    title: '제1장 총칙',
    articles: [
      {
        title: '제1조 (목적)',
        paragraphs: [
          `이 약관은 ${CLINIC_LEGAL_NAME}(이하 "병원")이 제공하는 홈페이지 서비스의 이용조건 및 절차, 병원과 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.`,
        ],
      },
      {
        title: '제2조 (약관의 효력과 변경)',
        paragraphs: [
          '(1) 이 약관은 홈페이지에 게시하거나 이용자에게 공지함으로써 효력이 발생합니다.',
          '(2) 병원은 관계 법령을 위반하지 않는 범위에서 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 전항과 같은 방법으로 공지합니다.',
          '(3) 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하거나 회원 탈퇴를 요청할 수 있습니다.',
        ],
      },
      {
        title: '제3조 (약관 외 준칙)',
        paragraphs: [
          '이 약관에 명시되지 않은 사항은 개인정보보호법, 의료법, 전기통신사업법 등 관계 법령과 일반 상관례에 따릅니다.',
        ],
      },
      {
        title: '제4조 (병원 정보)',
        items: [
          `상호명: ${CLINIC_LEGAL_NAME}`,
          `대표자: ${clinicInfo.representative}`,
          `전화번호: ${clinicInfo.phone}`,
          `주소: ${clinicInfo.address}`,
        ],
      },
    ],
  },
  {
    title: '제2장 회원 가입과 서비스 이용',
    articles: [
      {
        title: '제1조 (회원의 정의)',
        paragraphs: [
          '회원이란 병원이 회원으로 적합하다고 인정하는 개인으로, 본 약관에 동의하고 회원가입 양식을 작성한 뒤 아이디와 비밀번호를 발급받은 사람을 말합니다.',
        ],
      },
      {
        title: '제2조 (서비스 가입의 성립)',
        paragraphs: [
          '(1) 서비스 가입은 이용자의 이용 신청에 대한 병원의 승낙과 이용자의 약관 동의로 성립됩니다.',
          '(2) 회원으로 가입하여 서비스를 이용하고자 하는 이용자는 병원이 요청하는 이름, 연락처, 생년월일, 이메일 등 필요한 정보를 제공해야 합니다.',
          '(3) 병원이 가입 신청을 승낙한 경우, 병원은 회원 아이디와 서비스 이용에 필요한 내용을 이용자에게 안내합니다.',
          '(4) 가입 시 입력한 아이디는 원칙적으로 변경할 수 없으며, 한 사람에게 하나의 아이디가 발급됩니다.',
          '(5) 병원은 다음 각 호에 해당하는 가입 신청을 승낙하지 않을 수 있습니다.',
        ],
        items: [
          '다른 사람의 명의를 사용하여 신청한 경우',
          '본인의 실명 또는 정확한 정보를 사용하지 않은 경우',
          '가입 신청서의 내용을 허위로 기재한 경우',
          '공공질서 또는 미풍양속을 저해할 목적으로 신청한 경우',
          '기타 병원이 정한 이용 조건을 충족하지 못한 경우',
        ],
      },
      {
        title: '제3조 (서비스 이용 및 제한)',
        paragraphs: [
          '(1) 서비스 이용은 병원의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.',
          '(2) 시스템 정기점검, 긴급 보수, 서비스 운영상 필요한 경우 병원은 사전 또는 사후 공지를 통해 서비스 이용을 제한할 수 있습니다.',
          '(3) 온라인 상담은 담당 의료진 또는 관리자의 일정, 진료 상황, 문의 내용에 따라 답변 시간이 달라질 수 있습니다.',
        ],
      },
      {
        title: '제4조 (서비스 이용료)',
        paragraphs: [
          '(1) 홈페이지 서비스는 회원으로 등록한 이용자에게 무료로 제공됩니다.',
          '(2) 병원이 특정 서비스를 유료로 전환할 경우 유료화 시기, 정책, 비용을 시행 전에 홈페이지에 공지합니다.',
        ],
      },
    ],
  },
  {
    title: '제3장 서비스 탈퇴, 재가입 및 이용 제한',
    articles: [
      {
        title: '제1조 (서비스 탈퇴)',
        paragraphs: [
          '(1) 회원이 서비스 탈퇴를 원하는 경우 회원 본인이 홈페이지 또는 병원이 안내하는 연락 수단을 통해 해지 신청을 할 수 있습니다.',
          '(2) 병원은 이름, 아이디, 전화번호, 이메일 등 회원정보와 일치 여부를 확인한 뒤 탈퇴 절차를 진행합니다.',
          '(3) 탈퇴 처리가 완료되면 기존 아이디와 비밀번호로 로그인이 제한됩니다.',
        ],
      },
      {
        title: '제2조 (서비스 재가입)',
        paragraphs: [
          '(1) 탈퇴한 이용자가 재가입을 원할 경우 회원 본인이 병원이 안내하는 절차에 따라 재가입을 신청할 수 있습니다.',
          '(2) 재가입 요청 시 병원은 본인 확인에 필요한 정보를 확인한 뒤 재가입 가능 여부를 안내합니다.',
          '(3) 기존 아이디의 사용 가능 여부는 서비스 운영 정책과 개인정보 보관 상태에 따라 달라질 수 있습니다.',
        ],
      },
      {
        title: '제3조 (서비스 이용 제한)',
        paragraphs: [
          '병원은 회원이 다음 사항에 해당하는 행위를 한 경우 사전 통지 없이 이용계약을 해지하거나 기간을 정하여 서비스 이용을 중지할 수 있습니다.',
        ],
        items: [
          '공공질서 및 미풍양속에 반하는 행위',
          '범죄 행위와 관련되는 행위',
          '국익 또는 사회적 공익을 저해할 목적으로 서비스를 이용하는 행위',
          '타인의 아이디 및 비밀번호를 도용하는 행위',
          '타인의 명예를 손상시키거나 불이익을 주는 행위',
          '동일 이용자가 여러 아이디로 중복 등록하는 행위',
          '서비스에 위해를 가하거나 건전한 이용을 저해하는 행위',
          '기타 관계 법령 또는 병원이 정한 이용 조건을 위반하는 행위',
        ],
      },
    ],
  },
  {
    title: '제4장 서비스에 관한 책임의 제한',
    articles: [
      {
        title: '제1조 (온라인 상담)',
        paragraphs: [
          '(1) 병원은 상담 내용이 담당 의료진과 서비스 관리자를 제외한 제3자에게 유출되지 않도록 보안을 유지하기 위해 노력합니다. 다만 다음 각 호의 경우 병원의 책임이 제한될 수 있습니다.',
        ],
        items: [
          '이용자의 부주의로 아이디, 비밀번호 등 접속 정보가 유출되어 상담 내용이 공개된 경우',
          '이용자가 삭제 기능을 사용하거나 직접 요청하여 상담 내용이 삭제된 경우',
          '천재지변, 장애, 해킹 등 병원이 통제하기 어려운 사유로 상담 내용이 공개되거나 상실된 경우',
        ],
      },
      {
        title: '제2조 (상담 내용의 활용)',
        paragraphs: [
          '(1) 회원이 신청한 상담에 대한 종합적이고 적절한 답변을 위하여 담당 의료진과 관리자는 상담 내용과 답변을 참고할 수 있습니다.',
          '(2) 서비스에서 진행된 상담 내용은 개인을 알아볼 수 없도록 처리한 뒤, 법령과 내부 기준에 따라 학술활동, 저작활동, FAQ 등 서비스 개선 목적으로 활용될 수 있습니다.',
          '(3) 상담 답변은 담당 의료진의 의학적 지식과 경험을 바탕으로 한 답변이며, 개별 진단이나 대면 진료를 대신하지 않습니다.',
          '(4) 같은 내용의 상담을 반복 신청하거나 상식에 어긋나는 표현을 사용하는 경우 온라인 상담의 전부 또는 일부가 제한될 수 있습니다.',
        ],
      },
      {
        title: '제3조 (정보 서비스)',
        paragraphs: [
          '(1) 홈페이지에서 제공하는 내용은 일반적인 의료 정보 제공을 위한 것으로, 의학적 진단·진료·치료를 대신하지 않습니다.',
          '(2) 건강 상태에 대한 의문이나 걱정이 있는 경우 실제 의료진과 상담하여 정확한 진단을 받아야 합니다.',
          '(3) 홈페이지의 정보만을 근거로 의료진의 진단을 무시하거나 진료 또는 치료를 미루어서는 안 됩니다.',
          '(4) 병원은 홈페이지에서 특정 검사, 제품 또는 치료법을 일반 이용자에게 일괄적으로 추천하지 않으며, 서비스 정보의 이용은 이용자의 판단과 책임에 따릅니다.',
        ],
      },
    ],
  },
  {
    title: '제5장 의무',
    articles: [
      {
        title: '제1조 (병원의 의무)',
        paragraphs: [
          '(1) 병원은 특별한 사정이 없는 한 회원이 서비스를 안정적으로 이용할 수 있도록 노력합니다.',
          '(2) 병원은 이 약관에서 정한 바에 따라 계속적이고 안정적인 서비스를 제공하기 위해 노력합니다.',
          '(3) 병원은 회원이 정해진 절차에 따라 제기한 의견을 적절한 절차로 처리하며, 처리에 일정 기간이 필요한 경우 그 사유와 일정을 안내합니다.',
        ],
      },
      {
        title: '제2조 (회원정보 보안의 의무)',
        paragraphs: [
          '(1) 회원의 아이디와 비밀번호에 관한 관리 책임은 회원에게 있습니다.',
          '(2) 회원은 자신의 아이디가 부정하게 사용된 사실을 알게 된 경우 즉시 병원에 알려야 합니다.',
          '(3) 병원은 이용자의 사전 동의 또는 법령상 근거 없이 개인정보를 제3자에게 제공하지 않습니다.',
          '(4) 게시판 등 공개된 커뮤니케이션 공간에 이용자가 자발적으로 개인정보를 공개한 경우, 해당 정보가 제3자에 의해 수집·이용될 수 있으므로 이용자는 개인정보 공개에 주의해야 합니다.',
          '(5) 병원은 서비스 이용 편의를 위해 쿠키를 사용할 수 있습니다. 이용자는 웹 브라우저 설정을 통해 쿠키 저장 여부를 조절할 수 있습니다.',
          '(6) 개인정보 처리에 관한 자세한 사항은 병원의 개인정보처리방침을 따릅니다.',
        ],
      },
    ],
  },
  {
    title: '제6장 분쟁조정',
    articles: [
      {
        title: '제1조 (분쟁 해결)',
        paragraphs: [
          '(1) 이 약관에 규정된 사항 외에 서비스 이용과 관련하여 발생한 분쟁은 가능한 한 병원과 이용자가 상호 협의하여 해결합니다.',
          '(2) 서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 관계 법령에 따른 관할법원을 관할법원으로 합니다.',
        ],
      },
    ],
  },
] as const satisfies readonly TermsChapter[]

export const metadata: Metadata = {
  title: `이용약관 | ${CLINIC_LEGAL_NAME}`,
  description: `${CLINIC_LEGAL_NAME} 홈페이지 이용약관`,
  robots: { index: false },
}

function renderArticle(article: TermsArticle) {
  return (
    <section key={article.title} className="space-y-3">
      <h3 className="text-[20px] font-bold text-gray-900">{article.title}</h3>
      {article.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {article.items ? (
        <ul className="list-disc space-y-2 pl-6">
          {article.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default function TermsPage() {
  return (
    <main className="bg-white pb-20 pt-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">이용약관</h1>
        <p className="mb-10 text-[18px] text-gray-500">시행일: {EFFECTIVE_DATE}</p>

        <div className="space-y-12 text-[18px] leading-relaxed text-gray-700">
          <section>
            <p>{CLINIC_LEGAL_NAME}(이하 "병원")은 홈페이지 서비스를 이용하는 모든 분이 약관을 쉽게 확인할 수 있도록 다음과 같이 이용약관을 공개합니다.</p>
          </section>

          {TERMS_CHAPTERS.map((chapter) => (
            <section key={chapter.title} className="space-y-6">
              <h2 className="border-b border-gray-200 pb-2 text-[22px] font-bold text-gray-900">{chapter.title}</h2>
              <div className="space-y-8">
                {chapter.articles.map((article) => renderArticle(article))}
              </div>
            </section>
          ))}

          <section className="space-y-3">
            <h2 className="border-b border-gray-200 pb-2 text-[22px] font-bold text-gray-900">부칙</h2>
            <p>이 약관은 {EFFECTIVE_DATE}부터 시행합니다.</p>
          </section>

          <div className="rounded-xl border border-gray-200 p-5 text-center text-[18px] text-gray-500">
            <p className="mb-1 font-semibold text-gray-700">{CLINIC_LEGAL_NAME}</p>
            <p className="flex flex-col gap-1 sm:block">
              <span>공고일: {EFFECTIVE_DATE}</span>
              <span className="hidden sm:inline"> &nbsp;|&nbsp; </span>
              <span>시행일: {EFFECTIVE_DATE}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
