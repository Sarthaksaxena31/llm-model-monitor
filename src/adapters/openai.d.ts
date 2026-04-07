import { type ProviderAdapter, type ProviderModel, type ModelStatus } from '../types/index.js';
export declare class OpenAIAdapter implements ProviderAdapter {
    readonly provider = "OpenAI";
    private client;
    constructor(apiKey: string);
    fetchModels(): Promise<ProviderModel[]>;
    verifyKey(): Promise<boolean>;
    mapError(error: any): ModelStatus;
}
//# sourceMappingURL=openai.d.ts.map