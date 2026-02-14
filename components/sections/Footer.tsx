export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-14"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 grid grid-cols-1 md:grid-cols-3 items-center gap-8">

        {/* Left: Brand */}
        <div className="text-slate-900 dark:text-slate-100 font-semibold text-lg text-center md:text-left">
          PeerTutor
        </div>

        {/* Center: Links */}
        <div className="flex justify-center gap-10 text-slate-600 dark:text-slate-400 font-medium">
          <a
            href="#how-it-works"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            About
          </a>

          <a
            href="#features"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            Features
          </a>

          <a
            href="#contact"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            Contact
          </a>
        </div>

        {/* Right: Copyright */}
        <div className="text-slate-500 dark:text-slate-500 text-sm text-center md:text-right">
          © {new Date().getFullYear()} PeerTutor. All rights reserved.
        </div>

      </div>
    </footer>
  )
}
