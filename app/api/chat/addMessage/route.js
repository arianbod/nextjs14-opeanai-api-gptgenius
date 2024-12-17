// app/api/chat/addMessage/route.js
import { NextResponse } from 'next/server';
import { addMessageToChat } from '@/server/chat';

export async function POST(request) {
    try {
        const { userId, chatId, content, role } = await request.json();

        if (!userId || !chatId || !content || !role) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const message = await addMessageToChat(userId, chatId, content, role);

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Error adding message:', error);
        return NextResponse.json(
            { error: 'Failed to add message' },
            { status: 500 }
        );
    }
}