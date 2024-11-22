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

export const generateChatStream = async (messages, persona) => {
    const response = await anthropic.messages.create({
        model: persona.model || 'claude-3-opus-20240229',
        max_tokens: persona.maxTokens || 1024,
        temperature: persona.temperature || 0.7,
        system: messages.system,
        messages: messages.messages,
        stream: true,
    });

    return response;
};

export const extractContentFromChunk = (chunk) => {
    return chunk.delta?.text || '';
};