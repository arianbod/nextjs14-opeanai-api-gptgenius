// app/api/messages/[chatId]/route.js
import { NextResponse } from 'next/server';
import { getChatMessages } from '@/server/chat';

export async function GET(request, { params }) {
    const { chatId } = params;
    const userId = request.headers.get('X-User-Id'); // You'll need to implement user authentication

    try {
        const messages = await getChatMessages(userId, chatId);
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}