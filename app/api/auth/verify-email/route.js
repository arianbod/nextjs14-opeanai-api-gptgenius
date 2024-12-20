// app/api/auth/verify-email/route.js
import { verifyEmail } from '@/server/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { userId, token } = await request.json();

        // Basic validation
        if (!userId || !token) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required parameters',
                    details: [
                        !userId && 'User ID is required',
                        !token && 'Verification token is required'
                    ].filter(Boolean)
                },
                { status: 400 }
            );
        }

        // Verify the email
        const result = await verifyEmail(userId, token);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.message || 'Email verified successfully',
                verified: true
            });
        } else {
            let statusCode = 400;
            const response = {
                success: false,
                error: result.message,
                code: 'VERIFICATION_FAILED'
            };

            // Handle specific verification failures
            if (result.message.includes('expired')) {
                response.code = 'TOKEN_EXPIRED';
                response.suggestions = ['Request a new verification token'];
            } else if (result.message.includes('already verified')) {
                statusCode = 409; // Conflict
                response.code = 'ALREADY_VERIFIED';
            }

            return NextResponse.json(response, { status: statusCode });
        }
    } catch (error) {
        console.error('Email verification error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred during email verification.',
                details: process.env.NODE_ENV === 'development' ? [error.message] : undefined,
                code: 'INTERNAL_ERROR'
            },
            { status: 500 }
        );
    }
}