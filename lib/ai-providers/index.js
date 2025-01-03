
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
        deepseek: {
            defaultModel: 'deepseek-chat',
            models: ["deepseek-chat"],
            supports: {
                chat: true,
                images: true
            }
        },
        claude: {
            defaultModel: 'claude-3-5-sonnet-latest',
            models: ['claude-3-5-sonnet-latest', 'claude-3-5-sonnet-latest'],
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