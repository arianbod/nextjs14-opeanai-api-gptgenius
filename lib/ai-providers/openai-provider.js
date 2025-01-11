import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 8000;
const MAX_RETRIES = 3;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Image generation constants
const IMAGE_SIZES = {
    small: "1024x1024",
    medium: "1792x1024",
    large: "1024x1792"
};

const IMAGE_STYLES = {
    vivid: "vivid",
    natural: "natural"
};

const IMAGE_QUALITY = {
    standard: "standard",
    hd: "hd"
};

// Helper functions for model detection
const isO1Model = (modelName) => modelName?.toLowerCase().includes('o1-');
const isVisionModel = (modelName) => {
    const visionModels = ['gpt-4-vision', 'gpt-4o-vision', 'gpt-4o-mini-vision'];
    return modelName && visionModels.some(vm => modelName.toLowerCase().includes(vm.toLowerCase()));
};

const formatLaTeXContent = (content) => {
    if (!content) return content;

    // First replace code blocks to protect them
    const codeBlocks = [];
    content = content.replace(/```[\s\S]*?```/g, (match) => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // LaTeX formatting rules
    const latexRules = [
        // Sigma notation
        { pattern: /Σ[ᵢi]₌₁([³⁵⁴ⁿ\d])\s*([^=\n]+)/g, replacement: '$$\\sum_{i=1}^{$1} $2$$' },
        { pattern: /Σ\s*\(\s*i\s*=\s*1\s*to\s*([^\)]+)\)\s*([^=\n]+)/g, replacement: '$$\\sum_{i=1}^{$1} $2$$' },

        // Integral expressions
        { pattern: /∫([^d]+)dx(?!\))/g, replacement: '$$\\int $1 dx$$' },
        { pattern: /∫ₐᵇ/g, replacement: '$$\\int_{a}^{b}$$' },
        { pattern: /∫₀¹/g, replacement: '$$\\int_{0}^{1}$$' },
        { pattern: /∫\[([^\]]+)\]/g, replacement: '$$\\int_{$1}$$' },

        // Power expressions
        { pattern: /(\d+)²/g, replacement: '$$\\{$1\\}^2$$' },
        { pattern: /x²/g, replacement: '$$x^2$$' },
        { pattern: /xⁿ/g, replacement: '$$x^n$$' },
        { pattern: /x³/g, replacement: '$$x^3$$' },
        { pattern: /([^\$])\^(\d+|\{[^}]+\})/g, replacement: '$1^{$2}' },

        // Fraction expressions
        { pattern: /(\d+)\/(\d+)/g, replacement: '$$\\frac{$1}{$2}$$' },
        { pattern: /x²\/2/g, replacement: '$$\\frac{x^2}{2}$$' },
        { pattern: /x³\/3/g, replacement: '$$\\frac{x^3}{3}$$' },
        { pattern: /\(xⁿ⁺¹\)\/\(n\+1\)/g, replacement: '$$\\frac{x^{n+1}}{n+1}$$' },

        // Math blocks and cleanup
        { pattern: /```math\n([\s\S]*?)```/g, replacement: '$$\n$1\n$$' },
        { pattern: /([^$])\$([^$\n]+)\$([^$])/g, replacement: '$1$$2$$3' }
    ];

    // Apply all LaTeX formatting rules
    latexRules.forEach(rule => {
        content = content.replace(rule.pattern, rule.replacement);
    });

    // Restore code blocks
    codeBlocks.forEach((block, i) => {
        content = content.replace(`__CODE_BLOCK_${i}__`, block);
    });

    return content;
};

