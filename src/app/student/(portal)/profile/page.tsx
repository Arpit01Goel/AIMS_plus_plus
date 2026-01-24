"use client";

import { useState, useEffect } from "react";

type StudentProfile = {
  // Personal Information
  fullName: string;
  entryNumber: string;
  profilePicture: string;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  
  // Academic Information
  program: string;
  department: string;
  branch: string;
  batch: number | null;
  cgpa: number;
  creditsCompleted: number;
  totalCreditsRequired: number;
  deptRank: number | null;
  instituteRank: number | null;
  
  // Contact Information
  email: string;
  phoneNumber: string | null;
  alternatePhone: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  
  // Guardian Information
  guardianName: string | null;
  guardianPhone: string | null;
  guardianRelation: string | null;
  
  // Additional Information
  nationality: string | null;
  category: string | null;
  admissionCategory: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    phoneNumber: '',
    alternatePhone: '',
    permanentAddress: '',
    currentAddress: ''
  });
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  // Load profile data from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        const apiProfile = data.profile;
        
        // Transform API data to match component format
        const transformedProfile: StudentProfile = {
          fullName: apiProfile.name || 'N/A',
          entryNumber: apiProfile.entryNumber || 'N/A',
          profilePicture: apiProfile.studentProfile?.profilePicture || '/default-avatar.png',
          dateOfBirth: apiProfile.studentProfile?.dateOfBirth || null,
          gender: apiProfile.studentProfile?.gender || null,
          bloodGroup: apiProfile.studentProfile?.bloodGroup || null,
          
          program: apiProfile.program || 'N/A',
          department: apiProfile.department || 'N/A',
          branch: apiProfile.programCode || 'N/A',
          batch: apiProfile.batch || null,
          cgpa: apiProfile.studentRecord?.cgpa || 0,
          creditsCompleted: apiProfile.studentRecord?.totalEarnedCredits || 0,
          totalCreditsRequired: apiProfile.studentRecord?.totalCredits || 160,
          deptRank: apiProfile.studentRecord?.deptRank || null,
          instituteRank: apiProfile.studentRecord?.instituteRank || null,
          
          email: apiProfile.email || 'N/A',
          phoneNumber: apiProfile.studentProfile?.phoneNumber || apiProfile.phone || null,
          alternatePhone: apiProfile.studentProfile?.alternatePhone || null,
          permanentAddress: apiProfile.studentProfile?.permanentAddress || apiProfile.address || null,
          currentAddress: apiProfile.studentProfile?.currentAddress || null,
          
          guardianName: apiProfile.studentProfile?.fatherName || apiProfile.studentProfile?.motherName || apiProfile.studentProfile?.guardianName || null,
          guardianPhone: apiProfile.studentProfile?.fatherPhone || apiProfile.studentProfile?.motherPhone || apiProfile.studentProfile?.guardianPhone || null,
          guardianRelation: apiProfile.studentProfile?.guardianRelation || 'Parent',
          
          nationality: apiProfile.studentProfile?.nationality || null,
          category: apiProfile.studentProfile?.category || null,
          admissionCategory: apiProfile.studentProfile?.admissionQuota || null,
        };

        setProfile(transformedProfile);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Initialize contact form when modal opens
  useEffect(() => {
    if (showContactModal && profile) {
      setContactForm({
        phoneNumber: profile.phoneNumber || '',
        alternatePhone: profile.alternatePhone || '',
        permanentAddress: profile.permanentAddress || '',
        currentAddress: profile.currentAddress || ''
      });
      setContactError(null);
    }
  }, [showContactModal, profile]);

  // Send OTP to user's email
  const handleSendOTP = async () => {
    if (!profile?.email) {
      setPasswordError('Email not found');
      return;
    }

    try {
      setSendingOtp(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      setPasswordSuccess('OTP sent to your email. Please check your inbox.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!profile?.email) {
      setPasswordError('Email not found');
      return;
    }

    if (!passwordForm.otp || passwordForm.otp.length !== 6) {
      setPasswordError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          otp: passwordForm.otp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      setOtpVerified(true);
      setResetToken(data.resetToken);
      setPasswordSuccess('OTP verified successfully! You can now change your password.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Change password after OTP verification
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validation
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (!otpVerified || !resetToken) {
      setPasswordError('Please verify OTP first');
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await fetch('/api/student/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken: resetToken,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      // Success
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      // Reset all state
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' });
      setOtpSent(false);
      setOtpVerified(false);
      setResetToken(null);
      setPasswordSuccess(null);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEditContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    try {
      setContactLoading(true);
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: contactForm.phoneNumber,
          alternatePhone: contactForm.alternatePhone,
          permanentAddress: contactForm.permanentAddress,
          currentAddress: contactForm.currentAddress
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update contact information');
      }

      // Success - Update local profile
      setProfile(prev => prev ? {
        ...prev,
        phoneNumber: contactForm.phoneNumber || null,
        alternatePhone: contactForm.alternatePhone || null,
        permanentAddress: contactForm.permanentAddress || null,
        currentAddress: contactForm.currentAddress || null
      } : null);

      alert('Contact information updated successfully!');
      setShowContactModal(false);
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setContactLoading(false);
    }
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
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Change Password
        </button>

        <button
          onClick={() => setShowContactModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Contact Information
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
            <InfoRow label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
            <InfoRow label="Gender" value={profile.gender || 'N/A'} />
            <InfoRow label="Blood Group" value={profile.bloodGroup || 'N/A'} />
            <InfoRow label="Nationality" value={profile.nationality || 'N/A'} />
            <InfoRow label="Category" value={profile.category || 'N/A'} />
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
            <InfoRow label="Batch" value={profile.batch ? profile.batch.toString() : 'N/A'} />
            <InfoRow label="Admission Category" value={profile.admissionCategory || 'N/A'} />
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

            <InfoRow label="Department Rank" value={profile.deptRank ? `${profile.deptRank}` : 'N/A'} />
            <InfoRow label="Institute Rank" value={profile.instituteRank ? `${profile.instituteRank}` : 'N/A'} />
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
            <InfoRow label="Phone Number" value={profile.phoneNumber || 'N/A'} icon="phone" />
            {profile.alternatePhone && (
              <InfoRow label="Alternate Phone" value={profile.alternatePhone} icon="phone" />
            )}
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs font-medium text-slate-600">Permanent Address</p>
              <p className="text-sm text-slate-700">{profile.permanentAddress || 'Not provided'}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' });
                  setOtpSent(false);
                  setOtpVerified(false);
                  setResetToken(null);
                }}
                className="rounded p-1 hover:bg-slate-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step indicator */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className={`flex items-center gap-2 ${
                !otpSent ? 'text-indigo-600' : 'text-indigo-600'
              }`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  !otpSent ? 'bg-indigo-100' : 'bg-indigo-100'
                }`}>
                  {otpSent ? '✓' : '1'}
                </div>
                <span className="text-xs font-medium">Send OTP</span>
              </div>
              <div className="h-px w-8 bg-slate-300"></div>
              <div className={`flex items-center gap-2 ${
                otpSent && !otpVerified ? 'text-indigo-600' : otpVerified ? 'text-indigo-600' : 'text-slate-400'
              }`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  otpSent && !otpVerified ? 'bg-indigo-100' : otpVerified ? 'bg-indigo-100' : 'bg-slate-100'
                }`}>
                  {otpVerified ? '✓' : '2'}
                </div>
                <span className="text-xs font-medium">Verify</span>
              </div>
              <div className="h-px w-8 bg-slate-300"></div>
              <div className={`flex items-center gap-2 ${
                otpVerified ? 'text-indigo-600' : 'text-slate-400'
              }`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  otpVerified ? 'bg-indigo-100' : 'bg-slate-100'
                }`}>
                  3
                </div>
                <span className="text-xs font-medium">Change</span>
              </div>
            </div>
            
            {passwordError && (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700 border border-indigo-200">
                {passwordSuccess}
              </div>
            )}

            {/* Step 1: Send OTP */}
            {!otpSent && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  We'll send a verification code to <span className="font-semibold text-slate-900">{profile?.email}</span>
                </p>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOtp}
                  className="w-full rounded-lg bg-gradient-to-r from-indigo-900 to-indigo-700 px-4 py-3 text-sm font-semibold text-white transition hover:from-indigo-800 hover:to-indigo-600 disabled:opacity-50"
                >
                  {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            )}

            {/* Step 2: Verify OTP */}
            {otpSent && !otpVerified && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={passwordForm.otp}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg font-mono tracking-widest focus:border-indigo-500 focus:outline-none"
                    placeholder="000000"
                    disabled={passwordLoading}
                  />
                  <p className="mt-1 text-xs text-slate-500">Enter the 6-digit code sent to your email</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOtp}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {sendingOtp ? 'Sending...' : 'Resend OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={passwordLoading || passwordForm.otp.length !== 6}
                    className="flex-1 rounded-lg bg-gradient-to-r from-indigo-900 to-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-indigo-800 hover:to-indigo-600 disabled:opacity-50"
                  >
                    {passwordLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Change Password */}
            {otpVerified && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-12 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter new password"
                      disabled={passwordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Minimum 6 characters</p>
                </div>
                
                {/* Confirm New Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-12 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="Confirm new password"
                      disabled={passwordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordError(null);
                      setPasswordSuccess(null);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' });
                      setOtpSent(false);
                      setOtpVerified(false);
                      setResetToken(null);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    disabled={passwordLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-gradient-to-r from-indigo-900 to-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-indigo-800 hover:to-indigo-600 disabled:opacity-50"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Contact Information Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Edit Contact Information</h3>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setContactError(null);
                }}
                className="rounded p-1 hover:bg-slate-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {contactError && (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
                {contactError}
              </div>
            )}

            <form onSubmit={handleEditContact} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={contactForm.phoneNumber}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter phone number"
                  disabled={contactLoading}
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Alternate Phone</label>
                <input
                  type="tel"
                  value={contactForm.alternatePhone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, alternatePhone: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter alternate phone"
                  disabled={contactLoading}
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Permanent Address</label>
                <textarea
                  value={contactForm.permanentAddress}
                  onChange={(e) => setContactForm(prev => ({ ...prev, permanentAddress: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter permanent address"
                  rows={3}
                  disabled={contactLoading}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Current Address</label>
                <textarea
                  value={contactForm.currentAddress}
                  onChange={(e) => setContactForm(prev => ({ ...prev, currentAddress: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter current address"
                  rows={3}
                  disabled={contactLoading}
                />
              </div>
              
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowContactModal(false);
                    setContactError(null);
                  }}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  disabled={contactLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-900 to-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-indigo-800 hover:to-indigo-600 disabled:opacity-50"
                  disabled={contactLoading}
                >
                  {contactLoading ? 'Saving...' : 'Save Changes'}
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
