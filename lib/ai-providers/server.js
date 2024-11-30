// lib/ai-providers/server.js
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Server-side initialization
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const openaiProvider = {
    formatMessages: ({ persona, previousMessages }) => {
        if (!persona?.capabilities?.supportsSystemMessage) {
            const modifiedMessages = [...previousMessages];
            if (modifiedMessages.length > 0 && modifiedMessages[0].role === 'user') {
                modifiedMessages[0] = {
                    role: 'user',
                    content: `You are ${persona.name}, a ${persona.role}. ${persona.instructions}\n\nUser: ${modifiedMessages[0].content}`
                };
            }
            return modifiedMessages;
        }

        return [
            {
                role: 'system',
                content: `You are ${persona.name}, a ${persona.role}. ${persona.instructions}`
            },
            ...previousMessages.map(({ role, content }) => ({ role, content })),
        ];
    },

    generateChatStream: async (messages, persona = {}) => {
        try {
            const requestParams = {
                model: persona.modelCodeName,
                messages,
                stream: true
            };

            if (persona.capabilities?.supportedParameters?.temperature?.supported) {
                requestParams.temperature = persona.capabilities.supportedParameters.temperature.default;
            }

            const maxTokensParam = persona.modelCodeName.startsWith('o1-') ? 'max_completion_tokens' : 'max_tokens';
            requestParams[maxTokensParam] = persona.capabilities?.supportedParameters?.maxTokens?.default || 1000;

            const stream = await openai.chat.completions.create(requestParams);
            return stream;
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    },

    extractContentFromChunk: (chunk) => {
        try {
            if (typeof chunk === 'string') {
                const data = JSON.parse(chunk);
                return data.choices?.[0]?.delta?.content || '';
            } else if (chunk?.choices?.[0]?.delta?.content !== undefined) {
                return chunk.choices[0].delta.content;
            } else {
                return '';
            }
        } catch (error) {
            console.error('Error extracting content from chunk:', error);
            return '';
        }
    }
};

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
                        // Wait before retrying (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                        continue;
                    }
                    // If it's not an overloaded error, throw immediately
                    throw error;
                }
            }
            // If we've exhausted retries, throw the last error
            throw lastError;
        } catch (error) {
            console.error('Claude API error:', error);
            // Add custom error property to help identify Claude-specific errors
            error.isClaudeError = true;
            throw error;
        }
    },

    extractContentFromChunk: (chunk) => {
        try {
            // If chunk is a string (SSE format), try to parse it
            if (typeof chunk === 'string') {
                try {
                    const parsed = JSON.parse(chunk);
                    if (parsed.delta?.text) return parsed.delta.text;
                    return '';
                } catch {
                    return '';
                }
            }

            // Handle Claude's native streaming format
            if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
                return chunk.delta.text;
            }

            // Handle direct delta format
            if (chunk.delta?.text !== undefined) {
                return chunk.delta.text;
            }

            return '';
        } catch (error) {
            console.error('Error extracting content from chunk:', error);
            return '';
        }
    }
};

const providers = {
    openai: openaiProvider,
    claude: claudeProvider,
    anthropic: claudeProvider,
};

export function getChatProvider(providerName = 'openai') {
    if (!providerName || typeof providerName !== 'string') {
        console.warn('Invalid provider specified, using default (OpenAI)');
        return providers.openai;
    }

    const provider = providers[providerName.toLowerCase()];
    if (!provider) {
        console.warn(`Provider ${providerName} not found, using default (OpenAI)`);
        return providers.openai;
    }
    return provider;
}