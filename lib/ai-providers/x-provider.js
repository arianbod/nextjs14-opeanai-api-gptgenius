import anthropic from "./xClient";

const DEFAULT_MODEL = 'grok-2-1212';
const MAX_RETRIES = 3;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const xProvider = {
    formatMessages: ({ persona, previousMessages, fileContent, fileName, fileType }) => {
        // Filter out messages with empty content
        const validMessages = (Array.isArray(previousMessages) ? previousMessages : [])
            .filter(msg => msg && msg.content && msg.content.trim().length > 0)
            .map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content.trim()
            }));

        // Ensure we have at least one message
        if (validMessages.length === 0) {
            validMessages.push({
                role: 'user',
                content: 'Hello'
            });
        }

        let systemMessage = `You are ${persona.name}, a ${persona.role}. ${persona.instructions || ''}`;

        // Handle file content if present
        if (fileContent && fileName) {
            const isImage = SUPPORTED_IMAGE_TYPES.includes(fileType);

            if (isImage) {
                systemMessage += '\nYou have access to an image that has been uploaded. Please analyze it thoroughly and provide relevant insights.';

                // Convert the first message to use image content blocks
                const firstMessageContent = [
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: fileType,
                            data: fileContent
                        }
                    },
                    {
                        type: 'text',
                        text: validMessages[0]?.content || 'Please analyze this image.'
                    }
                ];

                // Handle image content blocks
                if (validMessages.length > 0) {
                    validMessages[0] = {
                        role: 'user',
                        content: firstMessageContent
                    };
                } else {
                    validMessages.push({
                        role: 'user',
                        content: firstMessageContent
                    });
                }
            } else {
                // Handle regular file content
                systemMessage += '\nYou have access to a file that has been uploaded. Please analyze its contents thoroughly.';

                const fileMessage = [
                    'Here is the file content:\n',
                    `<file>${fileName}</file>`,
                    `<content>${fileContent}</content>\n`,
                    `User request: ${validMessages[0]?.content || 'Please analyze this file.'}\n`,
                    'Please analyze this file\'s contents carefully and provide a relevant response.'
                ].join('\n');

                if (validMessages.length > 0) {
                    validMessages[0] = {
                        role: 'user',
                        content: fileMessage
                    };
                } else {
                    validMessages.push({
                        role: 'user',
                        content: fileMessage
                    });
                }
            }
        }

        return {
            messages: validMessages,
            system: systemMessage
        };
    },

    generateChatStream: async (messages, persona = {}) => {
        if (!messages?.messages?.length) {
            throw new Error('No messages provided for generation');
        }

        // Ensure all messages have non-empty content
        const validMessages = messages.messages.filter(msg =>
            msg && msg.content && (
                typeof msg.content === 'string' ?
                    msg.content.trim().length > 0 :
                    Array.isArray(msg.content)
            )
        );

        if (validMessages.length === 0) {
            throw new Error('No valid messages with content found');
        }

        const streamOptions = {
            model: persona.modelCodeName || DEFAULT_MODEL,
            stream: true,
            temperature: persona.capabilities?.supportedParameters?.temperature?.default || 0.7,
            max_tokens: persona.capabilities?.supportedParameters?.maxTokens?.default || 1000,
            system: messages.system || '',
            messages: validMessages
        };

        try {
            let lastError = null;

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    if (attempt > 0) {
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                    }

                    const stream = await anthropic.messages.create(streamOptions);
                    return stream;

                } catch (error) {
                    lastError = error;
                    console.error('X API attempt error:', error);

                    if (error?.error?.message?.includes('messages')) {
                        throw error;
                    }

                    if (error?.error?.type !== 'overloaded_error') {
                        throw error;
                    }
                }
            }

            throw lastError;

        } catch (error) {
            console.error('X API error:', error);
            error.isClaudeError = true;
            throw error;
        }
    },

    extractContentFromChunk: (() => {
        const extractText = (chunk) => {
            if (!chunk) return '';
            if (chunk.delta?.text !== undefined) return chunk.delta.text;
            if (chunk.type === 'content_block_delta' && chunk.delta?.text) return chunk.delta.text;
            return '';
        };

        return (chunk) => {
            if (!chunk) return '';

            try {
                if (typeof chunk === 'string') {
                    try {
                        return extractText(JSON.parse(chunk));
                    } catch {
                        return '';
                    }
                }
                return extractText(chunk);
            } catch (error) {
                console.error('Error extracting content from chunk:', error);
                return '';
            }
        };
    })(),

    generateImage: async () => {
        throw new Error('Image generation not supported by X');
    }
};

export default xProvider;