// app/api/chat/route.js
import { NextResponse } from 'next/server';
import { generateChatResponse, addMessageToChat, getChatMessages } from '@/server/chat';

export async function POST(request) {
    try {
        const { userId, chatId, content, persona } = await request.json();

        if (!userId || !chatId || !content || !persona) {
            return NextResponse.json(
                { error: 'Missing parameters' },
                { status: 400 }
            );
        }

        // Store the user's message in the database
        await addMessageToChat(userId, chatId, content, 'user');

        // Fetch all messages in the chat to provide context
        const previousMessages = await getChatMessages(userId, chatId);

        // Prepare messages for OpenAI API
        const systemMessage = {
            role: 'system',
            content: `You are ${persona.name}, a ${persona.role}. Respond to queries in a manner consistent with your role and expertise. Always stay in character.`,
        };

        const openAIMessages = [
            systemMessage,
            ...previousMessages.map(({ role, content }) => ({ role, content })),
        ];

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let assistantContent = '';

                try {
                    const openAIStream = await generateChatResponse(openAIMessages, persona);

                    for await (const chunk of openAIStream) {
                        const contentChunk = chunk.choices[0]?.delta?.content || '';
                        if (contentChunk) {
                            assistantContent += contentChunk;
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ content: contentChunk })}\n\n`)
                            );
                        }
                    }

                    // After generating the assistant's response, store it in the database
                    await addMessageToChat(userId, chatId, assistantContent, 'assistant');
                } catch (error) {
                    console.error('Error in chat API:', error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ error: error.message || 'An error occurred' })}\n\n`
                        )
                    );
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            { error: 'Failed to process chat' },
            { status: 500 }
        );
    }
}
