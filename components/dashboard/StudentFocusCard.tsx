"use client"

import Link from "next/link"

type Props = {
  focusSession: {
    id: string
    subject: string
    tutorName?: string
    goals?: string[] // incomplete goals only
    updatedAt?: any
    createdAt?: any
  }
}

function timeAgo(ts?: any) {
  if (!ts?.toDate) return null
  const diff = Date.now() - ts.toDate().getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs} hr ago`
}

export default function StudentFocusCard({ focusSession }: Props) {
  const lastActive =
    timeAgo(focusSession.updatedAt) ||
    timeAgo(focusSession.createdAt)

  const goals = focusSession.goals ?? []

  return (
    <div
      className="
        rounded-2xl border bg-white p-6 shadow-sm
        animate-in fade-in slide-in-from-bottom-3 duration-300
        hover:shadow-md transition
      "
    >
      {/* Header */}
      <p className="text-xs font-medium text-blue-600 mb-1">
        Today’s Focus
      </p>

      <h3 className="text-lg font-semibold">
        {focusSession.subject}
      </h3>

      {focusSession.tutorName && (
        <p className="text-sm text-slate-600 mt-1">
          Tutor: {focusSession.tutorName}
        </p>
      )}

      {/* Goals preview */}
      {goals.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium mb-1">
            🎯 Goals in progress
          </p>

          <ul className="text-sm text-slate-700 space-y-1">
            {goals.slice(0, 2).map((g, i) => (
              <li key={i}>• {g}</li>
            ))}
          </ul>

          {goals.length > 2 && (
            <p className="text-xs text-slate-400 mt-1">
              +{goals.length - 2} more
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed bg-slate-50 p-3 text-sm text-slate-500">
          Your tutor will set goals at the start of the session ✨
        </div>
      )}

      {/* Last active */}
      {lastActive && (
        <p className="mt-3 text-xs text-slate-400">
          Last active {lastActive}
        </p>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/dashboard/student/sessions/${focusSession.id}`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
        >
          Open Session
        </Link>

        <Link
          href={`/dashboard/student/sessions/${focusSession.id}/summary`}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50 transition"
        >
          View Summary
        </Link>
      </div>
    </div>
  )
}
