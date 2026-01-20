"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

type CategoryKey =
  | "registration"
  | "academic"
  | "feedback"
  | "exam"
  | "grades";

type AcademicEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
  category: CategoryKey;
};

const currentSession = "2025-II";

// Map EventType from database to CategoryKey
const mapEventTypeToCategory = (type: string): CategoryKey => {
  const typeMap: Record<string, CategoryKey> = {
    'REGISTRATION': 'registration',
    'ACADEMIC': 'academic',
    'FEEDBACK': 'feedback',
    'EXAM': 'exam',
    'GRADES': 'grades',
  };
  return typeMap[type] || 'academic';
};

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

// Format date from ISO to DD-MM-YYYY
function formatDate(dateString: string): string {
  if (!dateString || dateString === 'N/A') return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function getDaysRemaining(dateStr: string): number | null {
  if (dateStr === "N/A") return null;
  const targetDate = new Date(dateStr);
  const today = new Date();
  const diff = targetDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function sortByDate(a: AcademicEvent, b: AcademicEvent) {
  const getValue = (dateStr: string) => {
    if (dateStr === "N/A") return Number.MAX_SAFE_INTEGER;
    return new Date(dateStr).getTime();
  };

  return getValue(a.startDate) - getValue(b.startDate);
}

export default function CalenderPage() {
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        
        // Transform API data to match component format
        const transformedEvents: AcademicEvent[] = data.events.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          type: event.type,
          category: mapEventTypeToCategory(event.type),
        }));

        setAcademicEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const groupedEvents = categoryOrder.reduce(
    (acc, key) => {
      acc[key] = academicEvents
        .filter((event) => event.category === key)
        .sort(sortByDate);
      return acc;
    },
    {} as Record<CategoryKey, AcademicEvent[]>,
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-900"></div>
          <p className="mt-4 text-sm text-slate-600">Loading calendar events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Calendar</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 p-8 shadow-lg">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Academic Calendar
            </h1>
            <p className="mt-2 text-indigo-100">
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
                                {item.title}
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
                                  {formatDate(item.startDate)}
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
                                  {formatDate(item.endDate)}
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
