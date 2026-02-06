"use client"

import Link from "next/link"

type TutorCardProps = {
  tutor: {
    id: string
    name: string
    bio?: string
    subjects?: string[]
    isActive: boolean

    ratingTotal?: number
    ratingCount?: number
  }
  hasPending?: boolean
  onRequest: () => void
}

export default function TutorCard({
  tutor,
  hasPending = false,
  onRequest,
}: TutorCardProps) {
  const initial = tutor.name.charAt(0).toUpperCase()

  const isDisabled = !tutor.isActive || hasPending

  const buttonLabel = hasPending
    ? "Request Pending"
    : tutor.isActive
    ? "Send Request"
    : "Unavailable"

  const ratingTotal = tutor.ratingTotal ?? 0
  const ratingCount = tutor.ratingCount ?? 0

  const ratingAverage =
    ratingCount > 0 ? ratingTotal / ratingCount : 0

  const formattedRating =
    ratingCount > 0 ? ratingAverage.toFixed(1) : null

  return (
    <div
      className="
        rounded-2xl border border-slate-200 bg-white p-6
        shadow-sm transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        flex flex-col
      "
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold">
          {initial}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">
            {tutor.name}
          </h3>

          <div className="flex items-center justify-between mt-1">
            <span
              className={`text-xs font-medium ${
                tutor.isActive
                  ? "text-green-600"
                  : "text-slate-400"
              }`}
            >
              {tutor.isActive ? "Available" : "Offline"}
            </span>

            {/* Rating */}
            {ratingCount > 0 ? (
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                {formattedRating}
                <span className="text-slate-400 font-normal">
                  ({ratingCount})
                </span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                No ratings yet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {tutor.bio && (
        <p className="text-sm text-slate-600 mt-4 line-clamp-3">
          {tutor.bio}
        </p>
      )}

      {/* Subjects */}
      {Array.isArray(tutor.subjects) &&
        tutor.subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tutor.subjects.slice(0, 4).map(subject => (
              <span
                key={subject}
                className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full"
              >
                {subject}
              </span>
            ))}

            {tutor.subjects.length > 4 && (
              <span className="text-xs text-slate-500">
                +{tutor.subjects.length - 4} more
              </span>
            )}
          </div>
        )}

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Actions */}
      <div className="mt-6 flex gap-2">
        <Link
          href={`/dashboard/student/tutors/${tutor.id}/reviews`}
          className="
            flex-1 text-center rounded-xl border px-3 py-2.5 text-sm font-medium
            text-slate-700 hover:bg-slate-50 transition
          "
        >
          View Reviews
        </Link>

        <button
          onClick={onRequest}
          disabled={isDisabled}
          className={`flex-1 rounded-xl py-2.5 font-medium transition ${
            isDisabled
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
