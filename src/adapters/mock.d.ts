import { type ProviderAdapter, type ProviderModel, type ModelStatus } from '../types/index.js';
export declare class MockAdapter implements ProviderAdapter {
    readonly provider = "Mock";
    simulatedErrorStatus: ModelStatus | null;
    fetchModels(): Promise<ProviderModel[]>;
    verifyKey(): Promise<boolean>;
    mapError(error: any): ModelStatus;
}
//# sourceMappingURL=mock.d.ts.map