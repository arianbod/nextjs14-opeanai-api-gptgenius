// app/api/user/[userId]/balance/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyHash } from '@/server/auth'; // Adjust the import path accordingly

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    const { userId } = params;

    // Extract the token from the Authorization header
    const authorization = request.headers.get('Authorization');
    if (!authorization) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');

    try {
        // Find the user by ID
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { token: true, tokenBalance: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify the token
        const tokenIsValid = verifyHash(token, user.token);
        if (!tokenIsValid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Return the token balance
        return NextResponse.json({ balance: user.tokenBalance }, { status: 200 });
    } catch (error) {
        console.error('Error fetching token balance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
