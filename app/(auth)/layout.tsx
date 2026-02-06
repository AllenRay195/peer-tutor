import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Back Button */}
      <div className="fixed top-10 left-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition leading-none"
        >
          <span className="text-xl leading-none">←</span>
          <span className="text-sm font-medium relative top-[2px]">Back</span>
        </Link>
      </div>

      {children}
    </div>
  )
}
