// app/api/tokens/balance/route.js
import { NextResponse } from 'next/server';
import { getUserTokenBalance } from '@/server/tokens';

export async function POST(req) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const balance = await getUserTokenBalance(userId);

        return NextResponse.json({ balance });
    } catch (error) {
        console.error('Error fetching token balance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch token balance' },
            { status: 500 }
        );
    }
}