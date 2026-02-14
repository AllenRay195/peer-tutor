import Link from "next/link"

export default function HeroText() {
  return (
    <div className="max-w-xl">
      <h1 className="text-[clamp(3rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-slate-950 dark:text-slate-100">
        Find a Tutor
        <br />
        or Be One
      </h1>

      <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
        A peer-to-peer tutoring marketplace built for students to connect, learn, and grow together.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/register"
          className="px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold shadow-sm hover:bg-blue-800 transition"
        >
          Get Started
        </Link>

        <Link
          href="/register"
          className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition"
        >
          Become a Tutor
        </Link>
      </div>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
        No hidden fees. Easy scheduling. Built for campus learning.
      </p>
    </div>
  )
}
