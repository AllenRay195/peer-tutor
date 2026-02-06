export default function FinalCTA() {
  return (
    <section className="bg-slate-900 py-24">
      <div className="mx-auto max-w-4xl px-12 text-center">

        <h2 className="text-3xl font-bold text-white">
          Ready to start learning with peers?
        </h2>

        <p className="mt-4 text-slate-300 text-lg">
          Join PeerTutor today and connect with students who can help you succeed.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <button className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
            Get Started
          </button>

          <button className="px-8 py-3 rounded-xl border border-slate-500 text-slate-200 font-semibold hover:bg-slate-800 transition">
            Become a Tutor
          </button>
        </div>

      </div>
    </section>
  )
}
