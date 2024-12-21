// app/api/auth/check-verification/route.ts
import { checkEmailVerification } from '@/server/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const isVerified = await checkEmailVerification(userId);
        return NextResponse.json({ isEmailVerified: isVerified });

    } catch (error) {
        console.error('Verification check error:', error);
        return NextResponse.json(
            { error: 'Failed to check verification status' },
            { status: 500 }
        );
    }
}