// app/api/chat/route.js
import { NextResponse } from 'next/server';
import { addMessageToChat, getChatMessages } from '@/server/chat';
import { getChatProvider } from '@/lib/ai-providers/index';
import { handleProviderError } from '@/lib/error-handlers';

export async function POST(request) {
    try {
        const { userId, chatId, content, persona } = await request.json();

        // Validate request
        if (!userId || !chatId || !content || !persona) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Store user message
        await addMessageToChat(userId, chatId, content, 'user');

        // Get chat history
        const previousMessages = await getChatMessages(userId, chatId);

        // Get the AI provider based on persona configuration
        const provider = getChatProvider(persona.provider);

        // Create response stream
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let assistantContent = '';

                try {
                    // Format messages according to provider requirements
                    const formattedMessages = provider.formatMessages({
                        persona,
                        previousMessages,
                    });

                    // Generate stream from provider
                    const aiStream = await provider.generateChatStream(formattedMessages, persona);

                    // Process the stream
                    for await (const chunk of aiStream) {
                        const contentChunk = provider.extractContentFromChunk(chunk);

                        if (contentChunk) {
                            assistantContent += contentChunk;
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({
                                    content: contentChunk,
                                    provider: persona.provider
                                })}\n\n`)
                            );
                        }
                    }

                    // Store complete response
                    await addMessageToChat(
                        userId,
                        chatId,
                        assistantContent,
                        'assistant',
                        { provider: persona.provider }
                    );

                } catch (error) {
                    const { fallbackProvider, errorMessage } = await handleProviderError(
                        error,
                        persona,
                        previousMessages
                    );

                    if (fallbackProvider) {
                        // If we have a fallback provider, notify the client
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({
                                    notice: `Switching to fallback provider: ${fallbackProvider}`
                                })}\n\n`
                            )
                        );

                        // Get and use the fallback provider
                        const backupProvider = getChatProvider(fallbackProvider);
                        const backupMessages = backupProvider.formatMessages({
                            persona: { ...persona, provider: fallbackProvider },
                            previousMessages,
                        });

                        const backupStream = await backupProvider.generateChatStream(
                            backupMessages,
                            { ...persona, provider: fallbackProvider }
                        );

                        // Process the fallback stream
                        for await (const chunk of backupStream) {
                            const contentChunk = backupProvider.extractContentFromChunk(chunk);
                            if (contentChunk) {
                                assistantContent += contentChunk;
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({
                                        content: contentChunk,
                                        provider: fallbackProvider
                                    })}\n\n`)
                                );
                            }
                        }

                        // Store the fallback response
                        await addMessageToChat(
                            userId,
                            chatId,
                            assistantContent,
                            'assistant',
                            { provider: fallbackProvider }
                        );
                    } else {
                        // No fallback available, send error to client
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({
                                    error: errorMessage || 'An error occurred'
                                })}\n\n`
                            )
                        );
                    }
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