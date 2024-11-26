// app/api/chat/getChatList/route.js
import { NextResponse } from 'next/server';
import { getChatList } from '@/server/chat';

export async function POST(request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }
        const chats = await getChatList(userId)
        // console.log("chatList Generated:", chats);

        return NextResponse.json({ chats });
    } catch (error) {
        console.error('Error fetching chat list:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
