export type ModelStatus = 'active' | 'deprecated' | 'error' | 'auth_failure' | 'rate_limit' | 'transient_error' | 'unknown';

export interface ProviderModel {
    id: string;
    name?: string;
}

export interface ModelRegistry {
    id?: number;
    provider: string;
    modelId: string;
    status: ModelStatus;
    lastVerified: string;
    metadata: string; // JSON/String
    failureCount: number;
    lastError?: string;
}

export interface ProviderAdapter {
    provider: string;
    fetchModels(): Promise<ProviderModel[]>;
    verifyKey(): Promise<boolean>;
    mapError(error: any): ModelStatus;
}

export interface AlertPayload {
    level: 'CRITICAL' | 'WARNING';
    provider: string;
    modelId?: string;
    status: string;
    message: string;
    timestamp: string;
}

export interface ModelInfo {
    modelId: string;
    name: string;
    provider: string;
    description: string;
    contextWindow: number;
    maxOutputTokens: number;
    isPremium: boolean;
    inputTokenCostPerMillionTokens?: number;
    outputTokenCostPerMillionTokens?: number;
    isTemperatureSupported: boolean;
    isThinkingSupported: boolean;
    capabilities?: string[];
}
