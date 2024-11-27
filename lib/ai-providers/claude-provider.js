// lib/ai-providers/claude-provider.js
import anthropic from "./anthropticClient";

export const generateChatStream = async (messages, persona = {}) => {
    try {
        const modelToUse = persona.modelCodeName || 'claude-3-opus-20240229';

        const response = await anthropic.messages.create({
            model: modelToUse,
            messages,
            stream: true,
            temperature: persona.capabilities?.supportedParameters?.temperature?.default || 0.7,
            max_tokens: persona.capabilities?.supportedParameters?.maxTokens?.default || 1000,
        });

        return response;
    } catch (error) {
        console.error('Claude API error:', error);
        throw new Error(`Failed to generate chat response with model ${persona.modelCodeName}: ${error.message}`);
    }
};
