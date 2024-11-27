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
        return {
            system: `You are ${persona.name}, a ${persona.role}. ${persona.instructions}`,
            messages: previousMessages.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
            })),
        };
    },

    generateChatStream: async (messages, persona = {}) => {
        try {
            const stream = await anthropic.messages.create({
                model: persona.modelCodeName,
                messages,
                stream: true,
                temperature: persona.capabilities?.supportedParameters?.temperature?.default || 0.7,
                max_tokens: persona.capabilities?.supportedParameters?.maxTokens?.default || 1000,
            });
            return stream;
        } catch (error) {
            console.error('Claude API error:', error);
            throw error;
        }
    },

    extractContentFromChunk: (chunk) => {
        // Check if we're dealing with a raw stream chunk or processed chunk
        if (chunk.delta?.text !== undefined) {
            return chunk.delta.text;
        }
        // Handle SSE format
        try {
            const data = JSON.parse(chunk);
            return data.delta?.text || '';
        } catch {
            return chunk;
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