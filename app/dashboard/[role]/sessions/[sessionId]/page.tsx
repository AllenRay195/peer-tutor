"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"

type Message = {
  id: string
  senderId: string
  senderRole: "student" | "tutor"
  text: string
  createdAt?: any
  delivered?: boolean
  seen?: boolean
}

type Goal = {
  id: string
  text: string
  completed: boolean
}

export default function SessionChatPage() {
  const { sessionId, role } = useParams<{
    sessionId: string
    role: "student" | "tutor"
  }>()

  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [sessionStatus, setSessionStatus] =
    useState<"active" | "closed">("active")

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  /* ---------- AUTOSCROLL ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 60
    setShowScrollBtn(!atBottom)
  }

  /* ---------- AUTH → SESSION → SNAPSHOTS ---------- */
  useEffect(() => {
    if (!sessionId) return

    let unsubMessages: (() => void) | null = null
    let unsubGoals: (() => void) | null = null
    let cancelled = false

    const unsubAuth = onAuthStateChanged(auth, async user => {
      if (!user || cancelled) return

      try {
        const sessionRef = doc(db, "sessions", sessionId)
        const sessionSnap = await getDoc(sessionRef)

        if (!sessionSnap.exists()) {
          router.replace(`/dashboard/${role}/sessions`)
          return
        }

        const session = sessionSnap.data()
        setSessionStatus(session.status)

        const isStudent =
          role === "student" && session.studentId === user.uid
        const isTutor =
          role === "tutor" && session.tutorId === user.uid

        if (!isStudent && !isTutor) {
          router.replace(`/dashboard/${role}/sessions`)
          return
        }

        // ---------- MESSAGES ----------
        const messagesQuery = query(
          collection(db, "sessions", sessionId, "messages"),
          orderBy("createdAt", "asc")
        )

        unsubMessages = onSnapshot(messagesQuery, snap => {
          const data = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
          })) as Message[]

          setMessages(data)
          setLoading(false)

          if (session.status === "active") {
            snap.docs.forEach(d => {
              const m = d.data()
              if (m.senderId !== user.uid && m.seen === false) {
                updateDoc(d.ref, { seen: true })
              }
            })
          }
        })

        // ---------- GOALS ----------
        const goalsQuery = query(
          collection(db, "sessions", sessionId, "goals"),
          orderBy("createdAt", "asc")
        )

        unsubGoals = onSnapshot(goalsQuery, snap => {
          setGoals(
            snap.docs.map(d => ({
              id: d.id,
              ...(d.data() as any),
            }))
          )
        })
      } catch (err) {
        console.error("Session chat error:", err)
        router.replace(`/dashboard/${role}/sessions`)
      }
    })

    return () => {
      cancelled = true
      if (unsubMessages) unsubMessages()
      if (unsubGoals) unsubGoals()
      unsubAuth()
    }
  }, [sessionId, role, router])

  /* ---------- SEND MESSAGE ---------- */
  const sendMessage = async () => {
    const user = auth.currentUser
    if (!user || !text.trim() || sessionStatus !== "active") return

    await addDoc(
      collection(db, "sessions", sessionId, "messages"),
      {
        senderId: user.uid,
        senderRole: role,
        text,
        createdAt: serverTimestamp(),
        delivered: true,
        seen: false,
      }
    )

    setText("")
  }

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <button
            onClick={() =>
              router.push(`/dashboard/${role}/sessions`)
            }
            className="text-sm text-blue-600 hover:underline mb-1"
          >
            ← Back to sessions
          </button>
          <h1 className="text-xl font-semibold">
            Session Chat
          </h1>
        </div>

        <button
          onClick={() =>
            router.push(
              `/dashboard/${role}/sessions/${sessionId}/summary`
            )
          }
          className="text-sm bg-slate-200 px-3 py-1 rounded hover:bg-slate-300"
        >
          Summary & Goals
        </button>
      </div>

      {/* Session ended */}
      {sessionStatus === "closed" && (
        <div className="mb-3 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm text-yellow-700">
          This session has ended. Messages are read-only.
        </div>
      )}

      {/* Set goals banner */}
      {role === "tutor" &&
        sessionStatus === "active" &&
        goals.length === 0 && (
          <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm">
            <p className="font-medium text-indigo-700">
              Set session goals
            </p>
            <p className="text-indigo-600 mt-1">
              Define what you and the student should focus on.
            </p>
            <button
              onClick={() =>
                router.push(
                  `/dashboard/${role}/sessions/${sessionId}/summary`
                )
              }
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700"
            >
              Add goals
            </button>
          </div>
        )}

      {/* Goals list */}
      {goals.length > 0 && (
        <div className="mb-4 rounded-xl border bg-white p-4">
          <p className="text-sm font-medium mb-2">
            Session Goals
          </p>
          <ul className="space-y-2 text-sm">
            {goals.map(goal => (
              <li key={goal.id} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  disabled={
                    role !== "tutor" ||
                    sessionStatus !== "active"
                  }
                  onChange={async () => {
                    if (role !== "tutor") return
                    await updateDoc(
                      doc(
                        db,
                        "sessions",
                        sessionId,
                        "goals",
                        goal.id
                      ),
                      { completed: !goal.completed }
                    )
                  }}
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
        </div>
      )}

      {/* Chat */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-4 mb-4 bg-slate-50 p-4 rounded-xl"
      >
        {!loading &&
          messages.map(msg => {
            const mine =
              msg.senderId === auth.currentUser?.uid
            const time =
              msg.createdAt?.toDate?.().toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              ) || ""

            return (
              <div
                key={msg.id}
                className={`flex ${
                  mine ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-[65%]">
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm whitespace-pre-wrap ${
                      mine
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div
                    className={`text-xs text-slate-400 mt-1 ${
                      mine ? "text-right" : "text-left"
                    }`}
                  >
                    {time}
                    {mine &&
                      (msg.seen
                        ? " • Seen"
                        : msg.delivered
                        ? " • Delivered"
                        : "")}
                  </div>
                </div>
              </div>
            )
          })}

        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={() =>
            bottomRef.current?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className="fixed bottom-24 right-8 bg-blue-600 text-white px-4 py-2 rounded-full shadow"
        >
          ↓ New
        </button>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sessionStatus !== "active"}
          placeholder={
            sessionStatus === "active"
              ? "Type a message…"
              : "Session ended — chat is read-only"
          }
          rows={1}
          className="flex-1 resize-none rounded-xl border px-4 py-2 disabled:bg-slate-100"
          onKeyDown={e => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              sessionStatus === "active"
            ) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={sessionStatus !== "active"}
          className="bg-blue-600 text-white px-4 rounded-xl disabled:bg-slate-400"
        >
          Send
        </button>
      </div>
    </div>
  )
}
