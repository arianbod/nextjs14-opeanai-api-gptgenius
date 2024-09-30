// app/api/messages/route.js
import { NextResponse } from 'next/server';
import { addMessageToChat } from '@/server/chat';

export async function POST(request) {
    const { userId, chatId, role, content } = await request.json();

    try {
        const message = await addMessageToChat(userId, chatId, content, role);
        return NextResponse.json(message);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}