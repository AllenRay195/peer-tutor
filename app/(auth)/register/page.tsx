"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !role) {
      setError("Please fill in all fields.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    try {
      setLoading(true)

      // 🔐 Create auth account (auto-logs in)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      const user = userCredential.user

      // 👤 Base user document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: serverTimestamp(),
      })

      // 🎓 Tutor profile (only if tutor)
      if (role === "tutor") {
        await setDoc(doc(db, "tutors", user.uid), {
          uid: user.uid,
          name,
          bio: "",
          subjects: [],
          isActive: true,
          createdAt: serverTimestamp(),
        })
      }

      // ✅ AUTO REDIRECT
      router.push("/dashboard")

    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Create Your Account
        </h1>

        <p className="text-slate-600 mb-6">
          Join PeerTutor as a student or a tutor
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
          >
            <option value="">Select role</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition
              ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}`}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-700 hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  )
}
