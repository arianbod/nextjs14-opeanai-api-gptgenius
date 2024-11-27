// lib/ai-providers/openai-provider.js
import OpenAI from 'openai';

// Only initialize OpenAI client on the server side
let openai;
if (typeof window === 'undefined') {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

// Constants
const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

// Helper function to determine if model is O1 series
const isO1Model = (modelName) => modelName?.startsWith('o1-');

export const formatMessages = ({ persona, previousMessages }) => {
    if (!persona?.capabilities?.supportsSystemMessage) {
        const systemInstruction = `You are ${persona?.name || 'an AI assistant'}, a ${persona?.role || 'helpful assistant'}. ${persona?.instructions || ''}\n\nUser: `;

        const modifiedMessages = [...previousMessages];
        if (modifiedMessages.length > 0 && modifiedMessages[0].role === 'user') {
            modifiedMessages[0] = {
                role: 'user',
                content: systemInstruction + modifiedMessages[0].content
            };
        }
        return modifiedMessages;
    }

    const systemMessage = {
        role: 'system',
        content: `You are ${persona?.name || 'an AI assistant'}, a ${persona?.role || 'helpful assistant'}. ${persona?.instructions || ''}`,
    };

    return [
        systemMessage,
        ...previousMessages.map(({ role, content }) => ({ role, content })),
    ];
};

// Server-only functions
export const generateChatStream = async (messages, persona = {}) => {
    if (typeof window !== 'undefined') {
        throw new Error('This function can only be called on the server side');
    }

    try {
        const modelToUse = persona?.modelCodeName || DEFAULT_MODEL;
        const capabilities = persona?.capabilities?.supportedParameters || {};

        const requestParams = {
            model: modelToUse,
            messages,
            stream: true
        };

        if (capabilities.temperature?.supported !== false) {
            requestParams.temperature = capabilities.temperature?.default || DEFAULT_TEMPERATURE;
        }

        if (isO1Model(modelToUse)) {
            requestParams.max_completion_tokens = capabilities.maxTokens?.default || DEFAULT_MAX_TOKENS;
        } else {
            requestParams.max_tokens = capabilities.maxTokens?.default || DEFAULT_MAX_TOKENS;
        }

        const response = await openai.chat.completions.create(requestParams);
        return response;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error(`Failed to generate chat response with model ${persona?.modelCodeName}: ${error.message}`);
    }
};

export const generateImage = async (prompt) => {
    if (typeof window !== 'undefined') {
        throw new Error('This function can only be called on the server side');
    }

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
};

export async function validateApiKey() {
    if (typeof window !== 'undefined') {
        throw new Error('This function can only be called on the server side');
    }

    try {
        await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 1
        });
        return true;
    } catch (error) {
        console.error('OpenAI API key validation error:', error);
        return false;
    }
}