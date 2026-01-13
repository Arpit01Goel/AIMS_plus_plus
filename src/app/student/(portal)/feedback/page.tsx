"use client";

import { useState, useEffect } from "react";

type FeedbackType = "mid-sem" | "end-sem" | "";

type Course = {
  code: string;
  name: string;
  instructors: string[];
};

type FeedbackData = {
  feedbackType: FeedbackType;
  courseCode: string;
  instructor: string;
  ratings: Record<number, number>;
  comments: string;
};

// TODO: Replace with API call to fetch enrolled courses for logged-in user
// Example: GET /api/courses/enrolled
const fetchEnrolledCourses = async (): Promise<Course[]> => {
  // Simulate API call with dummy data
  return Promise.resolve([
    { 
      code: "CS304", 
      name: "Operating Systems",
      instructors: ["Dr. Amit Kumar", "Dr. Priya Sharma"]
    },
    { 
      code: "CS305", 
      name: "Database Management Systems",
      instructors: ["Dr. Rajesh Patel"]
    },
    { 
      code: "CS306", 
      name: "Software Engineering",
      instructors: ["Dr. Sneha Gupta", "Dr. Vikram Singh"]
    },
    { 
      code: "CS401", 
      name: "Machine Learning",
      instructors: ["Dr. Anita Desai"]
    },
    { 
      code: "CS402", 
      name: "Computer Networks",
      instructors: ["Dr. Rahul Mehta"]
    },
    { 
      code: "EE201", 
      name: "Digital Electronics",
      instructors: ["Dr. Kavita Reddy"]
    },
    { 
      code: "EE202", 
      name: "Signal Processing",
      instructors: ["Dr. Amit Kumar"]
    },
    { 
      code: "MA301", 
      name: "Numerical Analysis",
      instructors: ["Dr. Priya Sharma", "Dr. Rajesh Patel"]
    },
    { 
      code: "MA302", 
      name: "Probability and Statistics",
      instructors: ["Dr. Sneha Gupta"]
    },
  ]);
};

// TODO: Replace with API call to submit feedback
// Example: POST /api/feedback/submit
const submitFeedback = async (data: FeedbackData): Promise<void> => {
  console.log("Submitting feedback:", data);
  // Simulate API call
  return Promise.resolve();
};

const FEEDBACK_QUESTIONS = [
  "The course content was well-organized and clearly presented.",
  "The instructor was knowledgeable and explained concepts effectively.",
  "The course materials (slides, notes, assignments) were helpful.",
  "The assessments (tests, quizzes, projects) were fair and relevant.",
  "The instructor was accessible and responsive to questions.",
  "The course challenged me to think critically and apply concepts.",
  "The pace of the course was appropriate for the material covered.",
  "Overall, I would recommend this course to other students.",
];

export default function FeedbackPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("");
  const [courseCode, setCourseCode] = useState("");
  const [instructor, setInstructor] = useState("");
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Fetch enrolled courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const enrolledCourses = await fetchEnrolledCourses();
        setCourses(enrolledCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Get instructors for selected course
  const selectedCourse = courses.find((c) => c.code === courseCode);
  const availableInstructors = selectedCourse?.instructors || [];

  // Reset instructor when course changes
  useEffect(() => {
    setInstructor("");
  }, [courseCode]);

  const handleRatingChange = (questionIndex: number, rating: number) => {
    setRatings({ ...ratings, [questionIndex]: rating });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const feedbackData: FeedbackData = {
      feedbackType,
      courseCode,
      instructor,
      ratings,
      comments,
    };

    try {
      await submitFeedback(feedbackData);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFeedbackType("");
        setCourseCode("");
        setInstructor("");
        setRatings({});
        setComments("");
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      // TODO: Show error message to user
    }
  };

  const isFormValid = feedbackType && courseCode && instructor && Object.keys(ratings).length === FEEDBACK_QUESTIONS.length;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-sm text-slate-600">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-green-100 p-3">
            <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900">Feedback Submitted!</h2>
          <p className="mt-2 text-sm text-slate-600">Thank you for your valuable feedback.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 p-8 shadow-lg">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Course Feedback
            </h1>
            <p className="mt-2 text-indigo-100">
              Help us improve by sharing your experience with the course and instructor.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Feedback Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Feedback Type <span className="text-red-500">*</span>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFeedbackType("mid-sem")}
              className={`rounded-lg border px-6 py-3 text-center text-sm font-medium transition-all ${
                feedbackType === "mid-sem"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              Mid-Semester Feedback
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType("end-sem")}
              className={`rounded-lg border px-6 py-3 text-center text-sm font-medium transition-all ${
                feedbackType === "end-sem"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              End-Semester Feedback
            </button>
          </div>
        </div>

        {/* Course Selection */}
        {feedbackType && (
          <div className="animate-fadeIn">
            <label htmlFor="course" className="block text-sm font-semibold text-slate-900">
              Course Code <span className="text-red-500">*</span>
            </label>
            <select
              id="course"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.code} value={course.code}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Instructor Selection */}
        {courseCode && (
          <div className="animate-fadeIn">
            <label htmlFor="instructor" className="block text-sm font-semibold text-slate-900">
              Instructor <span className="text-red-500">*</span>
            </label>
            <select
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Select an instructor</option>
              {availableInstructors.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
            {availableInstructors.length === 0 && (
              <p className="mt-2 text-xs text-slate-500">No instructors available for this course</p>
            )}
          </div>
        )}

        {/* Rating Questions */}
        {instructor && (
          <div className="animate-fadeIn space-y-6">
            <h2 className="text-base font-semibold text-slate-900">Rate Your Experience</h2>
            <p className="text-sm text-slate-600">
              Please rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree)
            </p>

            <div className="space-y-4">
              {FEEDBACK_QUESTIONS.map((question, index) => (
                <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-900">
                    {index + 1}. {question}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-600">Strongly Disagree</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleRatingChange(index, rating)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-all ${
                            ratings[index] === rating
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-600">Strongly Agree</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        {instructor && (
          <div className="animate-fadeIn">
            <label htmlFor="comments" className="block text-sm font-semibold text-slate-900">
              Additional Comments (Optional)
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Share any additional thoughts or suggestions..."
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Submit Button */}
        {instructor && (
          <div className="animate-fadeIn flex justify-end border-t border-slate-200 pt-6">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
                isFormValid
                  ? "bg-gradient-to-r from-indigo-900 to-indigo-700 text-white hover:from-indigo-800 hover:to-indigo-600"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              Submit Feedback
            </button>
          </div>
        )}
      </form>
      </div>
    </div>
  );
}
