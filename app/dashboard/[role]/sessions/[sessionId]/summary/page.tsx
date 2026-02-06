"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"

const FALLBACK_PREFIX = "Session summary unavailable"

type Goal = {
  id: string
  text: string
  completed: boolean
  createdAt?: any
  completedAt?: any
}

export default function SessionSummaryPage() {
  const { sessionId, role } = useParams<{
    sessionId: string
    role: "student" | "tutor"
  }>()

  const router = useRouter()
  const isTutor = role === "tutor"

  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState("")
  const [sessionStatus, setSessionStatus] =
    useState<"active" | "closed">("active")

  /* ---------- LOAD SUMMARY + GOALS ---------- */
  useEffect(() => {
    if (!sessionId) return

    let unsubSummary: (() => void) | null = null
    let unsubGoals: (() => void) | null = null

    const unsubAuth = onAuthStateChanged(auth, async user => {
      if (!user) {
        setLoading(false)
        return
      }

      const sessionRef = doc(db, "sessions", sessionId)
      const sessionSnap = await getDoc(sessionRef)

      if (sessionSnap.exists()) {
        setSessionStatus(sessionSnap.data().status)
      }

      /* ---------- SUMMARY ---------- */
      const summaryRef = doc(
        db,
        "sessions",
        sessionId,
        "summary",
        "main"
      )

      unsubSummary = onSnapshot(summaryRef, snap => {
        if (snap.exists()) {
          const content = snap.data().content || ""
          setSummary(
            content.startsWith(FALLBACK_PREFIX) ? "" : content
          )
        } else {
          setSummary("")
        }
        setLoading(false)
      })

      /* ---------- GOALS ---------- */
      const goalsQuery = query(
        collection(db, "sessions", sessionId, "goals"),
        orderBy("createdAt", "asc")
      )

      unsubGoals = onSnapshot(goalsQuery, async snap => {
        const data = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Goal, "id">),
        }))

        setGoals(data)

        // 🔗 DASHBOARD SYNC (authoritative)
        const incompleteGoals = data
          .filter(g => !g.completed)
          .map(g => g.text)

        await updateDoc(sessionRef, {
          activeGoalsPreview: incompleteGoals,
          goalsCount: incompleteGoals.length,
          updatedAt: serverTimestamp(),
        })
      })
    })

    return () => {
      unsubAuth()
      if (unsubSummary) unsubSummary()
      if (unsubGoals) unsubGoals()
    }
  }, [sessionId])

  /* ---------- SAVE SUMMARY ---------- */
  const saveSummary = async () => {
    if (!isTutor || !auth.currentUser || !sessionId) return

    setSaving(true)
    setSaved(false)
    setError("")

    try {
      await setDoc(
        doc(db, "sessions", sessionId, "summary", "main"),
        {
          content: summary,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser.uid,
        },
        { merge: true }
      )

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError("Failed to save summary.")
    } finally {
      setSaving(false)
    }
  }

  /* ---------- AI SUMMARY ---------- */
  const generateAISummary = async () => {
    if (!isTutor || !sessionId) return

    setGenerating(true)
    setError("")

    try {
      const res = await fetch("/api/ai/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      if (!res.ok) throw new Error()
    } catch {
      setError(
        "AI summary could not be generated. You can write it manually."
      )
    } finally {
      setGenerating(false)
    }
  }

  /* ---------- GOALS ACTIONS ---------- */
  const addGoal = async () => {
    if (
      !newGoal.trim() ||
      !isTutor ||
      sessionStatus !== "active"
    )
      return

    const text = newGoal.trim()

    await addDoc(
      collection(db, "sessions", sessionId, "goals"),
      {
        text,
        completed: false,
        createdAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid,
      }
    )

    setNewGoal("")
  }

  const toggleGoal = async (goal: Goal) => {
    if (!isTutor || sessionStatus !== "active") return

    const completed = !goal.completed

    await updateDoc(
      doc(db, "sessions", sessionId, "goals", goal.id),
      {
        completed,
        completedAt: completed ? serverTimestamp() : null,
      }
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading summary…
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <button
        onClick={() =>
          router.push(`/dashboard/${role}/sessions`)
        }
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to sessions
      </button>

      <h1 className="text-2xl font-semibold">
        Session Summary
      </h1>

      {/* SUMMARY */}
      <div className="rounded-xl border bg-white p-5">
        {isTutor ? (
          <>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Write the session summary here…"
              className="w-full h-[220px] rounded-lg border p-4 text-sm"
            />

            <div className="flex justify-between mt-4 items-center">
              <button
                onClick={generateAISummary}
                disabled={generating}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Generate AI Summary
              </button>

              <button
                onClick={saveSummary}
                disabled={saving}
                className={`px-5 py-2 rounded-lg text-white transition ${
                  saved
                    ? "bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saved
                  ? "Saved ✓"
                  : saving
                  ? "Saving..."
                  : "Save Summary"}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm whitespace-pre-wrap">
            {summary || "No summary available."}
          </p>
        )}
      </div>

      {/* GOALS */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold mb-3">
          Session Goals
        </h2>

        {goals.length === 0 && (
          <p className="text-sm text-slate-500">
            No goals added yet.
          </p>
        )}

        <ul className="space-y-2">
          {goals.map(goal => (
            <li key={goal.id} className="flex gap-3">
              <input
                type="checkbox"
                checked={goal.completed}
                disabled={!isTutor || sessionStatus !== "active"}
                onChange={() => toggleGoal(goal)}
              />
              <span
                className={
                  goal.completed
                    ? "line-through text-slate-400"
                    : ""
                }
              >
                {goal.text}
              </span>
            </li>
          ))}
        </ul>

        {isTutor && sessionStatus === "active" && (
          <div className="mt-4 flex gap-2">
            <input
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              placeholder="Add a new goal…"
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
            />
            <button
              onClick={addGoal}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
