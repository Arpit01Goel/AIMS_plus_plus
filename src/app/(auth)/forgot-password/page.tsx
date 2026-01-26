"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Read error from URL query parameter
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
      setShowToast(true);
    }
  }, [searchParams]);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowToast(false);

    // Validate email domain
    if (!email.endsWith("@iitrpr.ac.in")) {
      setError("Please use your IIT Ropar email address (@iitrpr.ac.in)");
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send OTP. Please try again.");
        setShowToast(true);
        return;
      }

      setStep("otp");
    } catch (err) {
      setError(
        "Failed to send OTP. Please check your connection and try again."
      );
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowToast(false);

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete OTP");
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid OTP. Please try again.");
        setShowToast(true);
        return;
      }

      // Store reset token and proceed to password reset
      setResetToken(data.resetToken);
      setStep("reset");
    } catch (err) {
      setError(
        "Failed to verify OTP. Please check your connection and try again."
      );
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowToast(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setShowToast(true);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to reset password. Please try again.");
        setShowToast(true);
        return;
      }

      // Password reset successful - redirect to login
      router.push("/login?reset=success");
    } catch (err) {
      setError(
        "Failed to reset password. Please check your connection and try again."
      );
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setShowToast(false);
    setOtp(["", "", "", "", "", ""]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to resend OTP.");
        setShowToast(true);
        return;
      }

      // Show success message
      alert("OTP resent successfully! Please check your email.");
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && error && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="relative overflow-hidden rounded-xl border border-indigo-200 bg-white px-5 py-3.5 shadow-2xl max-w-md">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-indigo-900">{error}</p>
              <button
                onClick={() => {
                  setShowToast(false);
                  setError("");
                }}
                className="ml-3 flex-shrink-0 rounded-full bg-indigo-600 p-1 text-white hover:bg-indigo-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-purple-200">
              <div className="h-full bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex w-full min-h-screen">
        {/* Left Column - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 items-center justify-center p-12 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10 text-center space-y-8 animate-fade-in">
            {/* Logo Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-800 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <svg
                    className="w-24 h-24 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 tracking-tight animate-shine">
                AIMS++
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full"></div>
              <p className="text-2xl font-light text-indigo-200 tracking-wide">
                IIT Ropar Academic Portal
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-lg text-indigo-300/80 max-w-md mx-auto leading-relaxed">
              Advanced Integrated Management System for streamlined academic excellence
            </p>

            {/* Decorative elements */}
            <div className="flex justify-center gap-3 pt-8">
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 flex items-center justify-center p-4 md:p-12">
          <div className="w-full max-w-md">
            <div className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 md:p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  {step === "email"
                    ? "Forgot Password"
                    : step === "otp"
                    ? "Verify OTP"
                    : "Reset Password"}
                </h2>
                <p className="mt-2 text-sm text-indigo-100">
                  {step === "email"
                    ? "Enter your email to receive OTP"
                    : step === "otp"
                    ? `Enter the 6-digit code sent to ${email}`
                    : "Create a new password"}
                </p>
              </div>

              {step === "email" ? (
                <>
                  {/* Email Form */}
                  <form onSubmit={handleSubmitEmail} className="space-y-4">
                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-white"
                      >
                        IIT Ropar Email Address
                      </label>
                      <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg
                            className="h-4 w-4 text-indigo-200"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-white/30 bg-white/10 pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="student@iitrpr.ac.in"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <svg
                              className="h-5 w-5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Send OTP</span>
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </>
                        )}
                      </div>
                    </button>

                    {/* Back to Login */}
                    <div className="text-center">
                      <Link
                        href="/login"
                        className="text-xs font-medium text-indigo-200 hover:text-white"
                      >
                        Back to Login
                      </Link>
                    </div>
                  </form>
                </>
              ) : step === "otp" ? (
                /* OTP Verification Step */
                <>
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    {/* OTP Input */}
                    <div>
                      <label className="block text-center text-xs font-medium text-white mb-3">
                        Enter Verification Code
                      </label>
                      <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="h-12 w-10 rounded-xl border border-white/30 bg-white/10 text-center text-xl font-bold text-white focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resend OTP */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-xs font-medium text-indigo-200 hover:text-white disabled:opacity-60"
                      >
                        Didn't receive code? Resend OTP
                      </button>
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      disabled={isLoading || otp.join("").length !== 6}
                      className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <svg
                              className="h-5 w-5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify OTP</span>
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </>
                        )}
                      </div>
                    </button>

                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
                    >
                      Back
                    </button>
                  </form>
                </>
              ) : (
                /* Password Reset Step */
                <>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-xs font-medium text-white"
                      >
                        New Password
                      </label>
                      <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg
                            className="h-4 w-4 text-indigo-200"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-xl border border-white/30 bg-white/10 pl-10 pr-12 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="At least 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 px-3 text-xs text-indigo-200 hover:text-white"
                        >
                          {showPassword ? (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-xs font-medium text-white"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg
                            className="h-4 w-4 text-indigo-200"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-xl border border-white/30 bg-white/10 pl-10 pr-12 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Re-enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 px-3 text-xs text-indigo-200 hover:text-white"
                        >
                          {showConfirmPassword ? (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <svg
                              className="h-5 w-5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Resetting...</span>
                          </>
                        ) : (
                          <>
                            <span>Reset Password</span>
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </>
                        )}
                      </div>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
