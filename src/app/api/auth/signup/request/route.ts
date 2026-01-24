import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hasValidOTP } from '@/lib/otp';

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'iitrpr.ac.in';

export async function POST(request: NextRequest) {
    try {
        const { email, name, entryNumber, phone } = await request.json();

        // Validate required fields
        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        // Auto-generate name from email if not provided
        const userName = name || email.split('@')[0];

        // Validate email domain
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
            return NextResponse.json(
                { success: false, message: `Only @${ALLOWED_DOMAIN} email addresses are allowed` },
                { status: 403 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Verify that email was verified (has consumed OTP for EMAIL_VERIFICATION)
        const hasVerifiedEmail = await prisma.oTPCode.findFirst({
            where: {
                email,
                purpose: 'EMAIL_VERIFICATION',
                consumedAt: {
                    not: null,
                },
            },
            orderBy: {
                consumedAt: 'desc',
            },
        });

        if (!hasVerifiedEmail) {
            return NextResponse.json(
                { success: false, message: 'Please verify your email first' },
                { status: 400 }
            );
        }

        // Check time since email verification (should be within 30 minutes)
        const timeSinceVerification = Date.now() - hasVerifiedEmail.consumedAt!.getTime();
        const MAX_TIME_AFTER_VERIFICATION = 30 * 60 * 1000; // 30 minutes

        if (timeSinceVerification > MAX_TIME_AFTER_VERIFICATION) {
            return NextResponse.json(
                { success: false, message: 'Email verification expired. Please verify your email again.' },
                { status: 400 }
            );
        }

        // Check if signup request already exists
        const existingRequest = await prisma.signupRequest.findUnique({
            where: { email },
        });

        if (existingRequest) {
            if (existingRequest.status === 'PENDING') {
                // Update existing pending request
                const updatedRequest = await prisma.signupRequest.update({
                    where: { email },
                    data: {
                        name: userName,
                        entryNumber: entryNumber || null,
                        phone: phone || null,
                        emailVerified: true,
                        updatedAt: new Date(),
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'Your signup request has been updated and is pending admin approval.',
                    requestId: updatedRequest.id,
                });
            } else if (existingRequest.status === 'APPROVED') {
                return NextResponse.json(
                    { success: false, message: 'Your signup request has already been approved' },
                    { status: 409 }
                );
            } else if (existingRequest.status === 'REJECTED') {
                // Allow resubmission for rejected requests
                const updatedRequest = await prisma.signupRequest.update({
                    where: { email },
                    data: {
                        name: userName,
                        entryNumber: entryNumber || null,
                        phone: phone || null,
                        emailVerified: true,
                        status: 'PENDING',
                        rejectionReason: null,
                        processedAt: null,
                        processedBy: null,
                        updatedAt: new Date(),
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'Your signup request has been resubmitted and is pending admin approval.',
                    requestId: updatedRequest.id,
                });
            }
        }

        // Create new signup request
        const signupRequest = await prisma.signupRequest.create({
            data: {
                email,
                name: userName,
                entryNumber: entryNumber || null,
                phone: phone || null,
                emailVerified: true,
                status: 'PENDING',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Your signup request has been submitted successfully. Please wait for admin approval.',
            requestId: signupRequest.id,
        });

    } catch (error) {
        console.error('Error in signup request API:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
