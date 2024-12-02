// app/api/auth/register/route.js
import { createUser } from '@/server/auth';
import { NextResponse } from 'next/server';
import prisma from '@/prisma/db';

const VALID_ANIMALS = [
    'dog', 'cat', 'elephant', 'lion', 'tiger', 'bear',
    'monkey', 'giraffe', 'zebra', 'penguin', 'kangaroo', 'koala'
];

async function validateRegistration(email, animalSelection) {
    const errors = [];

    // Validate email if provided
    if (email) {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push('Invalid email format');
        }

        // Check for existing email
        const existingUser = await prisma.user.findFirst({
            where: { email }
        });

        if (existingUser) {
            errors.push('Email is already registered');
        }
    }

    // Validate animal selection
    if (!animalSelection || !Array.isArray(animalSelection)) {
        errors.push('Animal selection must be an array');
        return errors;
    }

    if (animalSelection.length !== 3) {
        errors.push(`Please select exactly 3 animals (you selected ${animalSelection.length})`);
    }

    // Validate each animal and check for duplicates
    const uniqueAnimals = new Set(animalSelection);
    animalSelection.forEach((animal, index) => {
        if (!VALID_ANIMALS.includes(animal)) {
            errors.push(`Invalid animal selected at position ${index + 1}: ${animal}`);
        }
    });

    if (uniqueAnimals.size !== animalSelection.length) {
        errors.push('Each selected animal must be unique');
    }

    return errors;
}

export async function POST(request) {
    try {
        const { animalSelection, email } = await request.json();

        // Rate limiting check could be added here
        // const ipAddress = request.headers.get('x-forwarded-for') || request.connection.remoteAddress;
        // await checkRateLimit(ipAddress);

        // Comprehensive validation
        const validationErrors = await validateRegistration(email, animalSelection);

        if (validationErrors.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validationErrors,
                    code: 'VALIDATION_ERROR',
                    validationErrors: {
                        email: validationErrors.filter(err => err.toLowerCase().includes('email')),
                        animalSelection: validationErrors.filter(err => !err.toLowerCase().includes('email'))
                    }
                },
                { status: 400 }
            );
        }

        // Attempt to create user
        try {
            const { userId, token, tokenBalance } = await createUser(animalSelection, email);

            // Send success response with important information
            return NextResponse.json({
                success: true,
                userId,
                token,
                tokenBalance,
                animalSelection,
                message: 'Registration successful! IMPORTANT: Please save your token and remember your animal sequence exactly as selected.',
                warnings: [
                    'Save your token immediately - you cannot recover it if lost',
                    'Remember your animal sequence in exact order',
                    'You will need both the token and correct animal sequence to log in'
                ]
            });

        } catch (createError) {
            console.error('User creation error:', createError);

            // Handle specific database errors
            if (createError.code === 'P2002') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Registration failed',
                        details: ['This email is already registered'],
                        code: 'DUPLICATE_EMAIL',
                        suggestions: [
                            'Try logging in if you already have an account',
                            'Use a different email address'
                        ]
                    },
                    { status: 409 }
                );
            }

            // Handle specific animal validation errors
            if (createError.message.includes('Invalid animal')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Registration failed',
                        details: [createError.message],
                        code: 'INVALID_ANIMAL',
                        suggestions: [
                            'Select only from the provided list of animals',
                            'Make sure to select exactly 3 different animals'
                        ]
                    },
                    { status: 400 }
                );
            }

            throw createError; // Re-throw unexpected errors
        }

    } catch (error) {
        console.error('Registration error:', error);

        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request format',
                    details: ['The request data is not properly formatted'],
                    code: 'INVALID_FORMAT'
                },
                { status: 400 }
            );
        }

        // Handle unexpected errors
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred during registration',
                details: process.env.NODE_ENV === 'development' ? [error.message] : ['Internal server error'],
                code: 'INTERNAL_ERROR',
                message: 'Please try again later or contact support if the problem persists'
            },
            { status: 500 }
        );
    }
}