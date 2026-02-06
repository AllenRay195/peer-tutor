"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"

type Review = {
  id: string
  studentName: string
  rating: number
  reviewText: string
  createdAt?: any
}

export default function TutorReviewsPage() {
  const params = useParams()
  const tutorId = params.tutorId as string

  const [tutorName, setTutorName] = useState("Tutor")
  const [ratingTotal, setRatingTotal] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tutorId) return

    // 1) Load tutor basic info
    const loadTutor = async () => {
      const tutorSnap = await getDoc(doc(db, "tutors", tutorId))
      if (tutorSnap.exists()) {
        const data = tutorSnap.data()
        setTutorName(data.name ?? "Tutor")
        setRatingTotal(data.ratingTotal ?? 0)
        setRatingCount(data.ratingCount ?? 0)
      }
    }

    loadTutor()

    // 2) Live reviews list
    const reviewsQuery = query(
      collection(db, "tutors", tutorId, "reviews"),
      orderBy("createdAt", "desc")
    )

    const unsub = onSnapshot(
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
        console.error("Reviews listener error:", err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [tutorId])

  const average =
    ratingCount > 0 ? ratingTotal / ratingCount : 0

  const formattedAverage =
    ratingCount > 0 ? average.toFixed(1) : "0.0"

  const renderStars = (rating: number) => {
    return (
      <span className="text-yellow-500 text-lg">
        {"★".repeat(rating)}
        <span className="text-slate-300">
          {"★".repeat(5 - rating)}
        </span>
      </span>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {tutorName} Reviews
          </h1>
          <p className="text-slate-600 text-sm">
            See what other students say about this tutor.
          </p>
        </div>

        <Link
          href="/dashboard/student"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {/* Rating Summary */}
      <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
        <p className="text-sm text-slate-500">
          Overall Rating
        </p>

        {ratingCount > 0 ? (
          <>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-4xl font-bold text-yellow-600">
                {formattedAverage}
              </p>
              <p className="text-yellow-500 text-2xl">★</p>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Based on {ratingCount} review
              {ratingCount > 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <p className="text-slate-400 mt-2">
            No ratings yet.
          </p>
        )}
      </div>

      {/* Reviews List */}
      {loading && (
        <p className="text-slate-500 text-sm">
          Loading reviews...
        </p>
      )}

      {!loading && reviews.length === 0 && (
        <div className="rounded-xl border border-dashed bg-slate-50 p-6 text-center">
          <p className="font-medium text-slate-600">
            No reviews yet
          </p>
          <p className="text-sm text-slate-500 mt-1">
            This tutor has not received any reviews.
          </p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-900">
                    {review.studentName ?? "Student"}
                  </p>

                  <div className="mt-1">
                    {renderStars(review.rating)}
                  </div>
                </div>

                <span className="text-xs text-slate-400">
                  {review.createdAt?.toDate?.().toLocaleDateString?.() ??
                    ""}
                </span>
              </div>

              {review.reviewText && (
                <p className="mt-3 text-sm text-slate-600 italic">
                  “{review.reviewText}”
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
