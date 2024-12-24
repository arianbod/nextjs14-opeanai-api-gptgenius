import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = 'gemini-pro';
const MAX_RETRIES = 3;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const geminiProvider = {
    formatMessages: ({ persona, previousMessages, fileContent, fileName, fileType }) => {
        // Ensure previousMessages is an array
        if (!Array.isArray(previousMessages)) {
            previousMessages = [];
        }

        // Convert messages to Gemini format with improved validation
        const validMessages = previousMessages
            .filter(msg => {
                // Validate message structure
                return msg &&
                    typeof msg === 'object' &&
                    msg.content &&
                    (typeof msg.content === 'string' || Array.isArray(msg.content));
            })
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: Array.isArray(msg.content)
                    ? msg.content
                    : [{ text: msg.content.trim() }]
            }));

        // Ensure we have at least one message
        if (validMessages.length === 0) {
            validMessages.push({
                role: 'user',
                parts: [{ text: 'Hello' }]
            });
        }

        let systemMessage = `You are ${persona.name}, a ${persona.role}. ${persona.instructions || ''}`;

        // Handle file content if present
        if (fileContent && fileName) {
            const isImage = SUPPORTED_IMAGE_TYPES.includes(fileType);

            if (isImage) {
                // Format the first message with image content
                const imageContent = [
                    {
                        inlineData: {
                            data: typeof fileContent === 'string' && fileContent.startsWith('data:')
                                ? fileContent.split(',')[1]
                                : typeof fileContent === 'string'
                                    ? fileContent
                                    : Buffer.from(fileContent).toString('base64'),
                            mimeType: fileType
                        }
                    },
                    {
                        text: validMessages[0]?.parts?.[0]?.text || 'Please analyze this image.'
                    }
                ];

                if (validMessages.length > 0) {
                    validMessages[0] = {
                        role: 'user',
                        parts: imageContent
                    };
                } else {
                    validMessages.push({
                        role: 'user',
                        parts: imageContent
                    });
                }
            } else {
                // Handle regular file content
                const fileMessage = [
                    'Here is the file content:\n',
                    `<file>${fileName}</file>`,
                    `<content>${fileContent}</content>\n`,
                    `User request: ${validMessages[0]?.parts?.[0]?.text || 'Please analyze this file.'}\n`,
                    'Please analyze this file\'s contents carefully and provide a relevant response.'
                ].join('\n');

                if (validMessages.length > 0) {
                    validMessages[0] = {
                        role: 'user',
                        parts: [{ text: fileMessage }]
                    };
                } else {
                    validMessages.push({
                        role: 'user',
                        parts: [{ text: fileMessage }]
                    });
                }
            }
        }

        // Add system message at the beginning
        validMessages.unshift({
            role: 'user',
            parts: [{ text: systemMessage }]
        });

        return {
            messages: validMessages,
            system: systemMessage
        };
    },

    generateChatStream: async (messages, persona = {}) => {
        try {
            if (!messages?.messages?.length) {
                throw new Error('No messages provided for generation');
            }

            // Convert and validate messages
            const validMessages = messages.messages.map(msg => {
                // Handle different content types
                if (Array.isArray(msg.parts)) {
                    return {
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: msg.parts
                    };
                }

                const content = msg.content || '';
                return {
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: typeof content === 'string' ? content.trim() : JSON.stringify(content) }]
                };
            }).filter(msg => {
                // Validate parts contain actual content
                return msg.parts.some(part => {
                    if (part.text) return part.text.trim().length > 0;
                    if (part.inlineData) return true;
                    return false;
                });
            });

            if (validMessages.length === 0) {
                throw new Error('No valid messages found after validation');
            }

            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({
                model: persona.modelCodeName || DEFAULT_MODEL || 'gemini-pro',
                generationConfig: {
                    temperature: persona.capabilities?.supportedParameters?.temperature?.default || 0.7,
                    maxOutputTokens: persona.capabilities?.supportedParameters?.maxTokens?.default || 1000,
                }
            });

            // Initialize chat with history
            const chat = model.startChat({
                history: validMessages.slice(0, -1),
                generationConfig: {
                    temperature: persona.capabilities?.supportedParameters?.temperature?.default || 0.7,
                    maxOutputTokens: persona.capabilities?.supportedParameters?.maxTokens?.default || 1000,
                }
            });

            const lastMessage = validMessages[validMessages.length - 1].parts;
            const response = await chat.sendMessageStream(lastMessage);

            // Create an async iterator that properly formats the chunks
            return {
                async *[Symbol.asyncIterator]() {
                    try {
                        for await (const chunk of response.stream) {
                            // Debug chunk structure
                            console.log('Raw chunk:', chunk);

                            // Extract text content based on the chunk structure
                            let text = '';
                            if (chunk && typeof chunk === 'object') {
                                if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
                                    text = chunk.candidates[0].content.parts[0].text;
                                } else if (chunk.text) {
                                    text = typeof chunk.text === 'string' ? chunk.text : '';
                                } else if (chunk.parts?.[0]?.text) {
                                    text = chunk.parts[0].text;
                                }
                            } else if (typeof chunk === 'string') {
                                text = chunk;
                            }

                            // Only yield if we have valid text content
                            if (text && typeof text === 'string' && text.trim()) {
                                yield {
                                    delta: {
                                        text: text.trim(),
                                        role: 'assistant'
                                    }
                                };
                            }
                        }
                    } catch (error) {
                        console.error('Stream processing error:', error);
                        throw error;
                    }
                }
            };

        } catch (error) {
            console.error('Gemini API error:', error);
            error.isGeminiError = true;
            throw error;
        }
    },

    extractContentFromChunk: (() => {
        const extractText = (chunk) => {
            if (!chunk) return '';

            // Handle different chunk formats
            if (typeof chunk === 'string') return chunk;
            if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) return chunk.candidates[0].content.parts[0].text;
            if (chunk.text && typeof chunk.text === 'string') return chunk.text;
            if (chunk.parts?.[0]?.text) return chunk.parts[0].text;
            if (chunk.delta?.text) return chunk.delta.text;

            return '';
        };

        return (chunk) => {
            if (!chunk) return '';

            try {
                if (typeof chunk === 'string') {
                    try {
                        return extractText(JSON.parse(chunk));
                    } catch {
                        return chunk;
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
        throw new Error('Image generation not supported by Gemini');
    }
};

export default geminiProvider;