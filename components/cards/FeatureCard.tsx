type FeatureCardProps = {
  title: string
  description: string
  number?: string
}

export default function FeatureCard({
  title,
  description,
  number,
}: FeatureCardProps) {
  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-900 p-7 shadow-sm
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:shadow-lg
      "
    >
      {/* Glow Background Effect */}
      <div
        className="
          pointer-events-none absolute inset-0 opacity-0
          bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* Number */}
      {number ? (
        <div className="relative mb-4 flex items-center justify-between">
          <span
            className="
              text-sm font-mono font-semibold tracking-wide
              text-slate-400 dark:text-slate-500
              transition-all duration-300
              group-hover:text-blue-600 dark:group-hover:text-blue-400
            "
          >
            {number}
          </span>

          {/* Small Accent Dot */}
          <span
            className="
              h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700
              transition-all duration-300
              group-hover:bg-blue-600 dark:group-hover:bg-blue-400
              group-hover:shadow-[0_0_20px_rgba(59,130,246,0.8)]
            "
          />
        </div>
      ) : null}

      {/* Title */}
      <h3
        className="
          relative text-lg font-semibold tracking-tight
          text-slate-900 dark:text-slate-100
        "
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="
          relative mt-3 text-sm leading-relaxed
          text-slate-600 dark:text-slate-400
        "
      >
        {description}
      </p>

      {/* Bottom Hover Line */}
      <div
        className="
          absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-blue-600 to-indigo-600
          transition-all duration-300
          group-hover:w-full
        "
      />
    </div>
  )
}
