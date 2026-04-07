import axios, {} from 'axios';
import {} from '../types/index.js';
export class OpenAIAdapter {
    provider = 'OpenAI';
    client;
    constructor(apiKey) {
        this.client = axios.create({
            baseURL: 'https://api.openai.com/v1',
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
    }
    async fetchModels() {
        const response = await this.client.get('/models');
        return response.data.data.map((m) => ({
            id: m.id
        }));
    }
    async verifyKey() {
        try {
            await this.client.get('/models'); // Simple check
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
//# sourceMappingURL=openai.js.map