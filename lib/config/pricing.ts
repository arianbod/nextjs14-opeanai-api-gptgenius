// lib/config/pricing.ts

export const CONVERSION_RATE = {
	DOLLARS_TO_TOKENS: 1000, // $1 = 1000 tokens (0.1 cents per token)
};

export const PRICING_TIERS = {
	PAY_AS_YOU_GO: {
		minimumPurchase: 5,
		tokensPerDollar: 1000, // 0.1 cents per token
		bonusMultiplier: 1,
	},
	STANDARD: {
		minimumPurchase: 20,
		tokensPerDollar: 1200, // 20% bonus
		bonusMultiplier: 1.2,
	},
	PREMIUM: {
		minimumPurchase: 50,
		tokensPerDollar: 1500, // 50% bonus
		bonusMultiplier: 1.5,
	},
} as const;

// Model-specific token costs
export const MODEL_COSTS = {
	'o1-preview': {
		tokenCost: 0.15, // 0.15 tokens per output token
		description: 'Premium model for complex tasks',
		actualApiCost: 0.03, // $0.03 per 1K tokens
	},
	'o1-mini': {
		tokenCost: 0.02, // 0.02 tokens per output token
		description: 'Efficient model for simple tasks',
		actualApiCost: 0.002,
	},
	'chatgpt-4o-latest': {
		tokenCost: 0.12, // 0.12 tokens per output token
		description: 'Balanced performance and cost',
		actualApiCost: 0.02,
	},
	'claude-3-5-sonnet-20241022': {
		tokenCost: 0.08, // 0.08 tokens per output token
		description: 'High-quality analytical model',
		actualApiCost: 0.015,
	},
	'llama-3.1-sonar-small-128k-online': {
		tokenCost: 0.05, // 0.05 tokens per output token
		description: 'Fast and efficient model',
		actualApiCost: 0.008,
	},
	'dall-e-3': {
		baseTokens: 200, // Cost per image in tokens
		description: 'High-quality image generation',
		actualApiCost: 0.04,
	},
} as const;

// Example packages
export const PRESET_PACKAGES = {
	STARTER: {
		price: 5,
		tokens: 5000, // $5 = 5000 tokens
		description: 'Perfect for trying out the service',
	},
	BASIC: {
		price: 10,
		tokens: 12000, // $10 = 12000 tokens (20% bonus)
		description: 'Great for regular users',
	},
	PRO: {
		price: 50,
		tokens: 75000, // $50 = 75000 tokens (50% bonus)
		description: 'Best value for power users',
	},
} as const;

// Usage examples (what you can do with tokens)
export const USAGE_EXAMPLES = {
	FIVE_DOLLARS: {
		tokens: 5000,
		examples: [
			'50 simple responses with o1-mini',
			'15 detailed responses with Claude',
			'8 complex analyses with o1-preview',
			'5 image generations',
			'Mix and match based on your needs',
		],
	},
	TEN_DOLLARS: {
		tokens: 12000,
		examples: [
			'120 simple responses with o1-mini',
			'35 detailed responses with Claude',
			'20 complex analyses with o1-preview',
			'12 image generations',
			'Mix and match based on your needs',
		],
	},
};
