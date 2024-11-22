// lib/ai-providers/perplexity-provider.js

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export const formatMessages = ({ persona, previousMessages }) => {
    const formattedMessages = previousMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
    }));

    // Add system message if provided in persona
    if (persona.instructions) {
        formattedMessages.unshift({
            role: 'system',
            content: `You are ${persona.name}, a ${persona.role}. ${persona.instructions}`
        });
    }

    return {
        model: persona.model || 'mixtral-8x7b-instruct',
        messages: formattedMessages,
        stream: true
    };
};

export const generateChatStream = async (messages) => {
    try {
        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: messages.model,
                messages: messages.messages,
                stream: true
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Perplexity API error');
        }

        // Create a readable stream from the response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        return {
            [Symbol.asyncIterator]: async function* () {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk
                            .split('\n')
                            .filter(line => line.trim() !== '');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const jsonData = line.slice(6);
                                if (jsonData === '[DONE]') break;

                                try {
                                    const parsedData = JSON.parse(jsonData);
                                    yield parsedData;
                                } catch (e) {
                                    console.error('Error parsing JSON:', e);
                                }
                            }
                        }
                    }
                } finally {
                    reader.releaseLock();
                }
            }
        };
    } catch (error) {
        console.error('Perplexity API error:', error);
        throw error;
    }
};

export const extractContentFromChunk = (chunk) => {
    if (chunk.choices && chunk.choices[0]?.delta?.content) {
        return chunk.choices[0].delta.content;
    }
    return '';
};

export const generateImage = async () => {
    throw new Error('Image generation not supported by Perplexity');
};