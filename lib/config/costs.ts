// @ts-nocheck

// lib/config/integrated-config.ts

// =======================================
// Type Definitions
// =======================================

// Defines the possible types of AI models we support
type ModelType = 'text' | 'image' | 'audio';

// Base configuration that all model types must have
interface BaseModelConfig {
	type: ModelType;
	baseTokensPerMessage: number; // Minimum tokens charged for any message
	tokenCost: number; // How many of our tokens it costs per operation
	actualApiCost: number; // What the provider charges us per 1K tokens
	description: string; // User-friendly description
	isPro?: boolean; // Whether this is a premium model
	speed?: 'Fast' | 'Very Fast' | 'Slow'; // Performance indicator
}

// Configuration specific to text-based models
interface TextModelConfig extends BaseModelConfig {
	type: 'text';
	tokensPerCharacter: number; // How many tokens per character (avg)
	supportsSystemMessage: boolean; // Whether model accepts system prompts
	maxTokens: number; // Maximum context length
}

// Configuration specific to image generation models
interface ImageModelConfig extends BaseModelConfig {
	type: 'image';
	maxDimensions: {
		// Maximum image dimensions
		width: number;
		height: number;
	};
}

// =======================================
// Global Pricing Configuration
// =======================================

export const PRICING = {
	// How many of our tokens equal one dollar
	// 1000 means each token costs 0.1 cents ($0.001)
	CONVERSION_RATE: 1000,

	// Different pricing tiers for bulk purchases
	TIERS: {
		PAY_AS_YOU_GO: {
			minimumPurchase: 5, // Minimum USD purchase
			tokensPerDollar: 1000, // No bonus
			bonusMultiplier: 1,
		},
		STANDARD: {
			minimumPurchase: 20,
			tokensPerDollar: 1200, // 20% bonus tokens
			bonusMultiplier: 1.2,
		},
		PREMIUM: {
			minimumPurchase: 50,
			tokensPerDollar: 1500, // 50% bonus tokens
			bonusMultiplier: 1.5,
		},
	},
} as const;

// =======================================
// Model Configurations
// =======================================

export const MODELS = {
	// ---------------
	// Perplexity API
	// ---------------
	perplexity: {
		'llama-3.1-sonar-small-128k-online': {
			type: 'text',
			baseTokensPerMessage: 20,
			tokensPerCharacter: 0.25, // Approx. 4 chars per token
			tokenCost: 0.05, // 0.05 our tokens per API token
			actualApiCost: 0.008, // $0.008 per 1K tokens from provider
			description: 'Perplexity Mixtral based model',
			supportsSystemMessage: true,
			maxTokens: 128000, // Very large context window
			speed: 'Very Fast',
			isPro: true,
		} as TextModelConfig,
	},

	// ---------------
	// OpenAI Models
	// ---------------
	openai: {
		'o1-preview': {
			type: 'text',
			baseTokensPerMessage: 20,
			tokensPerCharacter: 0.25,
			tokenCost: 0.15, // Premium pricing
			actualApiCost: 0.03,
			description: 'OpenAI premium model',
			supportsSystemMessage: false,
			maxTokens: 4096,
			speed: 'Slow',
			isPro: true,
		} as TextModelConfig,
		'o1-mini': {
			type: 'text',
			baseTokensPerMessage: 20,
			tokensPerCharacter: 0.25,
			tokenCost: 0.02, // Budget-friendly option
			actualApiCost: 0.002,
			description: 'OpenAI basic model',
			supportsSystemMessage: false,
			maxTokens: 4096,
			speed: 'Fast',
		} as TextModelConfig,
		'chatgpt-4o-latest': {
			type: 'text',
			baseTokensPerMessage: 20,
			tokensPerCharacter: 0.25,
			tokenCost: 0.12,
			actualApiCost: 0.02,
			description: 'OpenAI GPT-4 model',
			supportsSystemMessage: true,
			maxTokens: 8192,
			speed: 'Very Fast',
		} as TextModelConfig,
		'dall-e-3': {
			type: 'image',
			baseTokensPerMessage: 200, // Fixed cost per image
			tokenCost: 1, // Each image costs 200 tokens
			actualApiCost: 0.04,
			description: 'DALL-E 3 image generation',
			maxDimensions: {
				width: 1024,
				height: 1024,
			},
			speed: 'Fast',
			isPro: true,
		} as ImageModelConfig,
	},

	// ---------------
	// Anthropic Models
	// ---------------
	anthropic: {
		'claude-3-5-sonnet-20241022': {
			type: 'text',
			baseTokensPerMessage: 20,
			tokensPerCharacter: 0.25,
			tokenCost: 0.08,
			actualApiCost: 0.015,
			description: 'Claude 3.5 Sonnet model',
			supportsSystemMessage: true,
			maxTokens: 200000,
			speed: 'Fast',
			isPro: true,
		} as TextModelConfig,
	},
} as const;

// =======================================
// Type Definitions for Providers and Models
// =======================================

type Provider = keyof typeof MODELS;

type Model = {
	[K in keyof typeof MODELS]: keyof (typeof MODELS)[K];
}[keyof typeof MODELS];

// =======================================
// Utility Functions
// =======================================

/**
 * Get configuration for a specific model
 * @throws Error if model not found
 */
export function getModel<
	K extends Provider,
	M extends keyof (typeof MODELS)[K]
>(provider: K, model: M): (typeof MODELS)[K][M] {
	const config = MODELS[provider][model];
	if (!config) {
		throw new Error(`No configuration found for ${provider}/${model}`);
	}
	return config;
}

/**
 * Estimate how many tokens a piece of text or operation will use
 * For text: based on character count plus base cost
 * For images: returns fixed base cost
 */
export function estimateTokens(
	text: string,
	config: TextModelConfig | ImageModelConfig
) {
	if (config.type === 'text') {
		return Math.ceil(
			config.baseTokensPerMessage + text.length * config.tokensPerCharacter
		);
	}
	return config.baseTokensPerMessage;
}

/**
 * Calculate how many of our tokens an operation will cost
 * Takes estimated tokens and multiplies by model's token cost
 */
export function calculateCost(
	tokens: number,
	config: TextModelConfig | ImageModelConfig
) {
	return Math.ceil(tokens * config.tokenCost);
}

// =======================================
// Usage Examples for Reference
// =======================================

export const USAGE_EXAMPLES = {
	FIVE_DOLLARS: {
		tokens: 5000, // What $5 gets you
		examples: [
			{
				model: 'o1-mini',
				// Calculate how many responses possible with simple model
				count: Math.floor(5000 / (20 * 0.02)),
				description: 'simple responses',
			},
			{
				model: 'claude-3-5-sonnet-20241022',
				// Calculate how many responses possible with premium model
				count: Math.floor(5000 / (20 * 0.08)),
				description: 'detailed responses',
			},
			{
				model: 'dall-e-3',
				// Calculate how many images possible
				count: Math.floor(5000 / 200),
				description: 'image generations',
			},
		],
	},
};
