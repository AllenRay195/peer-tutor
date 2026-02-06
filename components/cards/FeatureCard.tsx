type FeatureCardProps = {
  title: string
  description: string
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="p-6 border border-slate-200 rounded-xl hover:shadow-sm transition">
      <h3 className="text-lg font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
