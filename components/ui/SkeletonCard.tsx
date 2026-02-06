export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/3" />
        </div>
      </div>

      <div className="h-3 bg-slate-200 rounded mb-2" />
      <div className="h-3 bg-slate-200 rounded w-5/6 mb-4" />

      <div className="h-8 bg-slate-200 rounded" />
    </div>
  )
}
