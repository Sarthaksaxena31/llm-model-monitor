import {} from '../types/index.js';
export class MockAdapter {
    provider = 'Mock';
    simulatedErrorStatus = null;
    async fetchModels() {
        if (this.simulatedErrorStatus === 'deprecated') {
            throw { response: { status: 404 }, isAxiosError: true };
        }
        return [
            { id: 'mock-model-1' },
            { id: 'mock-model-2' }
        ];
    }
    async verifyKey() {
        if (this.simulatedErrorStatus === 'auth_failure')
            return false;
        return true;
    }
    mapError(error) {
        if (error.response?.status === 404)
            return 'deprecated';
        if (error.response?.status === 401)
            return 'auth_failure';
        return 'error';
    }
}
//# sourceMappingURL=mock.js.map