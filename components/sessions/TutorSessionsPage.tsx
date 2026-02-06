"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import SkeletonCard from "@/components/ui/SkeletonCard"
import Link from "next/link"

type Session = {
  id: string
  studentId: string
  studentName?: string
  subject: string
  status: "active" | "closed"

  // review fields stored on session doc
  hasReview?: boolean
  reviewRating?: number
  reviewText?: string
  reviewedAt?: any

  endedAt?: any
}

export default function TutorSessionsPage() {
  const [activeSessions, setActiveSessions] = useState<Session[]>([])
  const [closedSessions, setClosedSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubActive: (() => void) | null = null
    let unsubClosed: (() => void) | null = null

    const unsubAuth = onAuthStateChanged(auth, user => {
      if (unsubActive) unsubActive()
      if (unsubClosed) unsubClosed()

      if (!user) {
        setActiveSessions([])
        setClosedSessions([])
        setLoading(false)
        return
      }

      setLoading(true)

      const activeQuery = query(
        collection(db, "sessions"),
        where("tutorId", "==", user.uid),
        where("status", "==", "active")
      )

      const closedQuery = query(
        collection(db, "sessions"),
        where("tutorId", "==", user.uid),
        where("status", "==", "closed")
      )

      unsubActive = onSnapshot(activeQuery, snap => {
        setActiveSessions(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
          })) as Session[]
        )
        setLoading(false)
      })

      unsubClosed = onSnapshot(closedQuery, snap => {
        setClosedSessions(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
          })) as Session[]
        )
      })
    })

    return () => {
      if (unsubActive) unsubActive()
      if (unsubClosed) unsubClosed()
      unsubAuth()
    }
  }, [])

  /* ---------------- END SESSION ---------------- */
  const endSession = async (sessionId: string) => {
    const confirmed = confirm(
      "End this session?\nChat and notes will become read-only."
    )
    if (!confirmed) return

    try {
      await updateDoc(doc(db, "sessions", sessionId), {
        status: "closed",
        endedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error(err)
      alert("Failed to end session.")
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 text-sm">
        <span className="text-yellow-500">
          {"★".repeat(rating)}
        </span>
        <span className="text-slate-300">
          {"★".repeat(5 - rating)}
        </span>
        <span className="ml-1 text-xs text-slate-500">
          ({rating}/5)
        </span>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">My Sessions</h1>
      <p className="text-slate-600 mb-6">
        Manage your active and completed tutoring sessions
      </p>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* ---------------- ACTIVE SESSIONS ---------------- */}
          <h2 className="text-lg font-semibold mb-3">
            Active Sessions
          </h2>

          {activeSessions.length === 0 && (
            <div className="mb-10 rounded-xl border border-dashed bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-600">
                No active sessions
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your completed sessions will appear below.
              </p>
            </div>
          )}

          {activeSessions.length > 0 && (
            <div className="space-y-5 mb-12">
              {activeSessions.map(session => (
                <div
                  key={session.id}
                  className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {session.subject}
                      </h3>

                      {session.studentName && (
                        <p className="text-sm text-slate-600 mt-1">
                          Student: {session.studentName}
                        </p>
                      )}
                    </div>

                    <span className="text-xs rounded-full bg-green-50 px-3 py-1 text-green-700">
                      Active
                    </span>
                  </div>

                  {/* Micro banner */}
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    💡 Tip: Set goals early so the student knows what to achieve.
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
                    <Link
                      href={`/dashboard/tutor/sessions/${session.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      Open Chat
                    </Link>

                    <Link
                      href={`/dashboard/tutor/sessions/${session.id}/notes`}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      Notes
                    </Link>

                    <button
                      onClick={() => endSession(session.id)}
                      className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      End Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------------- SESSION HISTORY ---------------- */}
          <h2 className="text-lg font-semibold mb-3">
            Session History
          </h2>

          {closedSessions.length === 0 && (
            <div className="rounded-xl border border-dashed bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-600">
                No session history yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Once a session is completed, it will show up here.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {closedSessions.map(session => (
              <div
                key={session.id}
                className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {session.subject}
                    </h3>

                    {session.studentName && (
                      <p className="text-sm text-slate-600 mt-1">
                        Student: {session.studentName}
                      </p>
                    )}
                  </div>

                  <span className="text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    Completed
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
                  <Link
                    href={`/dashboard/tutor/sessions/${session.id}/summary`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    View Summary
                  </Link>

                  <Link
                    href={`/dashboard/tutor/sessions/${session.id}`}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    View Chat
                  </Link>

                  <Link
                    href={`/dashboard/tutor/sessions/${session.id}/notes`}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    View Notes
                  </Link>
                </div>

                {/* ---------------- REVIEW SECTION ---------------- */}
                <div className="mt-6 rounded-xl border bg-slate-50 p-4">
                  <h4 className="font-semibold text-sm mb-1">
                    Ratings & Reviews
                  </h4>

                  {!session.hasReview ? (
                    <p className="text-sm text-slate-500">
                      No review submitted yet.
                    </p>
                  ) : (
                    <div className="text-sm text-slate-700">
                      {renderStars(session.reviewRating ?? 0)}

                      {session.reviewText && (
                        <p className="mt-2 text-slate-600 italic">
                          “{session.reviewText}”
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
