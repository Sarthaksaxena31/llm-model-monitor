import axios, {} from 'axios';
import {} from '../types/index.js';
export class CohereAdapter {
    provider = 'Cohere';
    client;
    constructor(apiKey) {
        this.client = axios.create({
            baseURL: 'https://api.cohere.com/v1',
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
    }
    async fetchModels() {
        const response = await this.client.get('/models');
        return response.data.models.map((m) => ({
            id: m.name
        }));
    }
    async verifyKey() {
        try {
            await this.client.get('/models');
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
                case 404: return 'deprecated'; // This follows requirements
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
//# sourceMappingURL=cohere.js.map