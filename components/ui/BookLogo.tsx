"use client"

export default function BookLogo() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <svg
        width="38"
        height="28"
        viewBox="0 0 200 120"
        className="transition-transform duration-300"
      >
        {/* Bottom base */}
        <path
          d="M20 90 Q100 120 180 90"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Left bottom page */}
        <path
          d="M20 80 Q100 110 100 60"
          fill="#38bdf8"
          className="transition-transform duration-300 origin-bottom group-hover:-rotate-6"
        />

        {/* Right bottom page */}
        <path
          d="M180 80 Q100 110 100 60"
          fill="#0ea5e9"
          className="transition-transform duration-300 origin-bottom group-hover:rotate-6"
        />

        {/* Left top page */}
        <path
          d="M40 60 Q100 20 100 60"
          fill="#22d3ee"
          className="transition-transform duration-300 origin-bottom group-hover:-rotate-12"
        />

        {/* Right top page */}
        <path
          d="M160 60 Q100 20 100 60"
          fill="#0284c7"
          className="transition-transform duration-300 origin-bottom group-hover:rotate-12"
        />
      </svg>

      <span className="text-xl font-bold text-slate-900">
        PeerTutor
      </span>
    </div>
  )
}
