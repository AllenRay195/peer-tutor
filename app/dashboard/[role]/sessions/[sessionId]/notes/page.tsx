"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function NotesPad() {
  const { sessionId, role } = useParams<{
    sessionId: string
    role: "student" | "tutor"
  }>()

  const router = useRouter()
  const isTutor = role === "tutor"

  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [sessionStatus, setSessionStatus] =
    useState<"active" | "closed">("active")
  const [loading, setLoading] = useState(true)

  if (!sessionId) return null

  const notesRef = doc(db, "sessions", sessionId, "notes", "main")

  /* ---------- AUTH + SESSION STATUS ---------- */
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async user => {
      if (!user) return

      const sessionSnap = await getDoc(
        doc(db, "sessions", sessionId)
      )

      if (!sessionSnap.exists()) {
        router.push(`/dashboard/${role}/sessions`)
        return
      }

      const session = sessionSnap.data()
      setSessionStatus(session.status)
      setLoading(false)
    })

    return () => unsubAuth()
  }, [sessionId, role, router])

  /* ---------- LIVE NOTES (READ ONLY FOR STUDENT) ---------- */
  useEffect(() => {
    const unsub = onSnapshot(notesRef, snap => {
      if (snap.exists()) {
        setContent(snap.data().content || "")
      }
    })

    return () => unsub()
  }, [sessionId])

  /* ---------- SAVE NOTES (TUTOR ONLY) ---------- */
  const saveNotes = async (text: string) => {
    if (
      !isTutor ||
      !auth.currentUser ||
      !sessionId ||
      sessionStatus !== "active"
    )
      return

    setSaving(true)

    await setDoc(
      notesRef,
      {
        content: text,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid,
      },
      { merge: true }
    )

    setSaving(false)
  }

  /* ---------- AUTO SAVE (TUTOR ONLY) ---------- */
  useEffect(() => {
    if (!isTutor || sessionStatus !== "active") return

    const t = setTimeout(() => {
      saveNotes(content)
    }, 800)

    return () => clearTimeout(t)
  }, [content, sessionStatus, isTutor])

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading notes…
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <button
          onClick={() =>
            router.push(`/dashboard/${role}/sessions/${sessionId}`)
          }
          className="text-sm text-blue-600 hover:underline mb-1"
        >
          ← Back to chat
        </button>

        <h1 className="text-xl font-semibold">Shared Notes</h1>
        <p className="text-sm text-slate-500">
          {sessionStatus === "active"
            ? isTutor
              ? "You can edit these notes."
              : "Notes are read-only."
            : "Session ended. Notes are locked."}
        </p>
      </div>

      {/* Read-only banner */}
      {sessionStatus === "closed" && (
        <div className="mb-3 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm text-yellow-700">
          This session has ended. Notes are locked.
        </div>
      )}

      {/* Notes textarea */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        readOnly={!isTutor || sessionStatus !== "active"}
        placeholder="Write notes here..."
        className={`w-full h-[60vh] rounded-xl p-4 text-sm outline-none border
          ${
            isTutor && sessionStatus === "active"
              ? "focus:ring-2 focus:ring-blue-500"
              : "bg-slate-100 text-slate-600 cursor-not-allowed"
          }`}
      />

      {isTutor && sessionStatus === "active" && (
        <p className="text-xs text-slate-400 mt-2">
          {saving ? "Saving..." : "Auto-saved"}
        </p>
      )}
    </div>
  )
}
