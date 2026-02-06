"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function TutorEditProfilePage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState("")
  const [isActive, setIsActive] = useState(true)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser
      if (!user) return

      const tutorRef = doc(db, "tutors", user.uid)
      const tutorSnap = await getDoc(tutorRef)

      if (tutorSnap.exists()) {
        const data = tutorSnap.data()
        setName(data.name ?? "")
        setBio(data.bio ?? "")
        setSubjects(Array.isArray(data.subjects) ? data.subjects : [])
        setIsActive(data.isActive ?? true)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  /* ---------- ADD SUBJECT (ENTER KEY) ---------- */
  const handleAddSubject = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return
    e.preventDefault()

    commitSubject()
  }

  /* ---------- COMMIT SUBJECT INPUT ---------- */
  const commitSubject = () => {
    const value = subjectInput.trim()
    if (!value) return

    setSubjects(prev =>
      prev.includes(value) ? prev : [...prev, value]
    )

    setSubjectInput("")
  }

  const removeSubject = (subject: string) => {
    setSubjects(prev => prev.filter(s => s !== subject))
  }

  const handleSave = async () => {
    const user = auth.currentUser
    if (!user) return

    try {
      setSaving(true)

      // 🔥 ENSURE LAST SUBJECT IS SAVED EVEN WITHOUT ENTER
      if (subjectInput.trim()) {
        commitSubject()
      }

      const uid = user.uid

      // Update users collection (name source of truth)
      await updateDoc(doc(db, "users", uid), { name })

      // Update tutor profile
      await updateDoc(doc(db, "tutors", uid), {
        name,
        bio,
        subjects: subjectInput.trim()
          ? [...subjects, subjectInput.trim()]
          : subjects,
        isActive,
        updatedAt: new Date(),
      })

      router.refresh()
      router.push("/dashboard/tutor")

    } catch (err) {
      console.error(err)
      alert("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-slate-600">Loading profile...</p>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
      <p className="text-slate-600 mb-6">
        Update how students see you.
      </p>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Display Name
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* Bio */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={4}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* Subjects */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Subjects you teach
        </label>

        <input
          value={subjectInput}
          onChange={e => setSubjectInput(e.target.value)}
          onKeyDown={handleAddSubject}
          placeholder="Type subject and press Enter"
          className="w-full rounded-lg border px-3 py-2 mb-2"
        />

        <div className="flex flex-wrap gap-2">
          {subjects.map(subject => (
            <span
              key={subject}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
            >
              {subject}
              <button
                onClick={() => removeSubject(subject)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6 flex items-center gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
        <span>Available for tutoring</span>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  )
}
