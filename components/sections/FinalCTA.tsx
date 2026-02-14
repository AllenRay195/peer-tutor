export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-28">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 sm:px-10 lg:px-12 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-white">
          Ready to start learning with peers?
        </h2>

        <p className="mt-5 text-lg text-slate-300 leading-relaxed">
          Join PeerTutor today and connect with students who can help you succeed.
          Learn faster, stay consistent, and improve your academic performance.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-5">
          <button
            className="
              px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold
              shadow-sm transition-all duration-300
              hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1
            "
          >
            Get Started
          </button>

          <button
            className="
              px-8 py-3 rounded-xl border border-slate-500 text-slate-200 font-semibold
              transition-all duration-300
              hover:bg-slate-800 hover:-translate-y-1
            "
          >
            Become a Tutor
          </button>
        </div>

        <p className="mt-8 text-sm text-slate-400">
          Trusted by students. Built for campus learning.
        </p>
      </div>
    </section>
  )
}
