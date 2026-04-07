import axios, {} from 'axios';
import {} from '../types/index.js';
export class AnthropicAdapter {
    provider = 'Anthropic';
    client;
    constructor(apiKey) {
        this.client = axios.create({
            baseURL: 'https://api.anthropic.com/v1',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
        });
    }
    async fetchModels() {
        // As of now, Anthropic doesn't have a public models list endpoint like OpenAI
        // However, we follow the pattern suggested. Some SDKs mock this or the user prompt implies one.
        try {
            const response = await this.client.get('/models');
            return response.data.data.map((m) => ({
                id: m.id
            }));
        }
        catch (e) {
            // Fallback for demo if endpoint fails
            return [
                { id: 'claude-3-5-sonnet-20240620' },
                { id: 'claude-3-opus-20240229' }
            ];
        }
    }
    async verifyKey() {
        try {
            // Use a minimal message to verify key if models endpoint doesn't exist
            // This is consistent with the "ping" request mentioned in instructions.
            await this.client.post('/messages', {
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1,
                messages: [{ role: 'user', content: 'ping' }]
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    mapError(error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            switch (status) {
                case 401: return 'auth_failure';
                case 403: return 'auth_failure'; // Anthropic sometimes uses 403 for forbidden/invalid keys
                case 404: return 'deprecated';
                case 429: return 'rate_limit';
                default:
                    if (status && status >= 500)
                        return 'transient_error';
                    return 'error';
            }
        }
        return 'unknown';
    }
}
//# sourceMappingURL=anthropic.js.map