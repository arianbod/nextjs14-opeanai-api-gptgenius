// lib/error-handlers.js
const RATE_LIMIT_KEYWORDS = ['rate limit', 'too many requests', '429'];
const AUTH_ERROR_KEYWORDS = ['auth', 'authentication', 'invalid key', '401', '403'];
const TIMEOUT_KEYWORDS = ['timeout', 'timed out', 'deadline exceeded', '504'];

export function handleProviderError(error, currentProvider, fallbackOrder = ['openai', 'anthropic', 'perplexity']) {
    console.error(`Error from provider ${currentProvider}:`, error);

    // Don't fallback if file is present and provider is Claude (as other providers don't support files)
    if (error.originalMessage?.includes('file') || error.message?.includes('file')) {
        return {
            fallbackProvider: null,
            errorMessage: 'Error processing file. Please try again.'
        };
    }

    // Remove the current provider from fallback options
    const fallbackOptions = fallbackOrder.filter(p => p !== currentProvider);

    // If no fallback options available
    if (fallbackOptions.length === 0) {
        return {
            fallbackProvider: null,
            errorMessage: getErrorMessage(error)
        };
    }

    // Determine error type and appropriate fallback
    if (isRateLimitError(error)) {
        return {
            fallbackProvider: fallbackOptions[0],
            errorMessage: 'Rate limit reached, switching to fallback provider'
        };
    }

    if (isAuthError(error)) {
        return {
            fallbackProvider: null,
            errorMessage: 'Authentication failed. Please check your API keys.'
        };
    }

    if (isTimeoutError(error)) {
        return {
            fallbackProvider: fallbackOptions[0],
            errorMessage: 'Request timed out, trying alternate provider'
        };
    }

    // For unknown errors, try the next provider if available
    return {
        fallbackProvider: fallbackOptions[0],
        errorMessage: getErrorMessage(error)
    };
}

function isRateLimitError(error) {
    const errorString = error.message?.toLowerCase() || '';
    return RATE_LIMIT_KEYWORDS.some(keyword => errorString.includes(keyword.toLowerCase()));
}

function isAuthError(error) {
    const errorString = error.message?.toLowerCase() || '';
    return AUTH_ERROR_KEYWORDS.some(keyword => errorString.includes(keyword.toLowerCase()));
}

function isTimeoutError(error) {
    const errorString = error.message?.toLowerCase() || '';
    return TIMEOUT_KEYWORDS.some(keyword => errorString.includes(keyword.toLowerCase()));
}

function getErrorMessage(error) {
    // Clean and format error message for client
    const baseMessage = error.message || 'An unexpected error occurred';

    // Clean sensitive information
    return baseMessage
        .replace(/sk-[a-zA-Z0-9]+/g, '[REDACTED]')
        .replace(/key-[a-zA-Z0-9]+/g, '[REDACTED]')
        .replace(/Bearer [a-zA-Z0-9-._]+/g, 'Bearer [REDACTED]');
}

// Provider-specific error handlers
export const providerErrorHandlers = {
    openai: {
        handleError: (error) => {
            if (error.response?.status === 429) {
                return {
                    retry: true,
                    delay: parseInt(error.response.headers['retry-after'] || '30') * 1000
                };
            }
            return { retry: false };
        }
    },
    anthropic: {
        handleError: (error) => {
            if (error.type === 'rate_limit_error') {
                return {
                    retry: true,
                    delay: 5000 // Default 5s delay for Anthropic
                };
            }
            return { retry: false };
        }
    },
    perplexity: {
        handleError: (error) => {
            return { retry: false };
        }
    }
};