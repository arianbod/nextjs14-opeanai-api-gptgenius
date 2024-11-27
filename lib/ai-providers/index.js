// lib/ai-providers/index.js
export function getProviderConfig(providerName = 'openai') {
    const configs = {
        openai: {
            defaultModel: 'o1-mini',
            models: ["o1-preview", 'chatgpt-4o-latest', 'o1-mini'],
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

export function isProviderAvailable(providerName) {
    if (!providerName || typeof providerName !== 'string') return false;
    const configs = getProviderConfig();
    return providerName.toLowerCase() in configs;
}

export function getAvailableProviders() {
    return Object.keys(getProviderConfig());
}

export function getDefaultProvider() {
    return 'openai';
}