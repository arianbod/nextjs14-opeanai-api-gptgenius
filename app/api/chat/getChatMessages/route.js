// 2. Fix getChatMessages API route
// app/api/chat/getChatMessages/route.js
import { NextResponse } from 'next/server';
import { getChatMessages } from '@/server/chat';

export async function POST(request) {
    try {
        // Add error handling for request body parsing
        let body;
        try {
            body = await request.json();
        } catch (error) {
            console.error('Error parsing request body:', error);
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { userId, chatId } = body;

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