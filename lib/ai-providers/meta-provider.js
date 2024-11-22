// lib/ai-providers/meta-provider.js
import { LlamaAPI } from 'llamaai';

const llama = new LlamaAPI({
    apiKey: process.env.META_API_KEY,
});

export const formatMessages = ({ persona, previousMessages }) => {
    return {
        messages: [
            {
                role: 'system',
                content: `You are ${persona.name}, a ${persona.role}. ${persona.instructions || ''}`,
            },
            ...previousMessages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
        ],
        stream: true,
        model: persona.model || 'llama-2-70b-chat',
    };
};

export const generateChatStream = async (messages, persona) => {
    const response = await llama.chat.completions.create(messages);
    return response;
};

export const extractContentFromChunk = (chunk) => {
    return chunk.choices[0]?.delta?.content || '';
};
