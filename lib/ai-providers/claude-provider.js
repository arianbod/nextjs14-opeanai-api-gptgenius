// lib/ai-providers/claude-provider.js
import anthropic from "./anthropicClient";

const claudeProvider = {
    formatMessages: ({ persona, previousMessages }) => {
        // Filter out any system messages from previous messages
        const conversationMessages = previousMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));

        return {
            system: `You are ${persona.name}, a ${persona.role}. ${persona.instructions}`,
            messages: conversationMessages
        };
    },

    generateChatStream: async (messages, persona = {}) => {
        try {
            // Add retry logic for overloaded errors
            const maxRetries = 3;
            let retryCount = 0;
            let lastError = null;

            while (retryCount < maxRetries) {
                try {
                    // Extract system message if it exists in the messages array
                    let systemMessage = '';
                    let conversationMessages = messages;

                    if (messages.system) {
                        systemMessage = messages.system;
                        conversationMessages = messages.messages;
                    }

                    const stream = await anthropic.messages.create({
                        model: persona.modelCodeName || 'claude-3-sonnet-20240229',
                        system: systemMessage,
                        messages: conversationMessages,
                        stream: true,
                        temperature: persona.capabilities?.supportedParameters?.temperature?.default || 0.7,
                        max_tokens: persona.capabilities?.supportedParameters?.maxTokens?.default || 1000
                    });
                    return stream;
                } catch (error) {
                    lastError = error;
                    if (error?.error?.type === 'overloaded_error') {
                        retryCount++;
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                        continue;
                    }
                    throw error;
                }
            }
            throw lastError;
        } catch (error) {
            console.error('Claude API error:', error);
            error.isClaudeError = true;
            throw error;
        }
    },

    extractContentFromChunk: (chunk) => {
        try {
            if (typeof chunk === 'string') {
                try {
                    const parsed = JSON.parse(chunk);
                    if (parsed.delta?.text) return parsed.delta.text;
                    return '';
                } catch {
                    return '';
                }
            }

            if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
                return chunk.delta.text;
            }

            if (chunk.delta?.text !== undefined) {
                return chunk.delta.text;
            }

            return '';
        } catch (error) {
            console.error('Error extracting content from chunk:', error);
            return '';
        }
    },

    generateImage: async () => {
        throw new Error('Image generation not supported by Claude');
    }
};

export default claudeProvider;