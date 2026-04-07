import { OpenAIAdapter } from './openai.js';
import { AnthropicAdapter } from './anthropic.js';
import { CohereAdapter } from './cohere.js';
import { MockAdapter } from './mock.js';
import { type ProviderAdapter } from '../types/index.js';
import dotenv from 'dotenv';

dotenv.config();

export class ProviderFactory {
    private static overrides: Map<string, ProviderAdapter> = new Map();

    static setAdapter(provider: string, adapter: ProviderAdapter) {
        this.overrides.set(provider.toLowerCase(), adapter);
    }

    static getAdapter(provider: string): ProviderAdapter {
        const p = provider.toLowerCase();

        if (this.overrides.has(p)) {
            return this.overrides.get(p)!;
        }

        switch (p) {
            case 'openai':
                return new OpenAIAdapter(process.env.OPENAI_API_KEY || '');
            case 'anthropic':
                return new AnthropicAdapter(process.env.ANTHROPIC_API_KEY || '');
            case 'cohere':
                return new CohereAdapter(process.env.COHERE_API_KEY || '');
            case 'mock':
                return new MockAdapter();
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}
