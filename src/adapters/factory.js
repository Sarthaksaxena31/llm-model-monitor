import { OpenAIAdapter } from './openai.js';
import { AnthropicAdapter } from './anthropic.js';
import { CohereAdapter } from './cohere.js';
import { MockAdapter } from './mock.js';
import {} from '../types/index.js';
import dotenv from 'dotenv';
dotenv.config();
export class ProviderFactory {
    static overrides = new Map();
    static setAdapter(provider, adapter) {
        this.overrides.set(provider.toLowerCase(), adapter);
    }
    static getAdapter(provider) {
        const p = provider.toLowerCase();
        if (this.overrides.has(p)) {
            return this.overrides.get(p);
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
//# sourceMappingURL=factory.js.map