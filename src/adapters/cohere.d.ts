import { type ProviderAdapter, type ProviderModel, type ModelStatus } from '../types/index.js';
export declare class CohereAdapter implements ProviderAdapter {
    readonly provider = "Cohere";
    private client;
    constructor(apiKey: string);
    fetchModels(): Promise<ProviderModel[]>;
    verifyKey(): Promise<boolean>;
    mapError(error: any): ModelStatus;
}
//# sourceMappingURL=cohere.d.ts.map