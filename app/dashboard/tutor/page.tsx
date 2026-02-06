"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  limit,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import TutorFocusCard from "@/components/dashboard/TutorFocusCard"

type Stats = {
  pending: number
  accepted: number
  rejected: number
}

type FocusSession = {
  id: string
  studentName: string
  subject: string
  status: "active" | "closed"
  goals: string[]
}

type TutorRating = {
  ratingTotal: number
  ratingCount: number
}

type Review = {
  id: string
  studentName: string
  rating: number
  reviewText: string
  createdAt?: any
}

function timeAgo(ts?: any) {
  if (!ts?.toDate) return null

  const diff = Date.now() - ts.toDate().getTime()
  const mins = Math.floor(diff / 60000)

  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`

  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`

  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export default function TutorDashboard() {
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    accepted: 0,
    rejected: 0,
  })

  const [focusSession, setFocusSession] =
    useState<FocusSession | null>(null)

  const [rating, setRating] = useState<TutorRating>({
    ratingTotal: 0,
    ratingCount: 0,
  })

  const [recentReviews, setRecentReviews] = useState<Review[]>([])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    /* ---------- REQUEST STATS ---------- */
    const reqQuery = query(
      collection(db, "requests"),
      where("tutorId", "==", user.uid)
    )

    const unsubReq = onSnapshot(reqQuery, snap => {
      const counts = { pending: 0, accepted: 0, rejected: 0 }

      snap.forEach(d => {
        const status = d.data().status
        if (status in counts) {
          counts[status as keyof Stats]++
        }
      })

      setStats(counts)
    })

    /* ---------- TUTOR RATING (LIVE) ---------- */
    const tutorRef = doc(db, "tutors", user.uid)

    const unsubTutor = onSnapshot(tutorRef, snap => {
      if (!snap.exists()) return

      const data = snap.data()

      setRating({
        ratingTotal: data.ratingTotal ?? 0,
        ratingCount: data.ratingCount ?? 0,
      })
    })

    /* ---------- ACTIVE SESSION ---------- */
    const sessionQuery = query(
      collection(db, "sessions"),
      where("tutorId", "==", user.uid),
      where("status", "==", "active")
    )

    let unsubGoals: (() => void) | null = null

    const unsubSessions = onSnapshot(sessionQuery, snap => {
      if (snap.empty) {
        setFocusSession(null)
        if (unsubGoals) unsubGoals()
        return
      }

      const docSnap = snap.docs[0]
      const session = {
        id: docSnap.id,
        ...(docSnap.data() as any),
      }

      const goalsQuery = query(
        collection(db, "sessions", session.id, "goals"),
        where("completed", "==", false),
        orderBy("createdAt", "asc")
      )

      if (unsubGoals) unsubGoals()

      unsubGoals = onSnapshot(goalsQuery, goalSnap => {
        const goals = goalSnap.docs.map(
          d => d.data().text as string
        )

        setFocusSession({
          id: session.id,
          subject: session.subject,
          studentName: session.studentName ?? "Student",
          status: "active",
          goals,
        })
      })
    })

    /* ---------- RECENT REVIEWS (LIVE) ---------- */
    const reviewQuery = query(
      collection(db, "tutors", user.uid, "reviews"),
      orderBy("createdAt", "desc"),
      limit(3)
    )

    const unsubReviews = onSnapshot(reviewQuery, snap => {
      const data = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      })) as Review[]

      setRecentReviews(data)
    })

    return () => {
      unsubReq()
      unsubTutor()
      unsubSessions()
      unsubReviews()
      if (unsubGoals) unsubGoals()
    }
  }, [])

  const ratingAverage =
    rating.ratingCount > 0
      ? rating.ratingTotal / rating.ratingCount
      : 0

  const formattedRating =
    rating.ratingCount > 0 ? ratingAverage.toFixed(1) : "0.0"

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">
        Tutor Dashboard
      </h1>

      <p className="text-slate-600 mb-6">
        Live overview of your tutoring activity
      </p>

      {focusSession && (
        <div className="mb-8">
          <TutorFocusCard
            focusSession={{
              id: focusSession.id,
              subject: focusSession.subject,
              studentName: focusSession.studentName,
              status: focusSession.status,
              goals: focusSession.goals,
            }}
          />
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Pending Requests"
          value={stats.pending}
          color="text-yellow-600"
        />

        <StatCard
          label="Accepted"
          value={stats.accepted}
          color="text-green-600"
        />

        <StatCard
          label="Rejected"
          value={stats.rejected}
          color="text-red-600"
        />

        <div className="rounded-xl bg-white border p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Tutor Rating
          </p>

          {rating.ratingCount > 0 ? (
            <>
              <p className="text-3xl font-bold mt-2 text-yellow-600">
                {formattedRating} ★
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Based on {rating.ratingCount} review
                {rating.ratingCount > 1 ? "s" : ""}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold mt-2 text-slate-400">
                No ratings yet
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Ratings appear after students review sessions.
              </p>
            </>
          )}
        </div>
      </div>

      {/* RECENT REVIEWS */}
      <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              Recent Reviews
            </h2>
            <p className="text-sm text-slate-500">
              Latest feedback from your students
            </p>
          </div>

          <Link
            href="/dashboard/tutor/reviews"
            className="text-sm text-blue-600 hover:underline"
          >
            View All →
          </Link>
        </div>

        {recentReviews.length === 0 ? (
          <p className="text-sm text-slate-500">
            No reviews yet. Once students submit feedback, it
            will appear here.
          </p>
        ) : (
          <div className="space-y-4">
            {recentReviews.map(r => {
              const ago = timeAgo(r.createdAt)

              return (
                <div
                  key={r.id}
                  className="rounded-xl border bg-slate-50 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {r.studentName ?? "Student"}
                      </p>

                      <p className="text-yellow-600 text-sm mt-1">
                        {"★".repeat(r.rating ?? 0)}
                        <span className="text-slate-300">
                          {"★".repeat(5 - (r.rating ?? 0))}
                        </span>
                      </p>
                    </div>

                    {ago && (
                      <span className="text-xs text-slate-400">
                        {ago}
                      </span>
                    )}
                  </div>

                  {r.reviewText && (
                    <p className="text-sm text-slate-600 mt-3 italic">
                      “{r.reviewText}”
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-xl bg-white border p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  )
}
