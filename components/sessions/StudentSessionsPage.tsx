"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import Link from "next/link"

type Session = {
  id: string
  tutorId: string
  tutorName?: string
  subject: string
  status: "active" | "closed"

  // review fields stored on session doc
  hasReview?: boolean
  reviewRating?: number
  reviewText?: string
}

export default function StudentSessionsPage() {
  const [active, setActive] = useState<Session[]>([])
  const [closed, setClosed] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  // review UI state
  const [reviewInputs, setReviewInputs] = useState<
    Record<string, { rating: number; text: string }>
  >({})

  const [submitting, setSubmitting] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    let unsubSessions: (() => void) | null = null

    const unsubAuth = onAuthStateChanged(auth, user => {
      if (unsubSessions) unsubSessions()

      if (!user) {
        setActive([])
        setClosed([])
        setLoading(false)
        return
      }

      setLoading(true)

      const q = query(
        collection(db, "sessions"),
        where("studentId", "==", user.uid)
      )

      unsubSessions = onSnapshot(q, snap => {
        const a: Session[] = []
        const c: Session[] = []

        snap.forEach(d => {
          const s = { id: d.id, ...d.data() } as Session
          s.status === "active" ? a.push(s) : c.push(s)
        })

        setActive(a)
        setClosed(c)
        setLoading(false)
      })
    })

    return () => {
      if (unsubSessions) unsubSessions()
      unsubAuth()
    }
  }, [])

  const setRating = (sessionId: string, rating: number) => {
    setReviewInputs(prev => ({
      ...prev,
      [sessionId]: {
        rating,
        text: prev[sessionId]?.text ?? "",
      },
    }))
  }

  const setText = (sessionId: string, text: string) => {
    setReviewInputs(prev => ({
      ...prev,
      [sessionId]: {
        rating: prev[sessionId]?.rating ?? 0,
        text,
      },
    }))
  }

  const submitReview = async (session: Session) => {
    const user = auth.currentUser
    if (!user) return

    if (!session.tutorId) {
      alert("Tutor information missing.")
      return
    }

    const input = reviewInputs[session.id]
    const rating = input?.rating ?? 0
    const reviewText = input?.text?.trim() ?? ""

    if (rating < 1 || rating > 5) {
      alert("Please select a star rating (1 to 5).")
      return
    }

    if (reviewText.length < 3) {
      alert("Please write a short review.")
      return
    }

    setSubmitting(session.id)
    setFeedback(null)

    try {
      const sessionRef = doc(db, "sessions", session.id)

      // safety check: prevent duplicate review
      const snap = await getDoc(sessionRef)
      if (!snap.exists()) {
        alert("Session not found.")
        return
      }

      const data = snap.data()
      if (data.hasReview === true) {
        alert("You already reviewed this session.")
        return
      }

      // 1) Create review doc under tutor
      await addDoc(
        collection(db, "tutors", session.tutorId, "reviews"),
        {
          sessionId: session.id,
          studentId: user.uid,
          studentName: user.displayName ?? "Student",
          rating,
          reviewText,
          createdAt: serverTimestamp(),
        }
      )

      // 2) Update tutor rating totals (math equation)
      const tutorRef = doc(db, "tutors", session.tutorId)

      await updateDoc(tutorRef, {
        ratingTotal: increment(rating),
        ratingCount: increment(1),
      })

      // 3) Update session doc to mark reviewed
      await updateDoc(sessionRef, {
        hasReview: true,
        reviewRating: rating,
        reviewText,
        reviewedAt: serverTimestamp(),
      })

      setFeedback("Review submitted successfully ⭐")
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      console.error("Submit review failed:", err)
      alert("Failed to submit review.")
    } finally {
      setSubmitting(null)
    }
  }

  const StarRating = ({
    value,
    onChange,
    disabled,
  }: {
    value: number
    onChange: (val: number) => void
    disabled?: boolean
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className={`text-xl transition ${
              star <= value ? "text-yellow-500" : "text-slate-300"
            } ${disabled ? "cursor-not-allowed opacity-60" : "hover:scale-110"}`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">My Sessions</h1>

      <p className="text-slate-600 mb-6">
        View your active and completed tutoring sessions
      </p>

      {feedback && (
        <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-2 text-sm border border-green-200">
          {feedback}
        </div>
      )}

      {loading && (
        <p className="text-slate-500 text-sm">Loading sessions…</p>
      )}

      {!loading && (
        <>
          {/* ---------------- ACTIVE SESSIONS ---------------- */}
          <h2 className="text-lg font-semibold mb-3">Active Sessions</h2>

          {active.length === 0 && (
            <div className="mb-10 rounded-xl border border-dashed bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-600">
                No active sessions
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your completed sessions will appear below.
              </p>
            </div>
          )}

          {active.length > 0 && (
            <div className="space-y-5 mb-12">
              {active.map(session => (
                <div
                  key={session.id}
                  className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {session.subject}
                      </h3>

                      {session.tutorName && (
                        <p className="text-sm text-slate-600 mt-1">
                          Tutor: {session.tutorName}
                        </p>
                      )}
                    </div>

                    <span className="text-xs rounded-full bg-green-50 px-3 py-1 text-green-700">
                      Active
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3 border-t pt-4">
                    <Link
                      href={`/dashboard/student/sessions/${session.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      Open Chat
                    </Link>

                    <Link
                      href={`/dashboard/student/sessions/${session.id}/notes`}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      View Notes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------------- SESSION HISTORY ---------------- */}
          <h2 className="text-lg font-semibold mb-3">Session History</h2>

          {closed.length === 0 && (
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
            {closed.map(session => {
              const input = reviewInputs[session.id] ?? {
                rating: 0,
                text: "",
              }

              return (
                <div
                  key={session.id}
                  className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {session.subject}
                      </h3>

                      {session.tutorName && (
                        <p className="text-sm text-slate-600 mt-1">
                          Tutor: {session.tutorName}
                        </p>
                      )}
                    </div>

                    <span className="text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                      Completed
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
                    <Link
                      href={`/dashboard/student/sessions/${session.id}/summary`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      View Summary
                    </Link>

                    <Link
                      href={`/dashboard/student/sessions/${session.id}`}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      View Chat
                    </Link>

                    <Link
                      href={`/dashboard/student/sessions/${session.id}/notes`}
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
                    <p className="text-xs text-slate-500 mb-3">
                      Help other students by rating your tutor.
                    </p>

                    {session.hasReview ? (
                      <div className="text-sm text-slate-700">
                        <p className="font-medium mb-1">
                          You already reviewed this session ⭐
                        </p>

                        <p className="text-yellow-600 text-lg">
                          {"★".repeat(session.reviewRating ?? 0)}
                          <span className="text-slate-300">
                            {"★".repeat(5 - (session.reviewRating ?? 0))}
                          </span>
                        </p>

                        {session.reviewText && (
                          <p className="mt-2 text-slate-600 italic">
                            “{session.reviewText}”
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <StarRating
                          value={input.rating}
                          onChange={val => setRating(session.id, val)}
                          disabled={submitting === session.id}
                        />

                        <textarea
                          value={input.text}
                          onChange={e => setText(session.id, e.target.value)}
                          disabled={submitting === session.id}
                          placeholder="Write a short review..."
                          className="mt-3 w-full rounded-lg border px-3 py-2 text-sm resize-none h-[90px]"
                        />

                        <button
                          onClick={() => submitReview(session)}
                          disabled={submitting === session.id}
                          className="mt-3 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-60"
                        >
                          {submitting === session.id
                            ? "Submitting..."
                            : "Submit Review"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
