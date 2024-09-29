import prisma from '@/prisma/db';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { token: { contains: token.slice(0, 8) } },
            select: {
                id: true,
                token: true,
                animalSelection: true,
                loginAttempts: true,
                lastLoginAttempt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({ error: 'An error occurred while fetching user data' }, { status: 500 });
    }
}