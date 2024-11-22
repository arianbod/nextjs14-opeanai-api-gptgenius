// lib/ai-providers/index.js
import * as openaiProvider from './openai-provider';
import * as claudeProvider from './claude-provider';
import * as perplexityProvider from './perplexity-provider';

const providers = {
    openai: openaiProvider,
    claude: claudeProvider,
    anthropic: claudeProvider, // alias for claude
    perplexity: perplexityProvider
};

export function getChatProvider(providerName = 'openai') {
    // Handle undefined or null provider
    if (!providerName) {
        console.warn('No provider specified, using default (OpenAI)');
        return providers.openai;
    }

    const provider = providers[providerName.toLowerCase()];
    if (!provider) {
        console.warn(`Provider ${providerName} not found, using default (OpenAI)`);
        return providers.openai;
    }
    return provider;
}

export function isProviderAvailable(providerName) {
    if (!providerName) return false;
    return providerName.toLowerCase() in providers;
}

export function getAvailableProviders() {
    return Object.keys(providers);
}

export function getDefaultProvider() {
    return 'openai';
}

export function getProviderConfig(providerName = 'openai') {
    const configs = {
        openai: {
            defaultModel: 'o1-mini',
            models: ['gpt-3.5-turbo', 'gpt-4'],
            supports: {
                chat: true,
                images: true
            }
        },
        claude: {
            defaultModel: 'claude-3-opus-20240229',
            models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
            supports: {
                chat: true,
                images: false
            }
        },
        perplexity: {
            defaultModel: 'mixtral-8x7b-instruct',
            models: ['mixtral-8x7b-instruct'],
            supports: {
                chat: true,
                images: false
            }
        }
    };

    return configs[providerName?.toLowerCase()] || configs.openai;
}