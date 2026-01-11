import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Validate inputs
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    // Verify OTP
    const result = verifyOTP(email, otp);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // OTP verified successfully
    // Generate a temporary token for password reset
    const resetToken = generateResetToken(email);

    return NextResponse.json({
      success: true,
      message: result.message,
      resetToken, // Client will use this token to reset password
    });

  } catch (error) {
    console.error('Error in verify-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate a temporary reset token (valid for 15 minutes)
function generateResetToken(email: string): string {
  const crypto = require('crypto');
  const payload = JSON.stringify({
    email,
    timestamp: Date.now(),
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
  
  // In production, use a proper signing mechanism with a secret key
  return Buffer.from(payload).toString('base64');
}
