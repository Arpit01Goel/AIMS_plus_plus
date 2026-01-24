"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Step = "email" | "verify-otp" | "success";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

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

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const showError = (message: string) => {
    setError(message);
    setShowToast(true);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep("verify-otp");
        setCountdown(60); // 60 seconds before allowing resend
        setSuccessMessage("OTP sent to your email!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setSuccessMessage("");
        }, 3000);
      } else {
        showError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      showError("An unexpected error occurred. Please try again.");
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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    setIsLoading(true);

    try {
      // First verify the OTP
      const verifyResponse = await fetch("/api/auth/signup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        showError(verifyData.message || "Invalid OTP");
        return;
      }

      // OTP verified, now submit signup request
      const signupResponse = await fetch("/api/auth/signup/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      });

      const signupData = await signupResponse.json();

      if (signupData.success) {
        setCurrentStep("success");
      } else {
        showError(signupData.message || "Failed to submit request");
      }
    } catch (err) {
      showError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <>
      {/* Toast Notification */}
      {showToast && (error || successMessage) && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="relative overflow-hidden rounded-xl border border-indigo-200 bg-white px-5 py-3.5 shadow-2xl max-w-md">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-indigo-900">
                {successMessage || error}
              </p>
              <button
                onClick={() => {
                  setShowToast(false);
                  setError("");
                  setSuccessMessage("");
                }}
                className="ml-3 flex-shrink-0 rounded-full bg-indigo-600 p-1 text-white hover:bg-indigo-700"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="relative z-10 text-center space-y-8 animate-fade-in">
            {/* Logo Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-800 rounded-3xl blur-xl opacity-50 animate-pulse" />
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
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full" />
              <p className="text-2xl font-light text-indigo-200 tracking-wide">
                IIT Ropar Academic Portal
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-lg text-indigo-300/80 max-w-md mx-auto leading-relaxed">
              Join our academic community. Create your account to access the portal.
            </p>

            {/* Decorative elements */}
            <div className="flex justify-center gap-3 pt-8">
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" />
              <div
                className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Signup Form */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 flex items-center justify-center p-4 md:p-12">
          <div className="w-full max-w-md">
            <div className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 md:p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  {currentStep === "success" ? "Success!" : "Sign Up"}
                </h2>
                <p className="text-sm text-indigo-200 mt-2">
                  {currentStep === "email" && "Enter your institutional email"}
                  {currentStep === "verify-otp" && "Verify your email address"}
                  {currentStep === "success" && "Request submitted successfully"}
                </p>
              </div>



              {/* Step 1: Email */}
              {currentStep === "email" && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white">
                      Email Address
                    </label>
                    <div className="relative mt-1.5">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/30 bg-white/10 pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="user@iitrpr.ac.in"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {isLoading ? "Sending OTP..." : "Continue"}
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {currentStep === "verify-otp" && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
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
                          className="h-12 w-10 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm text-center text-xl font-bold text-white transition focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-indigo-200 mt-3 text-center">
                      OTP sent to {email}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.join("").length !== 6}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {isLoading ? "Submitting..." : "Submit Request"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (countdown === 0) {
                        handleSendOTP(new Event("submit") as any);
                      }
                    }}
                    disabled={countdown > 0}
                    className="w-full text-sm text-indigo-200 hover:text-white disabled:opacity-50"
                  >
                    {countdown > 0
                      ? `Resend OTP in ${countdown}s`
                      : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep("email")}
                    className="w-full text-sm text-indigo-200 hover:text-white"
                  >
                    Change Email
                  </button>
                </form>
              )}



              {/* Success Step */}
              {currentStep === "success" && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-indigo-500"
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
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      Request Submitted!
                    </h3>
                    <p className="text-sm text-indigo-200">
                      Your signup request has been submitted to the admin. You will
                      receive an email once your account is approved.
                    </p>
                  </div>

                  <Link
                    href="/login"
                    className="inline-block w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Go to Login
                  </Link>
                </div>
              )}

              {/* Footer */}
              {currentStep !== "success" && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-indigo-200">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-white hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
