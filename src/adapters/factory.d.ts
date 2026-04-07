import { type ProviderAdapter } from '../types/index.js';
export declare class ProviderFactory {
    private static overrides;
    static setAdapter(provider: string, adapter: ProviderAdapter): void;
    static getAdapter(provider: string): ProviderAdapter;
}
//# sourceMappingURL=factory.d.ts.map