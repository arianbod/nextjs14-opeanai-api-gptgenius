// lib/ai-providers/claude-provider.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const formatMessages = ({ persona, previousMessages }) => {
    // Convert chat format to Claude's format
    return {
        system: `You are ${persona.name}, a ${persona.role}. ${persona.instructions || ''}`,
        messages: previousMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
        })),
    };
};

// lib/ai-providers/claude-provider.js
export const generateChatStream = async (messages, persona = {}) => {
    try {
        // Use modelCodeName from persona instead of name
        const modelToUse = persona.modelCodeName || 'claude-3-opus-20240229';

        const response = await anthropic.messages.create({
            model: modelToUse,
            messages,
            stream: true,
            temperature: persona.temperature || DEFAULT_TEMPERATURE,
            max_tokens: persona.maxTokens || DEFAULT_MAX_TOKENS,
        });

        return response;
    } catch (error) {
        console.error('Claude API error:', error);
        throw new Error(`Failed to generate chat response with model ${persona.modelCodeName}: ${error.message}`);
    }
};