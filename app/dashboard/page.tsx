export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Dashboard Overview
        </h1>

        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Manage your tutoring sessions, view requests, track progress, and stay updated with your PeerTutor activities.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Dashboard loading...
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Please wait while we prepare your workspace.
          </p>
        </div>
      </div>
    </div>
  )
}
