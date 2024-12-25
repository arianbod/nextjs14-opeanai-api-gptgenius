import x from "./xClient";

const DEFAULT_MODEL = 'grok-2-1212';
const MAX_RETRIES = 3;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const formatLaTeXContent = (content) => {
    if (!content) return content;

    // First replace code blocks to protect them
    const codeBlocks = [];
    content = content.replace(/```[\s\S]*?```/g, (match) => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Fix Sigma notation with subscripts and superscripts
    content = content.replace(/Σ[ᵢi]₌₁([³⁵⁴ⁿ\d])\s*([^=\n]+)/g, '$$\\sum_{i=1}^{$1} $2$$');
    content = content.replace(/Σ\s*\(\s*i\s*=\s*1\s*to\s*([^\)]+)\)\s*([^=\n]+)/g,
        '$$\\sum_{i=1}^{$1} $2$$');

    // Fix integral expressions and other math notations
    content = content.replace(/∫([^d]+)dx(?!\))/g, '$$\\int $1 dx$$');
    content = content.replace(/∫ₐᵇ/g, '$$\\int_{a}^{b}$$');
    content = content.replace(/∫₀¹/g, '$$\\int_{0}^{1}$$');
    content = content.replace(/∫\[([^\]]+)\]/g, '$$\\int_{$1}$$');
    content = content.replace(/(\d+)²/g, '$$\\{$1\\}^2$$');
    content = content.replace(/x²/g, '$$x^2$$');
    content = content.replace(/xⁿ/g, '$$x^n$$');
    content = content.replace(/x³/g, '$$x^3$$');
    content = content.replace(/([^\$])\^(\d+|\{[^}]+\})/g, '$1^{$2}');
    content = content.replace(/(\d+)\/(\d+)/g, '$$\\frac{$1}{$2}$$');
    content = content.replace(/x²\/2/g, '$$\\frac{x^2}{2}$$');
    content = content.replace(/x³\/3/g, '$$\\frac{x^3}{3}$$');
    content = content.replace(/\(xⁿ⁺¹\)\/\(n\+1\)/g, '$$\\frac{x^{n+1}}{n+1}$$');

    // Replace math blocks with proper LaTeX delimiters
    content = content.replace(/```math\n([\s\S]*?)```/g, '$$\n$1\n$$');
    content = content.replace(/([^$])\$([^$\n]+)\$([^$])/g, '$1$$2$$3');

    // Restore code blocks
    codeBlocks.forEach((block, i) => {
        content = content.replace(`__CODE_BLOCK_${i}__`, block);
    });

    return content;
};

const xProvider = {
    formatMessages: ({ persona, previousMessages, fileContent, fileName, fileType }) => {
        const validMessages = (Array.isArray(previousMessages) ? previousMessages : [])
            .filter(msg => msg && msg.content && msg.content.trim().length > 0)
            .map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: formatLaTeXContent(msg.content.trim())
            }));

        if (validMessages.length === 0) {
            validMessages.push({
                role: 'user',
                content: 'Hello'
            });
        }

        let systemMessage = `You are ${persona.name}, a ${persona.role}. ${persona.instructions || ''}`;

        if (fileContent && fileName) {
            const isImage = SUPPORTED_IMAGE_TYPES.includes(fileType);

            if (isImage && persona.modelCodeName?.includes('vision')) {
                systemMessage += '\nAnalyze the provided image thoroughly and provide insights.';

                const firstMessageContent = [
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: fileType,
                            data: fileContent
                        }
                    },
                    {
                        type: 'text',
                        text: validMessages[0]?.content || 'Please analyze this image.'
                    }
                ];

                if (validMessages.length > 0) {
                    validMessages[0] = {
                        role: 'user',
                        content: firstMessageContent
                    };
                } else {
                    validMessages.push({
                        role: 'user',
                        content: firstMessageContent
                    });
                }
            } else {
                systemMessage += '\nAnalyze the provided file contents thoroughly.';
                const fileMessage = [
                    'File content:',
                    `<file>${fileName}</file>`,
                    `<content>${fileContent}</content>`,
                    validMessages[0]?.content || 'Please analyze this file.'
                ].join('\n');

                if (validMessages.length > 0) {
                    validMessages[0] = { role: 'user', content: fileMessage };
                } else {
                    validMessages.push({ role: 'user', content: fileMessage });
                }
            }
        }

        return {
            messages: validMessages,
            system: systemMessage
        };
    },

    generateChatStream: async (messages, persona = {}) => {
        if (!messages?.messages?.length) {
            throw new Error('No messages provided for generation');
        }

        const validMessages = messages.messages.filter(msg =>
            msg && msg.content && (
                typeof msg.content === 'string' ?
                    msg.content.trim().length > 0 :
                    Array.isArray(msg.content)
            )
        );

        if (validMessages.length === 0) {
            throw new Error('No valid messages with content found');
        }

        const streamOptions = {
            model: persona.modelCodeName || DEFAULT_MODEL,
            stream: true,
            temperature: persona.capabilities?.supportedParameters?.temperature?.default || 0.7,
            max_tokens: persona.capabilities?.supportedParameters?.maxTokens?.default || 48000,
            system: messages.system || '',
            messages: validMessages,
            presence_penalty: 0.6,
            frequency_penalty: 0.5
        };

        try {
            let lastError = null;
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    if (attempt > 0) {
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                    }
                    return await x.messages.create(streamOptions);
                } catch (error) {
                    lastError = error;
                    console.error('X API attempt error:', error);
                    if (!error.isRetryable) throw error;
                }
            }
            throw lastError;
        } catch (error) {
            console.error('X API error:', error);
            throw error;
        }
    },

    extractContentFromChunk: (chunk) => {
        try {
            if (!chunk) return '';

            if (typeof chunk === 'string') {
                try {
                    const parsed = JSON.parse(chunk);
                    return parsed.choices?.[0]?.delta?.content ||
                        parsed.delta?.text || '';
                } catch {
                    return '';
                }
            }

            return chunk.choices?.[0]?.delta?.content ||
                chunk.delta?.text || '';
        } catch (error) {
            console.error('Error extracting content from chunk:', error);
            return '';
        }
    },

    generateImage: async () => {
        throw new Error('Image generation not supported by X');
    }
};

export default xProvider;