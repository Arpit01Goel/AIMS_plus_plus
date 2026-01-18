import { prisma } from './db';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP in database with expiration
 */
export const storeOTP = async (
  email: string,
  code: string,
  purpose: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'TWO_FACTOR_AUTH' = 'PASSWORD_RESET'
): Promise<void> => {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Look up user ID if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  // Create OTP record
  await prisma.oTPCode.create({
    data: {
      email,
      code,
      purpose,
      expiresAt,
      userId: user?.id,
    },
  });
};

/**
 * Verify OTP from database
 */
export const verifyOTP = async (
  email: string,
  code: string,
  purpose: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'TWO_FACTOR_AUTH' = 'PASSWORD_RESET'
): Promise<{ success: boolean; message: string }> => {
  // Find the most recent unused OTP for this email and purpose
  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      email,
      code,
      purpose,
      consumedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    return {
      success: false,
      message: 'OTP not found or already used. Please request a new one.',
    };
  }

  // Check if OTP has expired
  if (new Date() > otpRecord.expiresAt) {
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.',
    };
  }

  // Mark OTP as consumed
  await prisma.oTPCode.update({
    where: { id: otpRecord.id },
    data: { consumedAt: new Date() },
  });

  return {
    success: true,
    message: 'OTP verified successfully.',
  };
};

/**
 * Check if user has a valid OTP
 */
export const hasValidOTP = async (email: string, purpose: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'TWO_FACTOR_AUTH' = 'PASSWORD_RESET'): Promise<boolean> => {
  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      email,
      purpose,
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return otpRecord !== null;
};

/**
 * Clear all OTPs for a user (useful for cleanup)
 */
export const clearOTP = async (email: string): Promise<void> => {
  await prisma.oTPCode.deleteMany({
    where: { email },
  });
};

/**
 * Cleanup expired OTPs (can be run as a background job)
 */
export const cleanupExpiredOTPs = async (): Promise<number> => {
  const result = await prisma.oTPCode.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
};

/**
 * Get remaining time for OTP in seconds
 */
export const getOTPRemainingTime = async (email: string, purpose: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'TWO_FACTOR_AUTH' = 'PASSWORD_RESET'): Promise<number | null> => {
  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      email,
      purpose,
      consumedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) return null;

  const remaining = Math.floor((otpRecord.expiresAt.getTime() - Date.now()) / 1000);
  return remaining > 0 ? remaining : null;
};
