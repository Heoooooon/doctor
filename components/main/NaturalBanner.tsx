import Image from 'next/image'

export default function NaturalBanner() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src="/images/board/best_treat.jpg"
        alt="가장 좋은 임플란트는 내 몸이 가진 자연치아입니다"
        fill
        sizes="100vw"
        className="object-cover"
      />
    </section>
  )
}
