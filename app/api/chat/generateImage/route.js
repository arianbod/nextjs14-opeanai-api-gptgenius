// app/api/chat/generateImage/route.js
import { NextResponse } from 'next/server';
import { generateImage } from '@/server/chat';

export async function POST(request) {
    try {
        const { prompt, options, userId, chatId } = await request.json();

        if (!prompt || !userId || !chatId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const result = await generateImage(userId, prompt, chatId, options);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        // Return consistent response format
        return NextResponse.json({
            imageUrl: result.url || result.imageUrl,
            metadata: result.metadata
        });
    } catch (error) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate image' },
            { status: 500 }
        );
    }
}