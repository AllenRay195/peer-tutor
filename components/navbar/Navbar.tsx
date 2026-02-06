"use client"

import { useState, useEffect } from "react"
import BookLogo from "@/components/ui/BookLogo"
import Link from "next/link"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition
        ${scrolled ? "bg-white shadow-sm" : "bg-transparent"}`}
    >
      <div className="mx-auto max-w-7xl px-12 h-20 grid grid-cols-3 items-center">

        {/* Left: Logo */}
        <div className="flex items-center h-full">
          <BookLogo />
        </div>

        {/* Center: Links */}
        <div className="flex justify-center gap-10 text-slate-700">
          <a
            href="#how-it-works"
            className="relative hover:text-slate-900 transition
              after:absolute after:left-0 after:-bottom-1
              after:h-[2px] after:w-0 after:bg-blue-600
              after:transition-all after:duration-300
              hover:after:w-full"
          >
            About
          </a>

          <a
            href="#features"
            className="relative hover:text-slate-900 transition
              after:absolute after:left-0 after:-bottom-1
              after:h-[2px] after:w-0 after:bg-blue-600
              after:transition-all after:duration-300
              hover:after:w-full"
          >
            Features
          </a>

          <a
            href="#contact"
            className="relative hover:text-slate-900 transition
              after:absolute after:left-0 after:-bottom-1
              after:h-[2px] after:w-0 after:bg-blue-600
              after:transition-all after:duration-300
              hover:after:w-full"
          >
            Contact
          </a>
        </div>

        {/* Right: Auth */}
        <div className="flex justify-end items-center gap-6">
          <Link
            href="/login"
            className="text-slate-700 hover:text-slate-900 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-5 py-2 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 transition"
          >
            Register
          </Link>
        </div>

      </div>
    </nav>
  )
}
