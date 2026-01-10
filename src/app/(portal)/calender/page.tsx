"use client";

import { Calendar, Clock } from "lucide-react";

type CategoryKey =
  | "registration"
  | "academic"
  | "feedback"
  | "exam"
  | "grades";

type AcademicEvent = {
  event: string;
  startDate: string;
  endDate: string;
  category: CategoryKey;
};

const currentSession = "2025-II"

const academicEvents: AcademicEvent[] = [
  {
    event: "Course pre-registration",
    startDate: "04-12-2025",
    endDate: "04-01-2026",
    category: "registration",
  },
  {
    event: "Course drop",
    startDate: "05-01-2026",
    endDate: "19-01-2026",
    category: "registration",
  },
  {
    event: "Withdraw",
    startDate: "05-03-2026",
    endDate: "13-03-2026",
    category: "registration",
  },
  {
    event: "Classes",
    startDate: "05-01-2026",
    endDate: "30-04-2026",
    category: "academic",
  },
  {
    event: "Midsem course feedback",
    startDate: "16-02-2026",
    endDate: "23-02-2026",
    category: "feedback",
  },
  {
    event: "Course feedback",
    startDate: "24-04-2026",
    endDate: "02-05-2026",
    category: "feedback",
  },
  {
    event: "Show feedback (midsem)",
    startDate: "06-03-2026",
    endDate: "N/A",
    category: "feedback",
  },
  {
    event: "Show feedback (endsem)",
    startDate: "29-05-2026",
    endDate: "N/A",
    category: "feedback",
  },
  {
    event: "Mid sem exams",
    startDate: "25-02-2026",
    endDate: "03-03-2026",
    category: "exam",
  },
  {
    event: "End sem exams",
    startDate: "04-05-2026",
    endDate: "13-05-2026",
    category: "exam",
  },
  {
    event: "Grades submission",
    startDate: "04-05-2026",
    endDate: "19-05-2026",
    category: "grades",
  },
  {
    event: "Result Declaration",
    startDate: "29-05-2026",
    endDate: "N/A",
    category: "grades",
  },
];

const categoryMeta: Record<
  CategoryKey,
  {
    label: string;
    description: string;
    accent: string;
    badge: string;
    dot: string;
  }
> = {
  registration: {
    label: "Registration Milestones",
    description: "Enrollment, drop, and withdrawal deadlines",
    accent: "text-indigo-700",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-900",
    dot: "bg-indigo-500",
  },
  academic: {
    label: "Academic Progress",
    description: "Daily teaching and instructional periods",
    accent: "text-indigo-700",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-900",
    dot: "bg-indigo-500",
  },
  feedback: {
    label: "Feedback Windows",
    description: "Mid-semester and end-semester surveys",
    accent: "text-indigo-700",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-900",
    dot: "bg-indigo-500",
  },
  exam: {
    label: "Assessment Blocks",
    description: "Midterm and final examination periods",
    accent: "text-indigo-700",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-900",
    dot: "bg-indigo-500",
  },
  grades: {
    label: "Results & Publishing",
    description: "Grade submissions and announcements",
    accent: "text-indigo-700",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-900",
    dot: "bg-indigo-500",
  }
};

const categoryOrder: CategoryKey[] = [
  "registration",
  "academic",
  "feedback",
  "exam",
  "grades",
];

function formatCategoryTitle(category: CategoryKey) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getDaysRemaining(dateStr: string): number | null {
  if (dateStr === "N/A") return null;
  const [day, month, year] = dateStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  const diff = targetDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function sortByDate(a: AcademicEvent, b: AcademicEvent) {
  const getValue = (dateStr: string) => {
    if (dateStr === "N/A") return Number.MAX_SAFE_INTEGER;
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  return getValue(a.startDate) - getValue(b.startDate);
}

export default function CalenderPage() {
  const groupedEvents = categoryOrder.reduce(
    (acc, key) => {
      acc[key] = academicEvents
        .filter((event) => event.category === key)
        .sort(sortByDate);
      return acc;
    },
    {} as Record<CategoryKey, AcademicEvent[]>,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
            <Calendar className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Academic Calendar
            </h1>
            <p className="text-sm text-slate-600">
              Track registration, classes, assessments, and results
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {categoryOrder.map((category) => {
          const items = groupedEvents[category];
          if (!items || items.length === 0) return null;

          const meta = categoryMeta[category];
          const title = formatCategoryTitle(category);

          return (
            <section
              key={category}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-semibold tracking-tight ${meta.accent}`}>
                    {title}
                  </h2>
                  <p className="text-sm text-slate-600">{meta.description}</p>
                </div>
                {/* <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${meta.badge}`}
                >
                  {items.length} events
                </span> */}
              </div>

              <div className="mt-6">
                <ol className="space-y-3">
                  {items.map((item, index) => {
                    const daysUntilStart = getDaysRemaining(item.startDate);
                    const daysUntilEnd = getDaysRemaining(item.endDate);
                    const isUpcoming = daysUntilStart !== null && daysUntilStart > 0;
                    const isOngoing =
                      daysUntilStart !== null &&
                      daysUntilStart <= 0 &&
                      (item.endDate === "N/A" || (daysUntilEnd !== null && daysUntilEnd >= 0));

                    let statusLabel = "Completed";
                    let bulletTone = "bg-slate-400 shadow-[0_0_8px_rgba(99,102,241,0.55)]";

                    if (isUpcoming && daysUntilStart !== null) {
                      statusLabel = "Upcoming";
                      bulletTone = "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.55)]";
                    } else if (isOngoing) {
                      statusLabel = "Ongoing";
                      bulletTone = "bg-indigo-700 animate-[pulse_0.9s_ease-in-out_infinite] shadow-[0_0_8px_rgba(99,102,241,0.55)]";
                    }

                    return (
                      <li
                        key={`${category}-${index}`}
                        className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm transition hover:border-indigo-200"
                      >
                        <div className="flex flex-col md:flex-row md:items-stretch">
                          <div className="flex items-center gap-4 bg-slate-50/70 px-4 py-3 transition hover:bg-white md:w-[60%]">
                            <span
                              className={`h-4 w-4 rounded-full transition ${bulletTone}`}
                              aria-hidden="true"
                            />
                            <div>
                              <p className="text-base font-semibold text-slate-900 md:text-lg">
                                {item.event}
                              </p>
                              <span className="sr-only">Status: {statusLabel}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 rounded-l-3xl bg-indigo-800 px-4 py-3 sm:flex-row sm:justify-end sm:gap-4 md:w-[40%]">
                            <div className="flex items-center gap-3 border-white/30 bg-transparent px-3 py-2 text-sm sm:w-40 md:w-44 lg:w-48">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                                <Calendar className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                                  Start Date
                                </p>
                                <p className="text-base font-semibold text-white">
                                  {item.startDate}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 border-white/30 bg-transparent px-3 py-2 text-sm sm:w-40 md:w-44 lg:w-48">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                                <Clock className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                                  End Date
                                </p>
                                <p className="text-base font-semibold text-white">
                                  {item.endDate}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
