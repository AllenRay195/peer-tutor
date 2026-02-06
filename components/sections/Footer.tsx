export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-white border-t border-slate-200 py-12"
    >
      <div className="mx-auto max-w-7xl px-12 grid grid-cols-1 md:grid-cols-3 items-center gap-8">

        {/* Left: Brand */}
        <div className="text-slate-800 font-semibold text-center md:text-left">
          PeerTutor
        </div>

        {/* Center: Links */}
        <div className="flex justify-center gap-10 text-slate-600">
          <a href="#how-it-works" className="hover:text-slate-900 transition">
            About
          </a>
          <a href="#features" className="hover:text-slate-900 transition">
            Features
          </a>
          <a href="#contact" className="hover:text-slate-900 transition">
            Contact
          </a>
        </div>

        {/* Right: Copyright */}
        <div className="text-slate-500 text-sm text-center md:text-right">
          © {new Date().getFullYear()} PeerTutor. All rights reserved.
        </div>

      </div>
    </footer>
  )
}