const formatMessages = ({ persona, previousMessages, fileContent, fileName, fileType }) => {
    try {
        // Filter and format valid messages
        const validMessages = (Array.isArray(previousMessages) ? previousMessages : [])
            .filter(msg => msg && msg.content && msg.content.trim().length > 0)
            .map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: formatLaTeXContent(msg.content.trim())
            }));

        // Initialize messages array
        let messages = [];

        // Add system message only if supported AND persona has instructions
        if (persona?.capabilities?.supportsSystemMessage && persona.instructions) {
            messages.push({
                role: 'system',
                content: `You are ${persona.name}, a ${persona.role}. ${persona.instructions}`
            });
        }

        // Handle file content if present
        if (fileContent && fileName) {
            const isImage = SUPPORTED_IMAGE_TYPES.includes(fileType);

            if (isImage && isVisionModel(persona.modelCodeName)) {
                // Handle image content for vision models
                const imageMessage = {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${fileType};base64,${fileContent}`,
                                detail: 'high'
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
                const fileMessage = {
                    role: 'user',
                    content: [
                        'File content:',
                        `<file>${fileName}</file>`,
                        `<content>${fileContent}</content>`,
                        validMessages[0]?.content || 'Please analyze this file.'
                    ].join('\n')
                };

                if (validMessages.length > 0) {
                    validMessages[0] = fileMessage;
                } else {
                    validMessages.push(fileMessage);
                }
            }
        }

        // Return combined messages
        return [...messages, ...validMessages];
    } catch (error) {
        console.error('Error in formatMessages:', error);
        return [{ role: 'user', content: 'Hello' }];
    }
};

const generateChatStream = async (messages, persona = {}) => {
    if (!messages || !Array.isArray(messages)) {
        throw new Error('Invalid messages format');
    }

    const requestParams = {
        model: persona.modelCodeName || DEFAULT_MODEL,
        messages,
        stream: true,
    };

    // Handle temperature setting
    if (persona.capabilities?.supportedParameters?.temperature?.supported !== false) {
        requestParams.temperature = persona.capabilities?.supportedParameters?.temperature?.default || DEFAULT_TEMPERATURE;
    }

    // Handle token limit setting
    const maxTokensParam = isO1Model(persona.modelCodeName) ? 'max_completion_tokens' : 'max_tokens';
    requestParams[maxTokensParam] = persona.capabilities?.supportedParameters?.maxTokens?.default || DEFAULT_MAX_TOKENS;

    // Retry logic for API calls
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
                console.error(`OpenAI API attempt ${attempt + 1} error:`, error);

                if (error?.response?.status === 400) {
                    throw error;
                }

                const retryableStatus = [429, 500, 502, 503, 504];
                if (!error?.response?.status || !retryableStatus.includes(error.response.status)) {
                    throw error;
                }
            }
        }
        throw lastError;
    } catch (error) {
        console.error('OpenAI API final error:', error);
        throw error;
    }
};

const extractContentFromChunk = (chunk) => {
    try {
        if (!chunk) return '';

        if (typeof chunk === 'string') {
            try {
                const parsed = JSON.parse(chunk);
                return parsed.choices?.[0]?.delta?.content || '';
            } catch {
                return '';
            }
        }

        return chunk.choices?.[0]?.delta?.content || '';
    } catch (error) {
        console.error('Error extracting content from chunk:', error);
        return '';
    }
};

const generateImage = async (prompt, options = {}) => {
    try {
        // Validate and prepare options
        const validatedOptions = {
            size: IMAGE_SIZES[options.size] || IMAGE_SIZES.small,
            style: IMAGE_STYLES[options.style] || IMAGE_STYLES.vivid,
            quality: IMAGE_QUALITY[options.quality] || IMAGE_QUALITY.standard
        };

        const request = {
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            ...validatedOptions
        };

        // Retry logic for image generation
        let lastError = null;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }

                const response = await openai.images.generate(request);

                if (!response?.data?.[0]?.url) {
                    throw new Error('Invalid response format from image generation');
                }

                return {
                    url: response.data[0].url,
                    metadata: {
                        ...validatedOptions,
                        prompt,
                        timestamp: new Date().toISOString()
                    }
                };

            } catch (error) {
                lastError = error;
                console.error(`Image generation attempt ${attempt + 1} failed:`, error);

                if (error.code === 'content_policy_violation' || error.response?.status === 400) {
                    throw error;
                }
            }
        }

        throw lastError || new Error('Failed to generate image after max retries');

    } catch (error) {
        console.error('OpenAI Image Generation error:', error);

        const errorMessage = error.code === 'content_policy_violation'
            ? 'Content policy violation: The image request contains inappropriate content.'
            : error.message || 'An unexpected error occurred during image generation';

        const formattedError = new Error(errorMessage);
        formattedError.code = error.code;
        formattedError.status = error.response?.status;
        formattedError.isImageGenerationError = true;

        throw formattedError;
    }
};

export {
    formatMessages,
    generateChatStream,
    extractContentFromChunk,
    generateImage,
    IMAGE_SIZES,
    IMAGE_STYLES,
    IMAGE_QUALITY,
    formatLaTeXContent
};

export default {
    formatMessages,
    generateChatStream,
    extractContentFromChunk,
    generateImage
}