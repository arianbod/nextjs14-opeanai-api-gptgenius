import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/server/chat';

export async function POST(request) {
    const { userId, messages, persona, chatId } = await request.json();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const openAIStream = await generateChatResponse(userId, JSON.stringify(messages), JSON.stringify(persona), chatId);

                for await (const chunk of openAIStream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                }
            } catch (error) {
                console.error('Error in chat API:', error);
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`));
            } finally {
                controller.close();
            }
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}