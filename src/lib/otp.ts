import crypto from 'crypto';

// In-memory storage for OTPs (replace with database in production)
// Structure: { email: { otp: string, expiresAt: number, attempts: number } }
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Store OTP with expiration
 */
export const storeOTP = (email: string, otp: string): void => {
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  otpStore.set(email, { otp, expiresAt, attempts: 0 });
  
  // Auto-cleanup after expiration
  setTimeout(() => {
    otpStore.delete(email);
  }, OTP_EXPIRY_MINUTES * 60 * 1000 + 5000); // Extra 5 seconds buffer
};

/**
 * Verify OTP
 */
export const verifyOTP = (email: string, otp: string): { success: boolean; message: string } => {
  const storedData = otpStore.get(email);

  if (!storedData) {
    return { success: false, message: 'OTP not found or expired. Please request a new one.' };
  }

  // Check if OTP has expired
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  // Check max attempts
  if (storedData.attempts >= MAX_OTP_ATTEMPTS) {
    otpStore.delete(email);
    return { success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }

  // Increment attempts
  storedData.attempts++;

  // Verify OTP
  if (storedData.otp !== otp) {
    return { 
      success: false, 
      message: `Invalid OTP. ${MAX_OTP_ATTEMPTS - storedData.attempts} attempts remaining.` 
    };
  }

  // OTP is valid - remove it from store
  otpStore.delete(email);
  return { success: true, message: 'OTP verified successfully.' };
};

/**
 * Check if OTP exists for email
 */
export const hasValidOTP = (email: string): boolean => {
  const storedData = otpStore.get(email);
  if (!storedData) return false;
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  return true;
};

/**
 * Clear OTP for email
 */
export const clearOTP = (email: string): void => {
  otpStore.delete(email);
};

/**
 * Get remaining time for OTP in seconds
 */
export const getOTPRemainingTime = (email: string): number | null => {
  const storedData = otpStore.get(email);
  if (!storedData) return null;
  
  const remaining = Math.floor((storedData.expiresAt - Date.now()) / 1000);
  return remaining > 0 ? remaining : null;
};
