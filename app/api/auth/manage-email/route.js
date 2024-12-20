// app/api/auth/manage-email/route.js
import { generateVerificationToken } from '@/server/auth';
import prisma from '@/prisma/db';
import { sendVerificationEmail } from '@/server/services/emailService';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { userId, action, email } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                isEmailVerified: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        switch (action) {
            case 'update':
                if (!email) {
                    return NextResponse.json(
                        { success: false, error: 'Email is required' },
                        { status: 400 }
                    );
                }

                // Check if email is already verified by another user
                const existingUser = await prisma.user.findFirst({
                    where: {
                        email,
                        isEmailVerified: true,
                        id: { not: userId }
                    }
                });

                if (existingUser) {
                    return NextResponse.json(
                        { success: false, error: 'Email is already verified by another user' },
                        { status: 400 }
                    );
                }

                // Generate new verification token
                const verificationToken = generateVerificationToken();
                const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        email,
                        isEmailVerified: false,
                        verificationToken,
                        verificationTokenExpiry
                    }
                });

                // Send verification email
                await sendVerificationEmail(email, verificationToken, userId);

                return NextResponse.json({
                    success: true,
                    message: 'Email updated. Please check your inbox for verification.'
                });

            case 'resend':
                if (!user.email) {
                    return NextResponse.json(
                        { success: false, error: 'No email address associated with this account' },
                        { status: 400 }
                    );
                }

                if (user.isEmailVerified) {
                    return NextResponse.json(
                        { success: false, error: 'Email is already verified' },
                        { status: 400 }
                    );
                }

                // Generate new verification token
                const newToken = generateVerificationToken();
                const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        verificationToken: newToken,
                        verificationTokenExpiry: tokenExpiry
                    }
                });

                // Send new verification email
                await sendVerificationEmail(user.email, newToken, userId);

                return NextResponse.json({
                    success: true,
                    message: 'New verification email sent'
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Email management error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}