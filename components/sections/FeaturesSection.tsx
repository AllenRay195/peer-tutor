import FeatureCard from "../cards/FeatureCard"


export default function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-12">

        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl font-bold text-slate-900">
            Key Features
          </h2>

          <p className="mt-4 text-slate-600">
            Everything you need to connect with peers and start learning effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard
            title="Verified Peer Tutors"
            description="Browse profiles of student tutors verified by your school or institution."
          />

          <FeatureCard
            title="Subject-Based Matching"
            description="Find tutors by subject, grade level, or specific topics you need help with."
          />

          <FeatureCard
            title="Flexible Scheduling"
            description="Book sessions at times that fit your school and personal schedule."
          />

          <FeatureCard
            title="Ratings & Reviews"
            description="Read feedback from other students to choose the right tutor."
          />

          <FeatureCard
            title="Session Management"
            description="View upcoming sessions, manage bookings, and track your learning progress."
          />

          <FeatureCard
            title="Tutor Dashboard"
            description="Tutors can manage availability, sessions, and student requests easily."
          />
        </div>

      </div>
    </section>
  )
}
