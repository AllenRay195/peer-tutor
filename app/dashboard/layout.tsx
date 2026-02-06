"use client"

import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

import DashboardHeader from "@/components/dashboard/DashboardHeader"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null)
        setLoading(false)
        router.replace("/login")
        return
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid))

        if (cancelled) return

        if (!snap.exists()) {
          router.replace("/login")
          return
        }

        const data = snap.data()
        setUserData(data)

        if (pathname === "/dashboard") {
          router.replace(`/dashboard/${data.role}`)
        }
      } catch (err) {
        console.error("Dashboard auth error:", err)
        router.replace("/login")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [router, pathname])

  if (loading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 text-sm">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <DashboardSidebar role={userData.role} />
      <div className="flex-1">
        <DashboardHeader name={userData.name} role={userData.role} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
