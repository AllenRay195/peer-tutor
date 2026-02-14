import StepCard from "../cards/StepCard"

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-white dark:bg-slate-950 py-24"
    >
      {/* Background Accent */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">

        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            How PeerTutor Works
          </h2>

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Getting started is simple. Create an account, choose your role, and begin learning with peers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <StepCard
            number="1"
            title="Sign Up"
            description="Create an account using your email and set up your student or tutor profile."
          />

          <StepCard
            number="2"
            title="Choose Your Role"
            description="Decide whether you want to learn as a student or teach as a peer tutor."
          />

          <StepCard
            number="3"
            title="Start Learning"
            description="Browse tutors, book sessions, and begin studying together."
          />
        </div>

      </div>
    </section>
  )
}
