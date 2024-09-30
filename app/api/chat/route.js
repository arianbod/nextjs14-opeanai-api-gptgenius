// app/api/chat/route.js
import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/server/chat';

export async function POST(request) {
    let { messages, persona } = await request.json();

    // Ensure messages is an array
    if (!Array.isArray(messages)) {
        console.error('Invalid messages format:', messages);
        return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                const openAIStream = await generateChatResponse(messages, persona);

                for await (const chunk of openAIStream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                }
            } catch (error) {
                console.error('Error in chat API:', error);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message || 'An error occurred' })}\n\n`));
            } finally {
                controller.close();
            }
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}