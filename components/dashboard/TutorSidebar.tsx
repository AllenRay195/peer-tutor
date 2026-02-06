"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function TutorSidebar() {
  const pathname = usePathname()

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition
     ${
       pathname === path
         ? "bg-blue-100 text-blue-700 font-medium"
         : "text-slate-700 hover:bg-slate-100"
     }`

  return (
    <aside className="w-56 bg-white border-r border-slate-200 min-h-screen p-4">

      <h2 className="text-lg font-bold mb-6">Tutor</h2>

      <nav className="space-y-2">

        <Link href="/dashboard/tutor" className={linkClass("/dashboard/tutor")}>
          🏠 <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard/tutor/requests"
          className={linkClass("/dashboard/tutor/requests")}
        >
          📩 <span>Requests</span>
        </Link>

        <Link
          href="/dashboard/tutor/profile"
          className={linkClass("/dashboard/tutor/profile")}
        >
          🧑‍🏫 <span>Edit Profile</span>
        </Link>

      </nav>
    </aside>
  )
}
