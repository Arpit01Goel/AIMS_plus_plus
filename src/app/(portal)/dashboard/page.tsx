const schedule = [
  {
    time: "08:30",
    course: "Advanced Algorithms",
    location: "Hopper Hall 204",
  },
  { time: "11:15", course: "Linear Systems", location: "Euler 110" },
  { time: "14:00", course: "Sociology of Tech", location: "Dana 3F" },
];

const assessments = [
  { title: "Machine Learning Lab Report", due: "Jan 12", type: "Lab" },
  { title: "Discrete Math Quiz", due: "Jan 14", type: "Quiz" },
  { title: "Capstone Sprint Review", due: "Jan 16", type: "Review" },
];

const courses = [
  { name: "CS 482: ML Systems", progress: 76 },
  { name: "EE 332: Signals", progress: 61 },
  { name: "HUM 214: Ethics", progress: 88 },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <section className="flex-1 space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_120px_-45px_rgba(15,15,35,0.8)] backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">
            Welcome back
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            AIMS++ Student Dashboard
          </h1>
          <p className="mt-4 text-base text-slate-300">
            Keep tabs on classes, deadlines, and academic health in one place.
          </p>
          <div className="mt-8 grid gap-6 rounded-2xl bg-black/30 p-6 sm:grid-cols-3">
            <Stat label="Current GPA" value="3.86" sub="Dean&apos;s List" />
            <Stat label="Credits" value="42 / 60" sub="Spring Target" />
            <Stat label="Attendance" value="97%" sub="Past 30 days" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Today&apos;s Schedule">
            <div className="space-y-4">
              {schedule.map((item) => (
                <div
                  key={item.course}
                  className="flex items-start justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm uppercase tracking-wide text-emerald-300/70">
                      {item.time}
                    </p>
                    <p className="text-lg font-medium text-white">{item.course}</p>
                    <p className="text-sm text-slate-300">{item.location}</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs text-emerald-200">
                    Check in
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Upcoming Assessments">
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div
                  key={assessment.title}
                  className="rounded-2xl border border-white/5 bg-linear-to-r from-slate-900 to-slate-800 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                    {assessment.type}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {assessment.title}
                  </p>
                  <p className="text-sm text-slate-300">Due {assessment.due}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Announcements">
          <ul className="space-y-3 text-sm text-slate-200">
            <li className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              🔔 Registrar confirmed add/drop ends Jan 18. Submit schedule
              changes through AIMS++ before 5:00 PM.
            </li>
            <li className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              💼 Career Center expo sign-ups close tonight. Reserve a slot if you
              need mock interview feedback.
            </li>
            <li className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              🧪 CS 482 lab will run in the Innovation Studio next week due to
              hardware maintenance in Hopper Hall.
            </li>
          </ul>
        </Card>
      </section>

      <aside className="w-full max-w-sm space-y-6">
        <Card title="Course Progress">
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.name}>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-slate-200">{course.name}</p>
                  <span className="text-emerald-200">{course.progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-300 to-emerald-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Reminders">
          <ul className="space-y-3 text-sm text-slate-200">
            <li className="flex justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              Upload scholarship essay draft
              <span className="text-emerald-300">Today</span>
            </li>
            <li className="flex justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              RSVP to Honors colloquium
              <span className="text-slate-400">Tomorrow</span>
            </li>
            <li className="flex justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              Meet advisor for audit
              <span className="text-slate-400">Jan 13</span>
            </li>
          </ul>
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            {[
              "Check In",
              "Upload Work",
              "Book Advising",
              "Request Transcript",
            ].map((action) => (
              <button
                key={action}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center text-sm font-medium text-white transition hover:border-emerald-400/60 hover:text-emerald-200"
              >
                {action}
              </button>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  );
}

type StatProps = {
  label: string;
  value: string;
  sub: string;
};

function Stat({ label, value, sub }: StatProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.35em] text-white/70">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="text-sm text-slate-300">{sub}</p>
    </div>
  );
}

type CardProps = {
  title: string;
  children: React.ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_-35px_rgba(15,15,35,0.9)] backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
