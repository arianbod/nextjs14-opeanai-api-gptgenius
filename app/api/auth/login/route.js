import { authenticateUser } from '@/server/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
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

        const result = await authenticateUser(token, animalSelection);

        if (result.success) {
            return NextResponse.json({
                ...result,
                message: result.message || 'Login successful! Please save your new token.'
            });
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