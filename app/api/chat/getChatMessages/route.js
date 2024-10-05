// app/api/chat/getChatMessages/route.js
import { NextResponse } from 'next/server';
import { getChatMessages } from '@/server/chat';

export async function POST(request) {
    try {
        const { userId, chatId } = await request.json();

        if (!userId || !chatId) {
            return NextResponse.json(
                { error: 'Missing userId or chatId' },
                { status: 400 }
            );
        }

        const messages = await getChatMessages(userId, chatId);

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chat messages' },
            { status: 500 }
        );
    }
}
