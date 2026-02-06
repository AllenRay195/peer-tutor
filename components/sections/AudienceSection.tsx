export default function AudienceSection() {
  return (
    <section id="audience" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-12">

        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl font-bold text-slate-900">
            Who Is This Platform For?
          </h2>

          <p className="mt-4 text-slate-600">
            PeerTutor is designed to support both students who need help and peers who want to teach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* For Students */}
          <div className="p-8 border border-slate-200 rounded-2xl">
            <h3 className="text-2xl font-semibold text-slate-900">
              For Students
            </h3>

            <p className="mt-4 text-slate-600 leading-relaxed">
              Get the academic support you need from peers who understand your subjects and your school environment.
            </p>

            <ul className="mt-6 space-y-3 text-slate-700">
              <li>• Find tutors by subject and level</li>
              <li>• Book affordable peer tutoring sessions</li>
              <li>• Track your learning progress</li>
              <li>• Learn at your own pace</li>
            </ul>
          </div>

          {/* For Tutors */}
          <div className="p-8 border border-slate-200 rounded-2xl">
            <h3 className="text-2xl font-semibold text-slate-900">
              For Tutors
            </h3>

            <p className="mt-4 text-slate-600 leading-relaxed">
              Share your knowledge, help other students succeed, and gain valuable teaching experience.
            </p>

            <ul className="mt-6 space-y-3 text-slate-700">
              <li>• Create a tutor profile</li>
              <li>• Set your availability</li>
              <li>• Accept session requests</li>
              <li>• Build your teaching portfolio</li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}
