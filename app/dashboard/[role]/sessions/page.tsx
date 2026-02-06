"use client"

import { useParams } from "next/navigation"
import TutorSessionsPage from "@/components/sessions/TutorSessionsPage"
import StudentSessionsPage from "@/components/sessions/StudentSessionsPage"

export default function SessionsIndexPage() {
  const { role } = useParams<{ role: "student" | "tutor" }>()

  if (role === "tutor") {
    return <TutorSessionsPage />
  }

  return <StudentSessionsPage />
}
