import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/server'
import { hasSupabaseConfig } from '@/lib/supabase/config'

interface DoctorGroupSettings {
  desktop_image: string
  mobile_image: string
  headline: string
  subcopy: string
  button_text: string
  /** 비우면 subcopy 사용 */
  mobile_subcopy: string
  /** 비우면 button_text 사용 */
  mobile_button_text: string
}

const DEFAULTS: DoctorGroupSettings = {
  desktop_image: '/images/doctors/doctors-team-desktop.webp',
  mobile_image: '/images/doctors/doctor-team-mobile.webp',
  headline: '한자리에서\n변하지 않는 마음',
  subcopy: '서울대학교 출신 2인 대표원장이\n처음 상담부터 차분히 설명합니다',
  button_text: '자세히보기',
  mobile_subcopy: '마음을 담아 정성을 다하여',
  mobile_button_text: '이건진료진 소개',
}

async function getSettings(): Promise<DoctorGroupSettings> {
  if (!hasSupabaseConfig()) return DEFAULTS
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('section_settings')
      .select('value')
      .eq('key', 'doctor-group')
      .single()
    if (error || !data?.value) return DEFAULTS
    return { ...DEFAULTS, ...(data.value as Partial<DoctorGroupSettings>) }
  } catch {
    return DEFAULTS
  }
}

/** 줄바꿈(\n)을 <br />로 렌더 */
function BrText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  )
}

export default async function DoctorGroup() {
  const s = await getSettings()

  return (
    <section className="relative w-full overflow-hidden bg-[#F8F7F9] aspect-[390/640] md:aspect-auto md:h-dvh">

      {/* ── 모바일 이미지 (하단바 높이만큼 위로 올려 인물 전체 노출) ── */}
      <div
        className="md:hidden absolute inset-x-0 top-0 overflow-hidden"
        style={{ bottom: 'var(--mobile-bottom-bar-height)' }}
      >
        <Image
          src={s.mobile_image}
          alt="서울이건치과 의료진"
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
        {/* 상단 텍스트 영역만 살짝 어둡게 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%)',
          }}
        />
      </div>

      {/* ── 데스크탑 이미지 ── */}
      <Image
        src={s.desktop_image}
        alt="서울이건치과 의료진"
        fill
        sizes="100vw"
        className="hidden md:block object-cover"
        style={{
          objectPosition: '72% 58%',
          transform: 'scale(1.06) translateY(-3%)',
        }}
      />

      <div className="hidden md:block absolute inset-y-0 left-0 z-[1] w-[44%] bg-gradient-to-r from-[#F8F7F9]/95 via-[#F8F7F9]/78 to-transparent" />

      {/* ── 모바일 텍스트 + 버튼 (상단 가운데 정렬) ── */}
      <div
        className="md:hidden absolute inset-x-0 z-10 flex flex-col items-center text-center px-7"
        style={{ top: 'calc(var(--mobile-header-height) + 80px)' }}
      >
        <h2 className="text-white text-[28px] font-bold leading-tight tracking-normal">
          <BrText text={s.headline} />
        </h2>

        <div className="w-10 h-[1.5px] bg-white/50 my-4" />

        <p className="text-white/75 text-[18px] font-light leading-snug mb-6">
          <BrText text={s.mobile_subcopy || s.subcopy} />
        </p>

        <Link
          href="/about#doctor-intro"
          className="inline-flex items-center justify-center gap-2
            h-[48px] px-7 rounded-full
            bg-[#006BA8] text-white text-[18px] font-semibold
            shadow-[0_4px_20px_rgba(0,128,200,0.4)]
            transition-[filter] duration-200 hover:brightness-110 active:brightness-95"
        >
          {s.mobile_button_text || s.button_text}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* ── 데스크탑 텍스트 + 버튼 (왼쪽 여백) ── */}
      <div className="hidden md:flex absolute left-[clamp(56px,7vw,136px)] top-[clamp(150px,25vh,235px)] z-10 max-w-[390px] flex-col items-start">
        <h2
          className="text-[#2B2D42] font-bold leading-[1.16] tracking-normal"
          style={{ fontSize: 'clamp(42px, 4vw, 58px)' }}
        >
          <BrText text={s.headline} />
        </h2>

        <div className="w-14 h-px bg-[#2B2D42]/42 my-6" />

        <p
          className="break-keep text-[#2B2D42]/78 font-medium leading-[1.65]"
          style={{ fontSize: 'clamp(20px, 1.55vw, 23px)' }}
        >
          <BrText text={s.subcopy} />
        </p>

        <Link
          href="/about#doctor-intro"
          className="mt-9 inline-flex items-center justify-center gap-2
            min-h-[48px] px-6 w-[168px]
            rounded-md bg-white/32 text-[#2B2D42]
            border border-[#2B2D42]/45 backdrop-blur-[2px]
            text-[18px] font-semibold
            transition-all duration-200
            hover:bg-white/48 hover:border-[#0080C8] hover:text-[#0080C8]"
        >
          {s.button_text}
        </Link>
      </div>
    </section>
  )
}
