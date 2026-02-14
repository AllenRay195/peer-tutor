import FeatureCard from "../cards/FeatureCard"

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-slate-50 dark:bg-slate-950 py-24"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">

        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Key Features
          </h2>

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Everything you need to connect with peers and start learning effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard
            number="01"
            title="Verified Peer Tutors"
            description="Browse profiles of student tutors verified by your school or institution."
          />

          <FeatureCard
            number="02"
            title="Subject-Based Matching"
            description="Find tutors by subject, grade level, or specific topics you need help with."
          />

          <FeatureCard
            number="03"
            title="Flexible Scheduling"
            description="Book sessions at times that fit your school and personal schedule."
          />

          <FeatureCard
            number="04"
            title="Ratings & Reviews"
            description="Read feedback from other students to choose the right tutor."
          />

          <FeatureCard
            number="05"
            title="Session Management"
            description="View upcoming sessions, manage bookings, and track your learning progress."
          />

          <FeatureCard
            number="06"
            title="Tutor Dashboard"
            description="Tutors can manage availability, sessions, and student requests easily."
          />
        </div>

      </div>
    </section>
  )
}
