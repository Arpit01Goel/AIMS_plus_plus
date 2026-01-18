import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import { generateResetToken } from '@/lib/tokens';

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

    // Verify OTP from database
    const result = await verifyOTP(email, otp, 'PASSWORD_RESET');

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // OTP verified successfully - generate signed JWT reset token
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
