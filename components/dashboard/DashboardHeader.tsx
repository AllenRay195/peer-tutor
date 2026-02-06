"use client"

import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

type Props = {
  name: string
  role: "student" | "tutor"
}

export default function DashboardHeader({ name, role }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  return (
    <header className="w-full border-b bg-white px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome, {name}
        </h2>
        <p className="text-sm text-slate-500 capitalize">
          {role} dashboard
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
      >
        Logout
      </button>
    </header>
  )
}
