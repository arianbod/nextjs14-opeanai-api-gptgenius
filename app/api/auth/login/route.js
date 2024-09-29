import { authenticateUser } from '@/server/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { token, animalSelection } = await request.json();
        console.log('Received login request:', { token, animalSelection });

        if (!token || !animalSelection || !Array.isArray(animalSelection) || animalSelection.length !== 3) {
            console.log('Invalid request data');
            return NextResponse.json({ error: 'Invalid token or animal selection' }, { status: 400 });
        }

        const result = await authenticateUser(token, animalSelection);
        console.log('Authentication result:', result);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.message }, { status: 401 });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json({ error: 'An error occurred during authentication', details: error.message }, { status: 500 });
    }
}