import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'iitrpr.ac.in';
const RATE_LIMIT_MINUTES = 1; // Minimum time between OTP requests

// Rate limiting map (replace with Redis in production)
const rateLimitMap = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email domain
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return NextResponse.json(
        { success: false, message: `Only @${ALLOWED_DOMAIN} email addresses are allowed` },
        { status: 403 }
      );
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Check rate limiting
    const lastRequestTime = rateLimitMap.get(email);
    if (lastRequestTime) {
      const timeSinceLastRequest = Date.now() - lastRequestTime;
      const waitTime = RATE_LIMIT_MINUTES * 60 * 1000;

      if (timeSinceLastRequest < waitTime) {
        const remainingSeconds = Math.ceil((waitTime - timeSinceLastRequest) / 1000);
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${remainingSeconds} seconds before requesting a new OTP`
          },
          { status: 429 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in database
    try {
      await storeOTP(email, otp, 'PASSWORD_RESET');
    } catch (dbError) {
      console.error('Database error storing OTP:', dbError);
      return NextResponse.json(
        { success: false, message: 'Failed to generate OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send OTP email. Please check your email configuration.'
        },
        { status: 500 }
      );
    }

    // Update rate limit
    rateLimitMap.set(email, Date.now());

    // Clean up old rate limits (older than 5 minutes)
    setTimeout(() => {
      rateLimitMap.delete(email);
    }, 5 * 60 * 1000);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email',
    });

  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
