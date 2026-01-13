"use client";

import { useState, useEffect } from "react";

type StudentProfile = {
  // Personal Information
  fullName: string;
  entryNumber: string;
  profilePicture: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  
  // Academic Information
  program: "B.Tech" | "M.Tech" | "M.Sc" | "Ph.D" | "B.Sc";
  department: string;
  branch: string;
  currentSemester: number;
  enrollmentYear: number;
  expectedGraduationMonth: string;
  expectedGraduationYear: number;
  cgpa: number;
  creditsCompleted: number;
  totalCreditsRequired: number;
  
  // Contact Information
  email: string;
  phoneNumber: string;
  alternatePhone?: string;
  permanentAddress: string;
  currentAddress?: string;
  
  // Guardian Information
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  
  // Additional Information
  nationality: string;
  category: string;
  admissionCategory: string;
};

// TODO: Replace with API call to fetch student profile
const fetchStudentProfile = async (): Promise<StudentProfile> => {
  return Promise.resolve({
    fullName: "Arjun Kumar Sharma",
    entryNumber: "2023CSB1089",
    profilePicture: "/default-avatar.png",
    dateOfBirth: "2005-03-15",
    gender: "Male",
    bloodGroup: "O+",
    
    program: "B.Tech",
    department: "Computer Science and Engineering",
    branch: "Computer Science",
    currentSemester: 3,
    enrollmentYear: 2023,
    expectedGraduationMonth: "May",
    expectedGraduationYear: 2027,
    cgpa: 8.17,
    creditsCompleted: 54.5,
    totalCreditsRequired: 160,
    
    email: "2023csb1089@iitrpr.ac.in",
    phoneNumber: "+91 98765 43210",
    alternatePhone: "+91 87654 32109",
    permanentAddress: "House No. 123, Sector 45, Chandigarh - 160047, Punjab, India",
    currentAddress: "Hostel A, Room 204, IIT Ropar, Rupnagar - 140001, Punjab, India",
    
    guardianName: "Rajesh Kumar Sharma",
    guardianPhone: "+91 98765 12345",
    guardianRelation: "Father",
    
    nationality: "Indian",
    category: "General",
    admissionCategory: "JEE Advanced",
  });
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchStudentProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleDownloadIDCard = () => {
    // TODO: Implement PDF generation and download
    alert("ID Card download will be implemented soon");
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    // TODO: Implement theme change logic
    alert(`Theme changed to ${newTheme}`);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-sm text-slate-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-center text-slate-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Profile Picture */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 p-8 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-xl border-2 border-white shadow-sm">
                <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-2xl font-bold text-white">
                  {profile.fullName.split(" ").map(n => n[0]).join("").substring(0, 2)}
                </div>
              </div>
              <button className="absolute -bottom-1 -right-1 rounded-full bg-white p-1.5 shadow-sm hover:bg-slate-50">
                <svg className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {profile.fullName}
              </h1>
              <p className="mt-2 text-2xl font-medium text-indigo-100">
                {profile.entryNumber}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3">
            <div className="rounded-lg bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
              <p className="text-sm text-indigo-100">CGPA</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {profile.cgpa.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
              <p className="text-sm text-indigo-100">Credits</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {profile.creditsCompleted}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={handleDownloadIDCard}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-900 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-800 hover:to-indigo-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          Download ID Card
        </button>
        
        <button
          onClick={handleChangePassword}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Change Password
        </button>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {isEditMode ? "Cancel Edit" : "Edit Profile"}
        </button>

        <button
          onClick={() => handleThemeChange(theme === "light" ? "dark" : "light")}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          {theme === "light" ? (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Light Theme
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Dark Theme
            </>
          )}
        </button>
      </div>

      {/* Profile Sections */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded bg-slate-100 p-1.5">
              <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
          </div>
          
          <div className="space-y-3">
            <InfoRow label="Full Name" value={profile.fullName} />
            <InfoRow label="Date of Birth" value={new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
            <InfoRow label="Gender" value={profile.gender} />
            <InfoRow label="Blood Group" value={profile.bloodGroup} />
            <InfoRow label="Nationality" value={profile.nationality} />
            <InfoRow label="Category" value={profile.category} />
          </div>
        </div>

        {/* Academic Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded bg-slate-100 p-1.5">
              <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Academic Information</h2>
          </div>
          
          <div className="space-y-3">
            <InfoRow label="Entry Number" value={profile.entryNumber} />
            <InfoRow label="Program" value={profile.program} />
            <InfoRow label="Department" value={profile.department} />
            <InfoRow label="Branch/Major" value={profile.branch} />
            <InfoRow label="Current Semester" value={`Semester ${profile.currentSemester}`} />
            <InfoRow label="Admission Category" value={profile.admissionCategory} />
          </div>
        </div>

        {/* Academic Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded bg-slate-100 p-1.5">
              <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Academic Progress</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">CGPA</span>
                <span className="text-xl font-bold text-slate-900">{profile.cgpa.toFixed(2)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div 
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${(profile.cgpa / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Credits Progress</span>
                <span className="text-base font-semibold text-slate-900">
                  {profile.creditsCompleted} / {profile.totalCreditsRequired}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div 
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${(profile.creditsCompleted / profile.totalCreditsRequired) * 100}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {((profile.creditsCompleted / profile.totalCreditsRequired) * 100).toFixed(1)}% Complete
              </p>
            </div>

            <InfoRow label="Enrollment Year" value={profile.enrollmentYear.toString()} />
            <InfoRow label="Expected Graduation" value={`${profile.expectedGraduationMonth} ${profile.expectedGraduationYear}`} />
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded bg-slate-100 p-1.5">
              <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>
          </div>
          
          <div className="space-y-3">
            <InfoRow label="Institute Email" value={profile.email} icon="email" />
            <InfoRow label="Phone Number" value={profile.phoneNumber} icon="phone" />
            {profile.alternatePhone && (
              <InfoRow label="Alternate Phone" value={profile.alternatePhone} icon="phone" />
            )}
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs font-medium text-slate-600">Permanent Address</p>
              <p className="text-sm text-slate-700">{profile.permanentAddress}</p>
            </div>
            {profile.currentAddress && (
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-1 text-xs font-medium text-slate-600">Current Address</p>
                <p className="text-sm text-slate-700">{profile.currentAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Guardian Information */}
        {profile.guardianName && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded bg-slate-100 p-1.5">
                <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Guardian Information</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <InfoRow label="Guardian Name" value={profile.guardianName} />
              <InfoRow label="Relationship" value={profile.guardianRelation || "-"} />
              <InfoRow label="Contact Number" value={profile.guardianPhone || "-"} icon="phone" />
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="rounded p-1 hover:bg-slate-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-900 to-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-indigo-800 hover:to-indigo-600"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: "email" | "phone" }) {
  return (
    <div className="flex items-start justify-between rounded bg-slate-50 px-3 py-2">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        {icon === "email" && (
          <svg className="h-3.5 w-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
        {icon === "phone" && (
          <svg className="h-3.5 w-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )}
        <span className="text-sm font-medium text-slate-900">{value}</span>
      </div>
    </div>
  );
}
