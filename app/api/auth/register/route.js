// app/api/auth/register/route.js
import { createUser } from '@/server/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { animalSelection, email } = await request.json();

        if (!animalSelection || !Array.isArray(animalSelection) || animalSelection.length !== 3) {
            return NextResponse.json({ error: 'Invalid animal selection' }, { status: 400 });
        }

        const { userId, token } = await createUser(animalSelection, email);

        return NextResponse.json({ userId, token, animalSelection });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
    }
}