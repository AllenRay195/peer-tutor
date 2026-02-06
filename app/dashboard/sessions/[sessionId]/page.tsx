"use client"

import { useEffect, useState } from "react"
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useParams } from "next/navigation"

type Message = {
  id: string
  senderId: string
  text: string
}

export default function SessionChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (!sessionId) return

    const q = query(
      collection(db, "sessions", sessionId, "messages"),
      orderBy("createdAt", "asc")
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[]
      )
    })

    return () => unsubscribe()
  }, [sessionId])

  const sendMessage = async () => {
    if (!auth.currentUser || !newMessage.trim()) return

    await addDoc(
      collection(db, "sessions", sessionId, "messages"),
      {
        senderId: auth.currentUser.uid,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
      }
    )

    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      <h1 className="text-xl font-semibold mb-4">Session Chat</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map(msg => {
          const isMine = msg.senderId === auth.currentUser?.uid

          return (
            <div
              key={msg.id}
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                isMine
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-slate-200 text-slate-800"
              }`}
            >
              {msg.text}
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  )
}
