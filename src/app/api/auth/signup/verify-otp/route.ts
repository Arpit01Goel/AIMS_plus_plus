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

        // Verify OTP from database
        const result = await verifyOTP(email, otp, 'EMAIL_VERIFICATION');

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }

        // OTP verified successfully
        return NextResponse.json({
            success: true,
            message: 'Email verified successfully. Please complete your signup.',
        });

    } catch (error) {
        console.error('Error in signup verify-otp API:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
