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
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Key Milestones
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Academic Calendar
            </h1>
            <p className="text-sm text-slate-600">
              Track registration, classes, assessments, and results for AY
              2025-26
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
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${meta.badge}`}
                >
                  {items.length} events
                </span>
              </div>

              <div className="relative mt-6 pl-6">
                <span className="absolute left-3 top-2 bottom-2 w-px bg-slate-100" />
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
                    let statusDetail = item.endDate !== "N/A" ? `on ${item.endDate}` : "";
                    let statusTone = "bg-slate-100 text-slate-600";

                    if (isUpcoming && daysUntilStart !== null) {
                      statusLabel = "Upcoming";
                      statusDetail = `in ${daysUntilStart} day${daysUntilStart === 1 ? "" : "s"}`;
                      statusTone = "bg-indigo-50 text-indigo-700";
                    } else if (isOngoing) {
                      statusLabel = "Ongoing";
                      statusDetail =
                        item.endDate === "N/A"
                          ? "until further notice"
                          : `till ${item.endDate}`;
                      statusTone = "bg-indigo-100 text-indigo-800";
                    }

                    return (
                      <li
                        key={`${category}-${index}`}
                        className="relative rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 shadow-sm transition hover:border-indigo-200 hover:bg-white"
                      >
                        <span
                          className={`absolute -left-6 top-5 h-3 w-3 rounded-full border-4 border-white ${meta.dot}`}
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.event}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Start {item.startDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                End {item.endDate}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
                            >
                              {statusLabel}
                            </span>
                            {statusDetail && (
                              <p className="mt-1 text-xs text-slate-500">
                                {statusDetail}
                              </p>
                            )}
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
