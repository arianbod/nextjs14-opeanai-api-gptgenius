// lib/ai-providers/anthropicClient.js
import Anthropic from '@anthropic-ai/sdk';

if (!process.env.X_API_KEY) {
    throw new Error('X_API_KEY is not set in the environment variables.');
}

const anthropic = new Anthropic({
    apiKey: process.env.X_API_KEY,
    baseURL: process.env.X_API_BASE_URL
});

export default anthropic;
