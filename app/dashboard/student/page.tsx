"use client"

import { useEffect, useState } from "react"
import SkeletonCard from "@/components/ui/SkeletonCard"
import TutorCard from "@/components/cards/TutorCard"
import RequestModal from "@/components/requests/RequestModal"
import StudentFocusCard from "@/components/dashboard/StudentFocusCard"

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type Tutor = {
  id: string
  name: string
  bio?: string
  subjects?: string[]
  isActive: boolean

  // ✅ rating system fields
  ratingTotal?: number
  ratingCount?: number
}

type Session = {
  id: string
  tutorName?: string
  subject: string
  status: "active" | "closed"
  goals?: string[] // ✅ added
  updatedAt?: any
  createdAt?: any
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)

  // tutors
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [pendingTutorIds, setPendingTutorIds] = useState<Set<string>>(
    new Set()
  )

  // student
  const [studentName, setStudentName] = useState("Student")

  // focus
  const [focus, setFocus] = useState<Session | null>(null)

  // request modal
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const load = async () => {
      try {
        /* -------- STUDENT PROFILE -------- */
        const userSnap = await getDoc(doc(db, "users", user.uid))
        if (userSnap.exists()) {
          setStudentName(userSnap.data().name || "Student")
        }

        /* -------- ACTIVE SESSIONS -------- */
        const sessionSnap = await getDocs(
          query(
            collection(db, "sessions"),
            where("studentId", "==", user.uid),
            where("status", "==", "active")
          )
        )

        const sessions = await Promise.all(
          sessionSnap.docs.map(async d => {
            const session = {
              id: d.id,
              ...(d.data() as Omit<Session, "id">),
            }

            // ✅ FETCH INCOMPLETE GOALS
            const goalsSnap = await getDocs(
              query(
                collection(db, "sessions", d.id, "goals"),
                where("completed", "==", false)
              )
            )

            const goals = goalsSnap.docs.map(g => g.data().text)

            return {
              ...session,
              goals,
            }
          })
        )

        // sort by activity
        sessions.sort((a, b) => {
          const aTime =
            a.updatedAt?.toMillis?.() ??
            a.createdAt?.toMillis?.() ??
            0
          const bTime =
            b.updatedAt?.toMillis?.() ??
            b.createdAt?.toMillis?.() ??
            0
          return bTime - aTime
        })

        setFocus(sessions[0] ?? null)

        /* -------- ACTIVE TUTORS -------- */
        const tutorSnap = await getDocs(
          query(collection(db, "tutors"), where("isActive", "==", true))
        )

        setTutors(
          tutorSnap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<Tutor, "id">),
          }))
        )

        /* -------- PENDING REQUESTS -------- */
        const reqSnap = await getDocs(
          query(
            collection(db, "requests"),
            where("studentId", "==", user.uid),
            where("status", "==", "pending")
          )
        )

        setPendingTutorIds(new Set(reqSnap.docs.map(d => d.data().tutorId)))
      } catch (err) {
        console.error("Student dashboard load failed:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  /* -------- SEND REQUEST -------- */
  const sendRequest = async (tutor: Tutor, subject: string, message: string) => {
    const user = auth.currentUser
    if (!user) return

    try {
      await addDoc(collection(db, "requests"), {
        studentId: user.uid,
        studentName,

        tutorId: tutor.id,
        tutorName: tutor.name,

        subject,
        message,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      setPendingTutorIds(prev => new Set(prev).add(tutor.id))
      setSelectedTutor(null)
      alert("Request sent!")
    } catch (err) {
      console.error(err)
      alert("Failed to send request")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Student Dashboard</h1>

      <p className="text-slate-600 mb-6">
        Browse tutors and manage your learning
      </p>

      {/* -------- TODAY'S FOCUS -------- */}
      {focus ? (
        <div className="mb-10">
          <StudentFocusCard focusSession={focus} />
        </div>
      ) : (
        <div className="mb-10 rounded-xl border border-dashed bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            You’re all caught up 🎉
          </p>
          <p className="text-sm text-slate-500 mt-1">
            No active sessions right now.
          </p>
        </div>
      )}

      {/* -------- TUTORS -------- */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && tutors.length === 0 && (
        <p className="text-slate-500">No tutors available right now.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map(tutor => (
          <TutorCard
            key={tutor.id}
            tutor={tutor}
            hasPending={pendingTutorIds.has(tutor.id)}
            onRequest={() => setSelectedTutor(tutor)}
          />
        ))}
      </div>

      {/* -------- REQUEST MODAL -------- */}
      {selectedTutor && (
        <RequestModal
          isOpen={true}
          subjects={selectedTutor.subjects}
          onClose={() => setSelectedTutor(null)}
          onSubmit={(subject, message) =>
            sendRequest(selectedTutor, subject, message)
          }
        />
      )}
    </div>
  )
}
