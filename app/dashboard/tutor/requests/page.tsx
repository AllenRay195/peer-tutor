"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  orderBy,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import SkeletonCard from "@/components/ui/SkeletonCard"

type Request = {
  id: string
  studentId: string
  studentName: string
  tutorId: string
  tutorName: string
  subject: string
  message: string
  status: "pending" | "accepted" | "rejected" | "cancelled"
  createdAt?: any
  updatedAt?: any
  sessionId?: string
}

export default function TutorRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState<Request[]>([])
  const [historyRequests, setHistoryRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    let unsubPending: (() => void) | null = null
    let unsubHistory: (() => void) | null = null

    const authUnsub = onAuthStateChanged(auth, user => {
      if (!user) {
        setPendingRequests([])
        setHistoryRequests([])
        setLoading(false)
        return
      }

      // ✅ Pending only
      const pendingQuery = query(
        collection(db, "requests"),
        where("tutorId", "==", user.uid),
        where("status", "==", "pending")
      )

      unsubPending = onSnapshot(
        pendingQuery,
        snapshot => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Request[]

          setPendingRequests(data)
          setLoading(false)
        },
        err => {
          console.error("Pending request listener error:", err)
          setLoading(false)
        }
      )

      // ✅ History (accepted/rejected/cancelled)
      const historyQuery = query(
        collection(db, "requests"),
        where("tutorId", "==", user.uid),
        where("status", "in", ["accepted", "rejected", "cancelled"]),
        orderBy("updatedAt", "desc")
      )

      unsubHistory = onSnapshot(
        historyQuery,
        snapshot => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Request[]

          setHistoryRequests(data)
        },
        err => {
          console.error("History request listener error:", err)
        }
      )
    })

    return () => {
      authUnsub()
      if (unsubPending) unsubPending()
      if (unsubHistory) unsubHistory()
    }
  }, [])

  const updateStatus = async (
    request: Request,
    status: "accepted" | "rejected"
  ) => {
    try {
      if (status === "accepted") {
        // ✅ CREATE SESSION FIRST
        const sessionRef = await addDoc(collection(db, "sessions"), {
          requestId: request.id,

          studentId: request.studentId,
          studentName: request.studentName,

          tutorId: request.tutorId,
          tutorName: request.tutorName,

          subject: request.subject,
          status: "active",

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        // ✅ THEN UPDATE REQUEST
        await updateDoc(doc(db, "requests", request.id), {
          status: "accepted",
          sessionId: sessionRef.id,
          updatedAt: serverTimestamp(),
        })
      } else {
        await updateDoc(doc(db, "requests", request.id), {
          status: "rejected",
          updatedAt: serverTimestamp(),
        })
      }

      setFeedback(
        status === "accepted"
          ? "Request accepted — session created"
          : "Request rejected"
      )

      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      console.error(err)
      setFeedback("Failed to update request")
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const deleteRequest = async (request: Request) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete this request from ${request.studentName}?`
    )

    if (!confirmDelete) return

    try {
      await deleteDoc(doc(db, "requests", request.id))

      setFeedback("Request deleted successfully.")
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      console.error(err)
      setFeedback("Failed to delete request.")
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const statusBadge = (status: string) => {
    if (status === "pending")
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    if (status === "accepted")
      return "bg-green-100 text-green-700 border-green-200"
    if (status === "rejected")
      return "bg-red-100 text-red-700 border-red-200"
    if (status === "cancelled")
      return "bg-slate-100 text-slate-600 border-slate-200"

    return "bg-slate-100 text-slate-600 border-slate-200"
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Tutor Requests</h1>

      <p className="text-slate-600 mb-6">
        Review requests and manage your tutoring queue.
      </p>

      {feedback && (
        <div className="mb-6 rounded-lg bg-blue-50 text-blue-700 px-4 py-2 text-sm border border-blue-200">
          {feedback}
        </div>
      )}

      {/* ---------------- PENDING REQUESTS ---------------- */}
      <h2 className="text-lg font-semibold mb-3">Pending Requests</h2>

      {loading && (
        <div className="space-y-4 mb-10">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && pendingRequests.length === 0 && (
        <div className="mb-10 rounded-xl border bg-white p-6 text-center text-slate-600">
          No pending requests right now.
        </div>
      )}

      {!loading && pendingRequests.length > 0 && (
        <div className="space-y-4 mb-10">
          {pendingRequests.map(req => (
            <div
              key={req.id}
              className="rounded-xl border p-5 shadow-sm bg-white"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold">{req.studentName}</h3>

                  {req.message && (
                    <p className="text-sm text-slate-600 mt-1">{req.message}</p>
                  )}
                </div>

                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full border ${statusBadge(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {req.subject}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(req, "rejected")}
                    className="px-3 py-1 text-sm rounded-md border border-red-500 text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => updateStatus(req, "accepted")}
                    className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- REQUEST HISTORY ---------------- */}
      <h2 className="text-lg font-semibold mb-3">Request History</h2>

      {!loading && historyRequests.length === 0 && (
        <div className="rounded-xl border bg-white p-6 text-center text-slate-600">
          No request history yet.
        </div>
      )}

      {!loading && historyRequests.length > 0 && (
        <div className="space-y-4">
          {historyRequests.map(req => (
            <div
              key={req.id}
              className="rounded-xl border p-5 shadow-sm bg-white"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold">{req.studentName}</h3>

                  {req.message && (
                    <p className="text-sm text-slate-600 mt-1">{req.message}</p>
                  )}
                </div>

                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full border ${statusBadge(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {req.subject}
                </span>

                <button
                  onClick={() => deleteRequest(req)}
                  className="px-3 py-1 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
