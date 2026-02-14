import Navbar from "@/components/navbar/Navbar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
