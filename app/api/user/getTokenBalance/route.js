// app/api/user/getTokenBalance/route.js
import { NextResponse } from 'next/server';
import prisma from '@/prisma/db';

export async function POST(request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tokenBalance: true },
        });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ tokenBalance: user.tokenBalance });
    } catch (error) {
        console.error('Error fetching token balance:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
