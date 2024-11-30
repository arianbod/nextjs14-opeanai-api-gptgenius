// lib/ai-providers/openai-provider.js
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

// Helper function to determine if model is O1 series
const isO1Model = (modelName) => modelName?.startsWith('o1-');

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
                model: persona.modelCodeName || DEFAULT_MODEL,
                messages,
                stream: true
            };

            if (persona.capabilities?.supportedParameters?.temperature?.supported !== false) {
                requestParams.temperature = persona.capabilities?.supportedParameters?.temperature?.default || DEFAULT_TEMPERATURE;
            }

            const maxTokensParam = isO1Model(persona.modelCodeName) ? 'max_completion_tokens' : 'max_tokens';
            requestParams[maxTokensParam] = persona.capabilities?.supportedParameters?.maxTokens?.default || DEFAULT_MAX_TOKENS;

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
            }
            return '';
        } catch (error) {
            console.error('Error extracting content from chunk:', error);
            return '';
        }
    },

    generateImage: async (prompt) => {
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024"
            });
            return { url: response.data[0].url };
        } catch (error) {
            console.error('OpenAI Image API error:', error);
            throw error;
        }
    }
};

export default openaiProvider;