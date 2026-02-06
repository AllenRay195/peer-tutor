type StepCardProps = {
  number: string
  title: string
  description: string
}

export default function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 text-white font-bold">
        {number}
      </div>

      <h3 className="text-xl font-semibold text-slate-900">
        {title}
      </h3>

      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
