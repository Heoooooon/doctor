import type { Metadata } from 'next'
import Image from 'next/image'
import SignupForm from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: '회원가입 | 서울이건치과',
  description: '서울이건치과 회원가입 - 온라인 상담 및 예약 서비스를 이용하실 수 있습니다.',
  robots: { index: false, follow: true },
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/images/logo/egun-logo.png"
            alt="서울이건치과"
            width={1000}
            height={400}
            className="h-6 mx-auto mb-4 w-auto"
          />
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-sm text-gray-500 mt-1">서울이건치과 온라인 서비스</p>
        </div>
        <SignupForm />
      </div>
    </main>
  )
}
