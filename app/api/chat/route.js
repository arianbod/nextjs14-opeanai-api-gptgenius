// app/api/chat/route.js
import { NextResponse } from 'next/server';
import { addMessageToChat, getChatMessages } from '@/server/chat';
import { getChatProvider } from '@/lib/ai-providers/server';
import { handleProviderError } from '@/lib/error-handlers';

export const config = {
    api: {
        responseLimit: false,
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
};

// Pre-create encoder for better performance
const encoder = new TextEncoder();

// Utility for SSE messages
const createSSEMessage = (data) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

// Constants
const BATCH_SIZE = 5;
const ALLOWED_FILE_TYPES = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function processStream(controller, aiStream, provider, providerInstance, contentChunks = []) {
    let accumulatedContent = '';

    for await (const chunk of aiStream) {
        const contentChunk = providerInstance.extractContentFromChunk(chunk);
        if (contentChunk) {
            accumulatedContent += contentChunk;
            contentChunks.push(contentChunk);

            if (contentChunks.length >= BATCH_SIZE) {
                controller.enqueue(createSSEMessage({
                    type: 'chunk',
                    content: contentChunks.join(''),
                    provider: provider
                }));
                contentChunks.length = 0;
            }
        }
    }

    // Send remaining chunks
    if (contentChunks.length > 0) {
        controller.enqueue(createSSEMessage({
            type: 'chunk',
            content: contentChunks.join(''),
            provider: provider
        }));
    }

    return accumulatedContent;
}

export async function POST(request) {
    const streamHeaders = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
    };

    try {
        const { userId, chatId, content, persona, file } = await request.json();

        // Input validation
        if (!userId || !chatId || (!content?.trim() && !file) || !persona) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Validate file if present
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: 'File size exceeds 10MB limit' },
                    { status: 400 }
                );
            }

            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: 'Unsupported file type' },
                    { status: 400 }
                );
            }
        }

        // Get the provider early
        const providerInstance = getChatProvider(persona.provider);

        // Initialize streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Parallel operations for better performance
                    const [userMessage, previousMessages] = await Promise.all([
                        addMessageToChat(
                            userId,
                            chatId,
                            content?.trim() || 'Uploaded a file',
                            'user'
                        ),
                        getChatMessages(userId, chatId)
                    ]);

                    // Send start message
                    controller.enqueue(createSSEMessage({
                        type: 'status',
                        content: 'streaming_started',
                        messageId: userMessage.id
                    }));

                    // Format messages once
                    const formattedMessages = providerInstance.formatMessages({
                        persona,
                        previousMessages,
                        fileContent: file?.content,
                        fileName: file?.name
                    });

                    // Start AI stream
                    const aiStream = await providerInstance.generateChatStream(
                        formattedMessages,
                        persona
                    );

                    // Process the stream
                    const contentChunks = [];
                    const accumulatedContent = await processStream(
                        controller,
                        aiStream,
                        persona.provider,
                        providerInstance,
                        contentChunks
                    );

                    // Store final message
                    const assistantMessage = await addMessageToChat(
                        userId,
                        chatId,
                        accumulatedContent,
                        'assistant',
                        {
                            provider: persona.provider,
                            model: persona.modelCodeName
                        }
                    );

                    // Send completion status
                    controller.enqueue(createSSEMessage({
                        type: 'status',
                        content: 'streaming_completed',
                        messageId: assistantMessage.id
                    }));

                } catch (error) {
                    console.error('Streaming error:', error);
                    const { fallbackProvider, errorMessage } = await handleProviderError(
                        error,
                        persona.provider
                    );

                    if (fallbackProvider && !file) {
                        // Send fallback notification
                        controller.enqueue(createSSEMessage({
                            type: 'status',
                            content: 'switching_provider',
                            provider: fallbackProvider
                        }));

                        try {
                            const backupProviderInstance = getChatProvider(fallbackProvider);

                            // Get previous messages again in case they've changed
                            const latestMessages = await getChatMessages(userId, chatId);

                            const backupMessages = backupProviderInstance.formatMessages({
                                persona: { ...persona, provider: fallbackProvider },
                                previousMessages: latestMessages,
                                fileContent: file?.content,
                                fileName: file?.name
                            });

                            const backupStream = await backupProviderInstance.generateChatStream(
                                backupMessages,
                                { ...persona, provider: fallbackProvider }
                            );

                            // Process fallback stream
                            const fallbackChunks = [];
                            const fallbackContent = await processStream(
                                controller,
                                backupStream,
                                fallbackProvider,
                                backupProviderInstance,
                                fallbackChunks
                            );

                            // Store fallback message
                            const fallbackMessage = await addMessageToChat(
                                userId,
                                chatId,
                                fallbackContent,
                                'assistant',
                                {
                                    provider: fallbackProvider,
                                    model: persona.modelCodeName
                                }
                            );

                            // Send completion status for fallback
                            controller.enqueue(createSSEMessage({
                                type: 'status',
                                content: 'streaming_completed',
                                messageId: fallbackMessage.id
                            }));

                        } catch (fallbackError) {
                            console.error('Fallback provider error:', fallbackError);
                            controller.enqueue(createSSEMessage({
                                type: 'error',
                                content: 'Fallback provider failed',
                                error: fallbackError.message
                            }));
                        }
                    } else {
                        controller.enqueue(createSSEMessage({
                            type: 'error',
                            content: errorMessage || 'An error occurred during streaming',
                            error: error.message
                        }));
                    }
                } finally {
                    controller.enqueue(createSSEMessage({
                        type: 'status',
                        content: 'stream_ended'
                    }));
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, { headers: streamHeaders });

    } catch (error) {
        console.error('Fatal error in chat API:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}