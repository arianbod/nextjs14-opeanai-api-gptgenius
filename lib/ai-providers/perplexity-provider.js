// lib/ai-providers/perplexity-provider.js
import axios from 'axios';

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
};

const perplexityProvider = {
    formatMessages: ({ persona, previousMessages }) => {
        // Start with system message
        const formattedMessages = [
            {
                role: "system",
                content: `You are ${persona.name}, a ${persona.role}. ${persona.instructions}`
            }
        ];

        // Process previous messages ensuring alternating pattern
        let lastRole = 'system';
        const processedMessages = previousMessages.filter((msg, index) => {
            const currentRole = msg.role === 'assistant' ? 'assistant' : 'user';
            if (index === 0 || currentRole !== lastRole) {
                lastRole = currentRole;
                return true;
            }
            return false;
        });

        // Add processed messages
        formattedMessages.push(...processedMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        })));

        return formattedMessages;
    },

    generateChatStream: async (messages, persona = {}) => {
        try {
            const payload = {
                model: persona.modelCodeName || "llama-3.1-sonar-small-128k-online",
                messages: Array.isArray(messages) ? messages : [messages],
                max_tokens: persona.capabilities?.supportedParameters?.maxTokens?.default || 256,
                temperature: persona.capabilities?.supportedParameters?.temperature?.default || 0.2,
                search_recency_filter: "month",
                stream: true
            };

            console.log("Perplexity Request:", JSON.stringify(payload, null, 2));

            const response = await fetch(process.env.PERPLEXITY_API_ENDPOINT || 'https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Perplexity API Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                throw new Error(errorData.error?.message || 'Failed to get response from Perplexity API');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            return {
                [Symbol.asyncIterator]: async function* () {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            const chunk = decoder.decode(value);
                            const lines = chunk.split('\n').filter(line => line.trim());

                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    const jsonData = line.slice(6);
                                    if (jsonData === '[DONE]') break;

                                    try {
                                        const parsedData = JSON.parse(jsonData);
                                        yield parsedData;
                                    } catch (e) {
                                        console.error('Error parsing Perplexity chunk:', e);
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
            error.isPerplexityError = true;
            throw error;
        }
    },

    extractContentFromChunk: (chunk) => {
        try {
            if (chunk?.choices?.[0]?.delta?.content) {
                return chunk.choices[0].delta.content;
            }
            return '';
        } catch (error) {
            console.error('Error extracting content from Perplexity chunk:', error);
            return '';
        }
    },

    generateImage: async () => {
        throw new Error('Image generation not supported by Perplexity');
    }
};

export default perplexityProvider;