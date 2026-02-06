"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  onSnapshot as onDocSnapshot,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import Link from "next/link"

type Review = {
  id: string
  studentName?: string
  rating: number
  reviewText: string
  createdAt?: any
}

type TutorRating = {
  ratingTotal: number
  ratingCount: number
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

export default function TutorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const [rating, setRating] = useState<TutorRating>({
    ratingTotal: 0,
    ratingCount: 0,
  })

  useEffect(() => {
    let unsubReviews: (() => void) | null = null
    let unsubTutor: (() => void) | null = null

    const unsubAuth = onAuthStateChanged(auth, user => {
      if (unsubReviews) unsubReviews()
      if (unsubTutor) unsubTutor()

      if (!user) {
        setReviews([])
        setLoading(false)
        return
      }

      setLoading(true)

      // Tutor rating doc
      const tutorRef = doc(db, "tutors", user.uid)

      unsubTutor = onDocSnapshot(tutorRef, snap => {
        if (!snap.exists()) return
        const data = snap.data()

        setRating({
          ratingTotal: data.ratingTotal ?? 0,
          ratingCount: data.ratingCount ?? 0,
        })
      })

      // Reviews subcollection
      const reviewsQuery = query(
        collection(db, "tutors", user.uid, "reviews"),
        orderBy("createdAt", "desc")
      )

      unsubReviews = onSnapshot(
        reviewsQuery,
        snap => {
          const data = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as any),
          })) as Review[]

          setReviews(data)
          setLoading(false)
        },
        err => {
          console.error("Failed loading reviews:", err)
          setLoading(false)
        }
      )
    })

    return () => {
      unsubAuth()
      if (unsubReviews) unsubReviews()
      if (unsubTutor) unsubTutor()
    }
  }, [])

  const avg =
    rating.ratingCount > 0
      ? rating.ratingTotal / rating.ratingCount
      : 0

  const formattedAvg =
    rating.ratingCount > 0 ? avg.toFixed(1) : "0.0"

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        href="/dashboard/tutor"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold mt-4">
        My Reviews
      </h1>

      <p className="text-slate-600 mt-1 mb-6">
        Student feedback and rating history
      </p>

      {/* Rating Summary */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm mb-8">
        <p className="text-sm text-slate-500">
          Overall Rating
        </p>

        {rating.ratingCount > 0 ? (
          <div className="mt-2 flex items-end gap-3">
            <p className="text-4xl font-bold text-yellow-600">
              {formattedAvg} ★
            </p>
            <p className="text-sm text-slate-500 mb-1">
              ({rating.ratingCount} review
              {rating.ratingCount > 1 ? "s" : ""})
            </p>
          </div>
        ) : (
          <p className="mt-2 text-slate-400 font-medium">
            No ratings yet
          </p>
        )}
      </div>

      {/* Reviews */}
      {loading && (
        <p className="text-sm text-slate-500">
          Loading reviews…
        </p>
      )}

      {!loading && reviews.length === 0 && (
        <div className="rounded-xl border border-dashed bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            No reviews yet
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Reviews appear after students rate completed
            sessions.
          </p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-5">
          {reviews.map(r => {
            const ago = timeAgo(r.createdAt)

            return (
              <div
                key={r.id}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {r.studentName ?? "Student"}
                    </p>

                    <p className="text-yellow-600 text-lg mt-1">
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
                  <p className="mt-4 text-slate-600 italic whitespace-pre-wrap">
                    “{r.reviewText}”
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
