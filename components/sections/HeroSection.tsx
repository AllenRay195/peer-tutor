import Image from "next/image"
import HeroText from "./HeroText"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-slate-50">
      <div
        className="mx-auto max-w-7xl px-12 pt-24
        grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
      >
        <HeroText />

        <div className="flex justify-center">
          <Image
            src="/illustrations/students-studying.png"
            alt="Students studying together"
            width={520}
            height={520}
            className="w-full max-w-xl"
            priority
          />
        </div>
      </div>
    </section>
  )
}
