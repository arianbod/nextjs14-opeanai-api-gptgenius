// app/api/chat/createChat/route.js
import { NextResponse } from 'next/server';
import { createChat } from '@/server/chat';
import { data } from 'autoprefixer';

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body?.userId || !body?.initialMessage || !body?.model) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        const { userId, initialMessage, model } = body;

        try {
            const chat = await createChat(userId, initialMessage, {
                name: model.name || "ChatGPT",
                provider: model.provider || "openai",
                modelCodeName: model.modelCodeName || "o1-mini",
                role: model.role || "user"
            });

            // console.log({ success: true, data: chat });
            return NextResponse.json({
                success: true,
                data: chat
            });

        } catch (error) {
            return NextResponse.json({
                success: false,
                error: error.message || 'Chat creation failed'
            }, { status: error.status || 500 });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Invalid request'
        }, { status: 400 });
    }
}