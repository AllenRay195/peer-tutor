"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faHouse,
  faInbox,
  faUserPen,
  faComments,
} from "@fortawesome/free-solid-svg-icons"

type Props = {
  role: "student" | "tutor"
}

export default function DashboardSidebar({ role }: Props) {
  const pathname = usePathname()

  const links =
    role === "tutor"
      ? [
          {
            label: "Dashboard",
            href: "/dashboard/tutor",
            icon: faHouse,
            exact: true,
          },
          {
            label: "Requests",
            href: "/dashboard/tutor/requests",
            icon: faInbox,
          },
          {
            label: "Sessions",
            href: "/dashboard/tutor/sessions",
            icon: faComments,
          },
          {
            label: "Edit Profile",
            href: "/dashboard/tutor/profile",
            icon: faUserPen,
          },
        ]
      : [
          {
            label: "Dashboard",
            href: "/dashboard/student",
            icon: faHouse,
            exact: true,
          },
          {
            label: "My Requests",
            href: "/dashboard/student/requests",
            icon: faInbox,
          },
          {
            label: "My Sessions",
            href: "/dashboard/student/sessions",
            icon: faComments,
          },
        ]

  return (
    <aside className="w-64 min-h-screen border-r bg-white px-4 py-6 flex flex-col">
      {/* Panel Title */}
      <div className="mb-8 px-2">
        <h2 className="text-lg font-semibold text-slate-900">
          {role === "tutor" ? "Tutor Panel" : "Student Panel"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {role === "tutor"
            ? "Manage your teaching"
            : "Manage your learning"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <FontAwesomeIcon
                icon={link.icon}
                className={`text-sm transition-colors
                  ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }
                `}
              />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />
    </aside>
  )
}
