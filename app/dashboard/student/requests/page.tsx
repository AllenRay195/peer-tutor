"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type Request = {
  id: string
  tutorName: string
  subject: string
  message: string
  status: "pending" | "accepted" | "rejected" | "cancelled"
}

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.currentUser) return

    const q = query(
      collection(db, "requests"),
      where("studentId", "==", auth.currentUser.uid)
    )

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Request[]

        setRequests(data)
        setLoading(false)
      },
      error => {
        console.error("Realtime student requests failed:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const cancelRequest = async (requestId: string) => {
    const confirmed = confirm("Cancel this request?")
    if (!confirmed) return

    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "cancelled",
      })

      setFeedback("Request cancelled")
      setTimeout(() => setFeedback(null), 3000)
    } catch (error) {
      console.error(error)
      alert("Failed to cancel request")
    }
  }

  const deleteRequest = async (requestId: string) => {
    const confirmed = confirm(
      "Delete this request permanently?\n\nThis cannot be undone."
    )
    if (!confirmed) return

    try {
      await deleteDoc(doc(db, "requests", requestId))

      setFeedback("Request deleted")
      setTimeout(() => setFeedback(null), 3000)
    } catch (error) {
      console.error(error)
      alert("Failed to delete request")
    }
  }

  if (loading) {
    return (
      <p className="p-6 text-slate-600">
        Loading requests…
      </p>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">
        My Requests
      </h1>

      <p className="text-slate-600 mb-6">
        Track your tutoring requests and their status.
      </p>

      {feedback && (
        <div className="mb-4 rounded-lg bg-blue-50 text-blue-700 px-4 py-2 text-sm">
          {feedback}
        </div>
      )}

      {requests.length === 0 && (
        <div className="rounded-xl border border-dashed bg-slate-50 p-6 text-center">
          <p className="font-medium text-slate-600">
            No requests yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Requests you send to tutors will appear here.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {requests.map(req => {
          const statusStyles =
            req.status === "accepted"
              ? "bg-green-50 border-green-200"
              : req.status === "rejected"
              ? "bg-red-50 border-red-200"
              : req.status === "cancelled"
              ? "bg-slate-50 border-slate-200"
              : "bg-white"

          return (
            <div
              key={req.id}
              className={`
                rounded-xl border p-5 shadow-sm
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-md
                ${statusStyles}
              `}
            >
              {/* HEADER */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold">
                    {req.tutorName}
                  </h3>

                  {req.message && (
                    <p className="text-sm text-slate-600 mt-1">
                      {req.message}
                    </p>
                  )}
                </div>

                <span
                  className={`
                    text-xs font-medium px-2 py-1 rounded-full capitalize
                    ${req.status === "pending" && "bg-yellow-100 text-yellow-700"}
                    ${req.status === "accepted" && "bg-green-100 text-green-700"}
                    ${req.status === "rejected" && "bg-red-100 text-red-700"}
                    ${req.status === "cancelled" && "bg-slate-200 text-slate-700"}
                  `}
                >
                  {req.status}
                </span>
              </div>

              {/* FOOTER */}
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {req.subject}
                </span>

                <div className="flex gap-2">
                  {req.status === "pending" && (
                    <button
                      onClick={() => cancelRequest(req.id)}
                      className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Cancel request
                    </button>
                  )}

                  {(req.status === "cancelled" ||
                    req.status === "rejected") && (
                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="rounded-md border border-slate-400 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
