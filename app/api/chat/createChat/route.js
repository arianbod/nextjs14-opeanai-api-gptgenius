// app/api/chat/createChat/route.js
import { NextResponse } from 'next/server';
import { createChat } from '@/server/chat';

export async function POST(request) {
    try {
        const { userId, initialMessage } = await request.json();

        if (!userId || !initialMessage) {
            return NextResponse.json(
                { error: 'Missing userId or initialMessage' },
                { status: 400 }
            );
        }

        const chat = await createChat(userId, initialMessage);

        return NextResponse.json(chat, { status: 200 });
    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json(
            { error: 'Failed to create chat' },
            { status: 500 }
        );
    }
}
