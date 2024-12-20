// app/api/auth/login/route.js
import { authenticateUser } from '@/server/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Extract security-related headers
        const headers = request.headers;
        const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const userAgent = headers.get('user-agent') || 'unknown';

        const { token, animalSelection } = await request.json();

        // Enhanced validation with specific error messages
        if (!token) {
            return NextResponse.json(
                { error: 'Please enter your authentication token' },
                { status: 400 }
            );
        }

        if (!animalSelection || !Array.isArray(animalSelection)) {
            return NextResponse.json(
                { error: 'Please select your security animals in the correct order' },
                { status: 400 }
            );
        }

        if (animalSelection.length !== 3) {
            return NextResponse.json(
                {
                    error: `Please select exactly 3 animals in order (you selected ${animalSelection.length})`,
                    currentCount: animalSelection.length
                },
                { status: 400 }
            );
        }

        const result = await authenticateUser(token, animalSelection, ipAddress, userAgent);

        if (result.success) {
            const response = {
                ...result,
                message: result.message || 'Login successful! Please save your new token.'
            };

            // Add email verification reminder if needed
            if (result.email && !result.isEmailVerified) {
                response.emailVerification = {
                    required: true,
                    message: 'Please verify your email address to enable full account features'
                };
            }

            return NextResponse.json(response);
        } else {
            let statusCode = 401;
            let response = {
                error: result.message,
                isLocked: result.isLocked || false,
                remainingAttempts: result.remainingAttempts,
                remainingLockoutTime: result.remainingLockoutTime
            };

            if (result.isLocked) {
                statusCode = 423; // Locked
                // Could trigger notification to user's email if verified
                // if (result.email && result.isEmailVerified) {
                //     await sendAccountLockoutNotification(result.email);
                // }
            }

            // Add account status info if relevant
            if (result.status) {
                response.accountStatus = {
                    status: result.status,
                    reason: result.statusReason
                };
            }

            return NextResponse.json(response, { status: statusCode });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            {
                error: 'An unexpected error occurred. Please try again later.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}