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
const MAX_RETRIES = 3;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Helper function to determine if model is O1 series
const isO1Model = (modelName) => modelName?.startsWith('o1-');

// Helper function to determine if model supports vision
const supportsVision = (modelName) => {
    const visionModels = ['gpt-4-vision-preview', 'gpt-4o', 'gpt-4o-mini'];
    return visionModels.includes(modelName);
};

const formatMessages = ({ persona, previousMessages, fileContent, fileName, fileType }) => {
    // Filter out messages with empty content
    const validMessages = (Array.isArray(previousMessages) ? previousMessages : [])
        .filter(msg => msg && msg.content && msg.content.trim().length > 0)
        .map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content.trim()
        }));

    // Add system message if supported
    let formattedMessages = [];
    if (persona?.capabilities?.supportsSystemMessage) {
        formattedMessages.push({
            role: 'system',
            content: `You are ${persona.name}, a ${persona.role}. ${persona.instructions}`
        });
    }

    // Handle file content if present
    if (fileContent && fileName && supportsVision(persona.modelCodeName)) {
        const isImage = SUPPORTED_IMAGE_TYPES.includes(fileType);

        if (isImage) {
            const imageMessage = {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: {
                            url: typeof fileContent === 'string' && fileContent.startsWith('data:')
                                ? fileContent
                                : `data:${fileType};base64,${fileContent}`,
                            detail: 'auto'
                            // url:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                        }
                    },
                    {
                        type: 'text',
                        text: validMessages[0]?.content || 'Please analyze this image.'
                    }
                ]
            };

            if (validMessages.length > 0) {
                validMessages[0] = imageMessage;
            } else {
                validMessages.push(imageMessage);
            }
        } else {
            // Handle regular file content
            const fileMessage = `Here is the file content:\n<file>${fileName}</file>\n<content>${fileContent}</content>\n${validMessages[0]?.content || 'Please analyze this file.'}`;

            if (validMessages.length > 0) {
                validMessages[0] = { role: 'user', content: fileMessage };
            } else {
                validMessages.push({ role: 'user', content: fileMessage });
            }
        }
    }

    return [...formattedMessages, ...validMessages];
};

const generateChatStream = async (messages, persona = {}) => {
    if (!messages || !Array.isArray(messages)) {
        throw new Error('No valid messages provided for generation');
    }

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

    try {
        let lastError = null;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
                return await openai.chat.completions.create(requestParams);
            } catch (error) {
                lastError = error;
                console.error('OpenAI API attempt error:', error);

                if (error?.response?.data?.error?.type === 'invalid_request_error') {
                    throw error;
                }

                if (!error?.response?.status || ![429, 500, 502, 503, 504].includes(error.response.status)) {
                    throw error;
                }
            }
        }

        throw lastError;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
};

const extractContentFromChunk = (chunk) => {
    try {
        if (typeof chunk === 'string') {
            const data = JSON.parse(chunk);
            return data.choices?.[0]?.delta?.content || '';
        }
        return chunk?.choices?.[0]?.delta?.content || '';
    } catch (error) {
        console.error('Error extracting content from chunk:', error);
        return '';
    }
};

const generateImage = async (prompt) => {
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

// Export individual functions and the default provider object
export { formatMessages, generateChatStream, extractContentFromChunk, generateImage };

// Default export
export default {
    formatMessages,
    generateChatStream,
    extractContentFromChunk,
    generateImage
};