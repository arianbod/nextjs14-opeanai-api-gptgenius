// types/persona.ts
export interface Persona {
	name: string;
	role: string;
	provider: 'openai' | 'anthropic' | 'meta' | 'perplexity';
	model?: string;
	temperature?: number;
	maxTokens?: number;
	instructions?: string;
}
