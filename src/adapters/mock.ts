import { type ProviderAdapter, type ProviderModel, type ModelStatus } from '../types/index.js';

export class MockAdapter implements ProviderAdapter {
    readonly provider = 'Mock';
    public simulatedErrorStatus: ModelStatus | null = null;

    async fetchModels(): Promise<ProviderModel[]> {
        if (this.simulatedErrorStatus === 'deprecated') {
            throw { response: { status: 404 }, isAxiosError: true };
        }
        return [
            { id: 'mock-model-1' },
            { id: 'mock-model-2' }
        ];
    }

    async verifyKey(): Promise<boolean> {
        if (this.simulatedErrorStatus === 'auth_failure') return false;
        return true;
    }

    mapError(error: any): ModelStatus {
        if (error.response?.status === 404) return 'deprecated';
        if (error.response?.status === 401) return 'auth_failure';
        return 'error';
    }
}
