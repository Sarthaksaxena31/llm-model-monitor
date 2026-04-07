import { type ProviderAdapter, type ProviderModel, type ModelStatus } from '../types/index.js';
export declare class AnthropicAdapter implements ProviderAdapter {
    readonly provider = "Anthropic";
    private client;
    constructor(apiKey: string);
    fetchModels(): Promise<ProviderModel[]>;
    verifyKey(): Promise<boolean>;
    mapError(error: any): ModelStatus;
}
//# sourceMappingURL=anthropic.d.ts.map