import { type ModelInfo } from '../types/index.js';
export declare class MozartSyncService {
    private baseUrl;
    constructor();
    deleteModel(provider: string, modelId: string): Promise<boolean>;
    createModel(provider: string, modelData: ModelInfo): Promise<boolean>;
    getModels(): Promise<any>;
}
//# sourceMappingURL=sync.d.ts.map