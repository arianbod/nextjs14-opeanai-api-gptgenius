// lib/ai-providers/server.js
import openaiProvider from './openai-provider';
import claudeProvider from './claude-provider';
import xProvider from './x-provider';
import perplexityProvider from './perplexity-provider';
import geminiProvider from './gemini-provider';
const providers = {
    openai: openaiProvider,
    claude: claudeProvider,
    anthropic: claudeProvider,
    perplexity: perplexityProvider,
    x: xProvider,
    gemini: geminiProvider,
};

export function getChatProvider(providerName = 'openai') {
    if (!providerName || typeof providerName !== 'string') {
        console.warn('Invalid provider specified, using default (OpenAI)');
        return providers.openai;
    }

    const provider = providers[providerName.toLowerCase()];
    if (!provider) {
        console.warn(`Provider ${providerName} not found, using default (OpenAI)`);
        return providers.openai;
    }
    return provider;
}

// For backward compatibility and direct access
export const { formatMessages, generateChatStream, extractContentFromChunk, generateImage } = openaiProvider;