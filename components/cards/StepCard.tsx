type StepCardProps = {
  number: string
  title: string
  description: string
}

export default function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div
      className="
        group relative rounded-2xl border border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-900 p-8 shadow-sm
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:shadow-lg
      "
    >
      {/* Glow background effect */}
      <div
        className="
          pointer-events-none absolute inset-0 opacity-0
          bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      <div className="relative flex flex-col gap-4">
        {/* Number */}
        <div
          className="
            w-12 h-12 flex items-center justify-center rounded-full
            bg-blue-700 text-white font-bold text-lg
            transition-all duration-300
            group-hover:shadow-[0_0_25px_rgba(37,99,235,0.8)]
            group-hover:scale-110
          "
        >
          {number}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom highlight line */}
      <div
        className="
          absolute bottom-0 left-0 h-[3px] w-0
          bg-gradient-to-r from-blue-600 to-indigo-600
          transition-all duration-300
          group-hover:w-full
        "
      />
    </div>
  )
}
