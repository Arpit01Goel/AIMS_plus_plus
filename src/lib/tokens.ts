import jwt from 'jsonwebtoken';

const RESET_TOKEN_EXPIRY = '15m';

interface ResetTokenPayload {
    email: string;
    purpose: 'PASSWORD_RESET';
}

/**
 * Generate a signed JWT reset token
 */
export function generateResetToken(email: string): string {
    const payload: ResetTokenPayload = {
        email,
        purpose: 'PASSWORD_RESET',
    };

    return jwt.sign(payload, process.env.NEXTAUTH_SECRET!, {
        expiresIn: RESET_TOKEN_EXPIRY,
    });
}

/**
 * Verify and decode a reset token
 */
export function verifyResetToken(token: string): { email: string } | null {
    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as ResetTokenPayload;

        if (decoded.purpose !== 'PASSWORD_RESET') {
            return null;
        }

        return { email: decoded.email };
    } catch (error) {
        // Token is invalid or expired
        return null;
    }
}
