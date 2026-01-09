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
      <section className="flex-1 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Student Dashboard
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Keep tabs on classes, deadlines, and academic health in one place.
          </p>
          <div className="mt-8 grid gap-6 rounded-xl border border-slate-100 bg-slate-50 p-6 sm:grid-cols-3">
            <Stat label="Current GPA" value="3.86" sub="Dean&apos;s List" />
            <Stat label="Credits" value="42 / 60" sub="Spring Target" />
            <Stat label="Attendance" value="97%" sub="Past 30 days" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Today's Schedule">
            <div className="space-y-3">
              {schedule.map((item) => (
                <div
                  key={item.course}
                  className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      {item.time}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{item.course}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{item.location}</p>
                  </div>
                  <span className="rounded-lg border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700">
                    Check in
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Upcoming Assessments">
            <div className="space-y-3">
              {assessments.map((assessment) => (
                <div
                  key={assessment.title}
                  className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {assessment.type}
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {assessment.title}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">Due {assessment.due}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Announcements">
          <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
            <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              🔔 Registrar confirmed add/drop ends Jan 18. Submit schedule
              changes through AIMS++ before 5:00 PM.
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              💼 Career Center expo sign-ups close tonight. Reserve a slot if you
              need mock interview feedback.
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              🧪 CS 482 lab will run in the Innovation Studio next week due to
              hardware maintenance in Hopper Hall.
            </li>
          </ul>
        </Card>
      </section>

      <aside className="w-full max-w-sm space-y-6">
        <Card title="Course Progress">
          <div className="space-y-5">
            {courses.map((course) => (
              <div key={course.name}>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-slate-800">{course.name}</p>
                  <span className="font-semibold text-indigo-600">{course.progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Reminders">
          <ul className="space-y-2.5 text-sm text-slate-700">
            <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="font-medium">Upload scholarship essay draft</span>
              <span className="text-xs font-semibold text-indigo-600">Today</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="font-medium">RSVP to Honors colloquium</span>
              <span className="text-xs font-medium text-slate-500">Tomorrow</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="font-medium">Meet advisor for audit</span>
              <span className="text-xs font-medium text-slate-500">Jan 13</span>
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
                className="rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-center text-sm font-medium text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
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
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{sub}</p>
    </div>
  );
}

type CardProps = {
  title: string;
  children: React.ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
      </div>
      <div className="mt-5 text-slate-600">{children}</div>
    </div>
  );
}
