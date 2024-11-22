// lib/ai-providers/openai-provider.js
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

export const formatMessages = ({ persona, previousMessages }) => {
    const systemMessage = {
        role: 'system',
        content: `You are ${persona.name}, a ${persona.role}. ${persona.instructions || ''}`,
    };

    return [
        systemMessage,
        ...previousMessages.map(({ role, content }) => ({ role, content })),
    ];
};

export const generateChatStream = async (messages, persona = {}) => {
    try {
        const response = await openai.chat.completions.create({
            model: persona.model || DEFAULT_MODEL,
            messages,
            stream: true,
            temperature: persona.temperature || DEFAULT_TEMPERATURE,
            max_tokens: persona.maxTokens || DEFAULT_MAX_TOKENS,
        });

        return response;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error(error.message || 'Failed to generate chat response');
    }
};

export const extractContentFromChunk = (chunk) => {
    return chunk.choices[0]?.delta?.content || '';
};

export const generateImage = async (prompt) => {
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

// Helper function to validate API key
export async function validateApiKey() {
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