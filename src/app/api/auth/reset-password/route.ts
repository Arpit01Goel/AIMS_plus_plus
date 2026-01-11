import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { resetToken, newPassword } = await request.json();

    // Validate inputs
    if (!resetToken || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Decode and verify reset token
    let tokenData;
    try {
      const decoded = Buffer.from(resetToken, 'base64').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check token expiration
    if (Date.now() > tokenData.expires) {
      return NextResponse.json(
        { success: false, message: 'Reset token has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    const { email } = tokenData;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // TODO: Update password in database
    // Example:
    // await db.user.update({
    //   where: { email },
    //   data: { password: hashedPassword }
    // });

    console.log(`Password reset successful for: ${email}`);
    console.log(`New hashed password: ${hashedPassword}`);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });

  } catch (error) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
