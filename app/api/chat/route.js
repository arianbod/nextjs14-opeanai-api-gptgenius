import { NextResponse } from 'next/server';
import { addMessageToChat, getChatMessages } from '@/server/chat';
import { getChatProvider } from '@/lib/ai-providers/server';
import { handleProviderError } from '@/lib/error-handlers';

export async function POST(request) {
    try {
        const { userId, chatId, content, persona } = await request.json();

        // Input validation
        if (!userId || !chatId || !content || !persona) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Store user message first
        const userMessage = await addMessageToChat(userId, chatId, content, 'user');

        // Get chat history
        const previousMessages = await getChatMessages(userId, chatId);

        // Get the appropriate provider
        const provider = getChatProvider(persona.provider);

        // Initialize streaming response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let accumulatedContent = '';

                // Helper function to send SSE data
                const sendSSEMessage = (data) => {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                    );
                };

                try {
                    // Format messages for the provider
                    const formattedMessages = provider.formatMessages({
                        persona,
                        previousMessages,
                    });

                    // Start the AI stream
                    const aiStream = await provider.generateChatStream(
                        formattedMessages,
                        persona
                    );

                    // Send initial status
                    sendSSEMessage({
                        type: 'status',
                        content: 'streaming_started',
                        messageId: userMessage.id
                    });

                    // Process the stream
                    for await (const chunk of aiStream) {
                        const contentChunk = provider.extractContentFromChunk(chunk);

                        if (contentChunk) {
                            accumulatedContent += contentChunk;

                            // Send the chunk immediately
                            sendSSEMessage({
                                type: 'chunk',
                                content: contentChunk,
                                provider: persona.provider
                            });
                        }
                    }

                    // Store the complete response
                    const assistantMessage = await addMessageToChat(
                        userId,
                        chatId,
                        accumulatedContent,
                        'assistant'
                    );

                    // Send completion status
                    sendSSEMessage({
                        type: 'status',
                        content: 'streaming_completed',
                        messageId: assistantMessage.id
                    });

                } catch (error) {
                    console.error('Streaming error:', error);

                    // Try to use fallback provider if available
                    const { fallbackProvider, errorMessage } = await handleProviderError(
                        error,
                        persona,
                        previousMessages
                    );

                    if (fallbackProvider) {
                        // Notify about fallback
                        sendSSEMessage({
                            type: 'status',
                            content: 'switching_provider',
                            provider: fallbackProvider
                        });

                        // Get and use fallback provider
                        const backupProvider = getChatProvider(fallbackProvider);
                        const backupMessages = backupProvider.formatMessages({
                            persona: { ...persona, provider: fallbackProvider },
                            previousMessages,
                        });

                        const backupStream = await backupProvider.generateChatStream(
                            backupMessages,
                            { ...persona, provider: fallbackProvider }
                        );

                        // Reset accumulated content for fallback
                        accumulatedContent = '';

                        // Process fallback stream
                        for await (const chunk of backupStream) {
                            const contentChunk = backupProvider.extractContentFromChunk(chunk);

                            if (contentChunk) {
                                accumulatedContent += contentChunk;

                                sendSSEMessage({
                                    type: 'chunk',
                                    content: contentChunk,
                                    provider: fallbackProvider
                                });
                            }
                        }

                        // Store fallback response
                        const fallbackMessage = await addMessageToChat(
                            userId,
                            chatId,
                            accumulatedContent,
                            'assistant',
                            { provider: fallbackProvider }
                        );

                        // Send completion status for fallback
                        sendSSEMessage({
                            type: 'status',
                            content: 'streaming_completed',
                            messageId: fallbackMessage.id
                        });

                    } else {
                        // Send error status if no fallback available
                        sendSSEMessage({
                            type: 'error',
                            content: errorMessage || 'An error occurred during streaming',
                            error: error.message
                        });
                    }
                } finally {
                    // Ensure the stream is properly closed
                    sendSSEMessage({
                        type: 'status',
                        content: 'stream_ended'
                    });
                    controller.close();
                }
            }
        });

        // Return the stream response
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no' // Prevents proxy buffering
            },
        });

    } catch (error) {
        console.error('Fatal error in chat API:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}