"use client"

import { useState } from "react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (subject: string, message: string) => void
  subjects?: string[]
}

export default function RequestModal({
  isOpen,
  onClose,
  onSubmit,
  subjects = [],
}: Props) {
  const [subject, setSubject] = useState(subjects[0] || "")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const canSubmit = subject.trim() !== ""

  const handleSubmit = async () => {
    if (!canSubmit) return

    try {
      setSubmitting(true)
      await onSubmit(subject, message.trim())
      setMessage("")
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-1">
          Send Tutoring Request
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Tell the tutor what you need help with.
        </p>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Subject
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Message <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="I would like help with…"
            className="w-full rounded-lg border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              !canSubmit || submitting
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {submitting ? "Sending…" : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  )
}
