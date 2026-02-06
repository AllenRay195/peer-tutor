export default function HeroText() {
  return (
    <div className="max-w-xl">
      <h1 className="text-[clamp(3rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tight text-slate-950">
        Find a Tutor
        <br />
        or Be One
      </h1>

      <p className="mt-6 text-lg text-slate-600 leading-relaxed">
        A peer-to-peer tutoring marketplace for students.
      </p>

      <div className="mt-10 flex gap-4">
        <button className="px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition">
          Get Started
        </button>

        <button className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition">
          Become a Tutor
        </button>
      </div>
    </div>
  )
}
