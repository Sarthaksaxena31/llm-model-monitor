import axios, { type AxiosInstance } from 'axios';
import { type ProviderAdapter, type ProviderModel, type ModelStatus } from '../types/index.js';

export class CohereAdapter implements ProviderAdapter {
    readonly provider = 'Cohere';
    private client: AxiosInstance;

    constructor(apiKey: string) {
        this.client = axios.create({
            baseURL: 'https://api.cohere.com/v1',
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
    }

    async fetchModels(): Promise<ProviderModel[]> {
        const response = await this.client.get('/models');
        return response.data.models.map((m: any) => ({
            id: m.name
        }));
    }

    async verifyKey(): Promise<boolean> {
        try {
            await this.client.get('/models');
            return true;
        } catch (error) {
            return false;
        }
    }

    mapError(error: any): ModelStatus {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            switch (status) {
                case 401: return 'auth_failure';
                case 404: return 'deprecated'; // This follows requirements
                case 429: return 'rate_limit';
                default:
                    if (status && status >= 500) return 'transient_error';
                    return 'error';
            }
        }
        return 'unknown';
    }
}
