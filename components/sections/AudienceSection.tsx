export default function AudienceSection() {
  return (
    <section
      id="audience"
      className="relative bg-white dark:bg-slate-950 py-24"
    >
      {/* Background Accent */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Who Is This Platform For?
          </h2>

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            PeerTutor is designed to support both students who need help and peers who want to teach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* For Students */}
          <div
            className="
              group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800
              bg-white dark:bg-slate-900 p-10 shadow-sm
              transition-all duration-300 ease-out
              hover:-translate-y-2 hover:shadow-lg
            "
          >
            {/* Hover glow */}
            <div
              className="
                pointer-events-none absolute inset-0 opacity-0
                bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent
                transition-opacity duration-300
                group-hover:opacity-100
              "
            />

            <h3 className="relative text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              For Students
            </h3>

            <p className="relative mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Get the academic support you need from peers who understand your subjects and your school environment.
            </p>

            <ul className="relative mt-6 space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                Find tutors by subject and level
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                Book affordable peer tutoring sessions
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                Track your learning progress
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                Learn at your own pace
              </li>
            </ul>

            <div
              className="
                absolute bottom-0 left-0 h-[3px] w-0
                bg-gradient-to-r from-blue-600 to-indigo-600
                transition-all duration-300
                group-hover:w-full
              "
            />
          </div>

          {/* For Tutors */}
          <div
            className="
              group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800
              bg-white dark:bg-slate-900 p-10 shadow-sm
              transition-all duration-300 ease-out
              hover:-translate-y-2 hover:shadow-lg
            "
          >
            {/* Hover glow */}
            <div
              className="
                pointer-events-none absolute inset-0 opacity-0
                bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent
                transition-opacity duration-300
                group-hover:opacity-100
              "
            />

            <h3 className="relative text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              For Tutors
            </h3>

            <p className="relative mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Share your knowledge, help other students succeed, and gain valuable teaching experience.
            </p>

            <ul className="relative mt-6 space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                Create a tutor profile
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                Set your availability
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                Accept session requests
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                Build your teaching portfolio
              </li>
            </ul>

            <div
              className="
                absolute bottom-0 left-0 h-[3px] w-0
                bg-gradient-to-r from-indigo-600 to-purple-600
                transition-all duration-300
                group-hover:w-full
              "
            />
          </div>

        </div>
      </div>
    </section>
  )
}
