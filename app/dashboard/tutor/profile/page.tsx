"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import TutorCard from "@/components/cards/TutorCard"

const BIO_MAX_LENGTH = 500

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-1" />
        <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-slate-200" />
          <div className="flex-1">
            <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
            <div className="h-4 bg-slate-100 rounded w-24" />
          </div>
        </div>
        <div className="h-10 bg-slate-100 rounded w-full" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
        <div className="h-4 bg-slate-100 rounded w-full mb-4" />
        <div className="h-24 bg-slate-100 rounded w-full" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
        <div className="h-10 bg-slate-100 rounded w-full mb-4" />
        <div className="flex flex-wrap gap-2">
          <div className="h-7 w-20 bg-slate-100 rounded-full" />
          <div className="h-7 w-24 bg-slate-100 rounded-full" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-48 mb-2" />
        <div className="h-6 w-12 bg-slate-100 rounded-full" />
      </div>

      <div className="h-10 w-28 bg-slate-200 rounded-lg animate-pulse" />
    </div>
  )
}

export default function TutorEditProfilePage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [ratingTotal, setRatingTotal] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

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
        setRatingTotal(data.ratingTotal ?? 0)
        setRatingCount(data.ratingCount ?? 0)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleAddSubject = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return
    e.preventDefault()
    commitSubject()
  }

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

  const validateName = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError("Display name is required.")
      return false
    }
    setNameError("")
    return true
  }

  const handleSave = async () => {
    setSaveError("")
    setSaveSuccess(false)
    if (!validateName()) return

    const user = auth.currentUser
    if (!user) return

    try {
      setSaving(true)
      if (subjectInput.trim()) commitSubject()

      const uid = user.uid
      const finalSubjects = subjectInput.trim()
        ? [...subjects, subjectInput.trim()]
        : subjects

      await updateDoc(doc(db, "users", uid), { name: name.trim() })
      await updateDoc(doc(db, "tutors", uid), {
        name: name.trim(),
        bio,
        subjects: finalSubjects,
        isActive,
        updatedAt: new Date(),
      })

      setSaveSuccess(true)
      router.refresh()
      setTimeout(() => {
        router.push("/dashboard/tutor")
      }, 1500)
    } catch (err) {
      console.error(err)
      setSaveError("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <ProfileSkeleton />
      </div>
    )
  }

  const user = auth.currentUser
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?"

  const previewTutor = {
    id: user?.uid ?? "",
    name: name.trim() || "Your name",
    bio: bio || undefined,
    subjects,
    isActive,
    ratingTotal,
    ratingCount,
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Profile</h1>
        <p className="text-slate-600">
          Update how students see you.
        </p>
      </div>

      {/* Success / Error banners */}
      {saveSuccess && (
        <div
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          Profile saved. Redirecting to dashboard…
        </div>
      )}
      {saveError && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {/* Public info */}
      <section
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        aria-labelledby="public-info-heading"
      >
        <h2 id="public-info-heading" className="text-sm font-medium text-slate-500 mb-4">
          Public info
        </h2>
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shrink-0"
            aria-hidden
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1">
              Display name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value)
                if (nameError) setNameError("")
              }}
              onBlur={validateName}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "profile-name-error" : undefined}
              className={`w-full rounded-lg border px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                nameError ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Name students will see"
            />
            {nameError && (
              <p id="profile-name-error" className="mt-1 text-sm text-red-600">
                {nameError}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        aria-labelledby="about-heading"
      >
        <h2 id="about-heading" className="text-sm font-medium text-slate-500 mb-4">
          About
        </h2>
        <label htmlFor="profile-bio" className="block text-sm font-medium text-slate-700 mb-1">
          Bio
        </label>
        <p className="text-xs text-slate-500 mb-2">
          What students see when they browse tutors.
        </p>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={4}
          maxLength={BIO_MAX_LENGTH}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          placeholder="Introduce yourself and your teaching style…"
        />
        <p className="mt-1 text-xs text-slate-400">
          {bio.length}/{BIO_MAX_LENGTH}
        </p>
      </section>

      {/* Subjects */}
      <section
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        aria-labelledby="subjects-heading"
      >
        <h2 id="subjects-heading" className="text-sm font-medium text-slate-500 mb-4">
          Subjects you teach
        </h2>
        <label htmlFor="profile-subject-input" className="block text-sm font-medium text-slate-700 mb-1">
          Add subjects
        </label>
        <div className="flex gap-2 mb-2">
          <input
            id="profile-subject-input"
            type="text"
            value={subjectInput}
            onChange={e => setSubjectInput(e.target.value)}
            onKeyDown={handleAddSubject}
            placeholder="Type subject and press Enter"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          />
          <button
            type="button"
            onClick={commitSubject}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map(subject => (
            <span
              key={subject}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
            >
              {subject}
              <button
                type="button"
                onClick={() => removeSubject(subject)}
                className="text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                aria-label={`Remove ${subject}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Availability */}
      <section
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        aria-labelledby="availability-heading"
      >
        <h2 id="availability-heading" className="text-sm font-medium text-slate-500 mb-4">
          Availability
        </h2>
        <div className="flex items-start gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-labelledby="availability-label"
            onClick={() => setIsActive(prev => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isActive ? "bg-indigo-600" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                isActive ? "translate-x-5" : "translate-x-0.5"
              }`}
              aria-hidden
            />
          </button>
          <div id="availability-label">
            <span className="text-sm font-medium text-slate-900">
              Available for tutoring
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              When off, you won’t appear as available to students.
            </p>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        {!name.trim() && (
          <span className="text-sm text-slate-500">
            Enter a display name to save.
          </span>
        )}
      </div>

      {/* Preview */}
      <section
        className="rounded-xl border border-slate-200 bg-slate-50/50 p-6"
        aria-labelledby="preview-heading"
      >
        <h2 id="preview-heading" className="text-sm font-medium text-slate-500 mb-4">
          Preview
        </h2>
        <div className="max-w-sm">
          <TutorCard
            tutor={previewTutor}
            preview
          />
        </div>
      </section>
    </div>
  )
}
