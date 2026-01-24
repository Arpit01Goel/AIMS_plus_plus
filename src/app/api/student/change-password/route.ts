import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { verifyResetToken } from '@/lib/tokens';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword, resetToken } = body;

        // Validate new password
        if (!newPassword) {
            return NextResponse.json(
                { error: 'New password is required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'New password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, passwordHash: true, email: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Two methods of authentication:
        // 1. Using reset token (OTP verified)
        // 2. Using current password (traditional)

        if (resetToken) {
            // Method 1: Verify reset token
            const tokenData = verifyResetToken(resetToken);

            if (!tokenData) {
                return NextResponse.json(
                    { error: 'Invalid or expired reset token' },
                    { status: 400 }
                );
            }

            // Verify token email matches session email
            if (tokenData.email !== session.user.email) {
                return NextResponse.json(
                    { error: 'Token email mismatch' },
                    { status: 400 }
                );
            }
        } else if (currentPassword) {
            // Method 2: Verify current password
            if (!user.passwordHash) {
                return NextResponse.json(
                    { error: 'User has no password set' },
                    { status: 400 }
                );
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Either currentPassword or resetToken is required' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashedPassword },
        });

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 500 }
        );
    }
}
