// lib/ai-providers/claude-provider.js
import anthropic from "./anthropicClient";

export const generateChatStream = async (messages, persona = {}) => {
    try {
        const modelToUse = persona.modelCodeName || 'claude-3-5-sonnet-20241022';

        const response = await anthropic.messages.create({
            model: modelToUse,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
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

export const formatMessages = ({ persona, previousMessages }) => {
    // Format messages for Claude
    return previousMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
    }));
};

export const extractContentFromChunk = (chunk) => {
    if (chunk.type === 'message_start') return '';
    if (chunk.type === 'content_block_start') return '';
    if (chunk.type === 'content_block_stop') return '';
    if (chunk.type === 'message_stop') return '';

    // Handle actual content chunks
    if (chunk.type === 'content_block_delta') {
        return chunk.delta?.text || '';
    }

    // Fallback for other chunk types
    return '';
};

export const generateImage = async () => {
    throw new Error('Image generation not supported by Claude');
};

export default {
    generateChatStream,
    formatMessages,
    extractContentFromChunk,
    generateImage
};