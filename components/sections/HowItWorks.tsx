import StepCard from "../cards/StepCard"


export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-12">
        
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl font-bold text-slate-900">
            How PeerTutor Works
          </h2>

          <p className="mt-4 text-slate-600">
            Getting started is simple. Create an account, choose your role, and begin learning with peers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <StepCard
            number="1"
            title="Sign Up"
            description="Create an account using your email and set up your student or tutor profile."
          />

          <StepCard
            number="2"
            title="Choose Your Role"
            description="Decide whether you want to learn as a student or teach as a peer tutor."
          />

          <StepCard
            number="3"
            title="Start Learning"
            description="Browse tutors, book sessions, and begin studying together."
          />
        </div>

      </div>
    </section>
  )
}
