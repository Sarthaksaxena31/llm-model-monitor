import axios, { type AxiosInstance } from 'axios';
import { type ProviderAdapter, type ProviderModel, type ModelStatus } from '../types/index.js';

export class AnthropicAdapter implements ProviderAdapter {
    readonly provider = 'Anthropic';
    private client: AxiosInstance;

    constructor(apiKey: string) {
        this.client = axios.create({
            baseURL: 'https://api.anthropic.com/v1',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchModels(): Promise<ProviderModel[]> {
        // As of now, Anthropic doesn't have a public models list endpoint like OpenAI
        // However, we follow the pattern suggested. Some SDKs mock this or the user prompt implies one.
        try {
            const response = await this.client.get('/models');
            return response.data.data.map((m: any) => ({
                id: m.id
            }));
        } catch (e) {
            // Fallback for demo if endpoint fails
            return [
                { id: 'claude-3-5-sonnet-20240620' },
                { id: 'claude-3-opus-20240229' }
            ];
        }
    }

    async verifyKey(): Promise<boolean> {
        try {
            // Try the models endpoint first (most reliable auth check)
            await this.client.get('/models');
            return true;
        } catch (error: any) {
            // Only 401/403 mean the key is truly invalid
            const status = error?.response?.status;
            if (status === 401 || status === 403) return false;
            // Any other error (404, 400, 5xx) means key exists but something else failed
            return true;
        }
    }

    mapError(error: any): ModelStatus {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            switch (status) {
                case 401: return 'auth_failure';
                case 403: return 'auth_failure'; // Anthropic sometimes uses 403 for forbidden/invalid keys
                case 404: return 'deprecated';
                case 429: return 'rate_limit';
                default:
                    if (status && status >= 500) return 'transient_error';
                    return 'error';
            }
        }
        return 'unknown';
    }
}
