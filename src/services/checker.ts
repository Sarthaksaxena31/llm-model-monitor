import { getDb } from '../db/schema.js';
import { ProviderFactory } from '../adapters/factory.js';
import { AlerterService } from './alerter.js';
import { type ModelStatus, type ModelRegistry, type ProviderAdapter } from '../types/index.js';

export class CheckerService {
    private alerter: AlerterService;

    constructor() {
        this.alerter = new AlerterService();
    }

    async runAllChecks() {
        console.log('--- Starting Model Health Check ---', new Date().toISOString());
        const db = await getDb();
        const providers = await db.all('SELECT DISTINCT provider FROM model_registry');
        await Promise.allSettled(providers.map(p => this.checkProvider(p.provider)));
        console.log('--- Finished Model Health Check ---');
    }

    private async checkProvider(providerName: string) {
        console.log(`Checking provider: ${providerName}`);
        const adapter = ProviderFactory.getAdapter(providerName);
        try {
            const isKeyValid = await this.retry(() => adapter.verifyKey(), 2, adapter);
            if (!isKeyValid) {
                await this.handleAuthFailure(providerName);
                return;
            }
            const fetchedModels = await this.retry(() => adapter.fetchModels(), 2, adapter);
            const fetchedIds = new Set(fetchedModels.map(m => m.id));
            const db = await getDb();
            const registeredModels = await db.all('SELECT * FROM model_registry WHERE provider = ?', [providerName]);
            for (const model of registeredModels) {
                if (!fetchedIds.has(model.modelId)) {
                    await this.handleDeprecation(model);
                } else {
                    await this.handleSuccess(model);
                }
            }
        } catch (error) {
            const status = adapter.mapError(error);
            await this.handleGeneralError(providerName, status, error);
        }
    }

    private async handleAuthFailure(provider: string) {
        const db = await getDb();
        await db.run('UPDATE model_registry SET status = ?, failureCount = failureCount + 1 WHERE provider = ?',
            ['auth_failure', provider]);
        await this.alerter.sendAlert({
            level: 'CRITICAL', provider, status: 'auth_failure',
            message: `API Key for ${provider} is invalid. Action required.`,
            timestamp: new Date().toISOString()
        });
    }

    private async handleDeprecation(model: ModelRegistry) {
        const db = await getDb();
        if (model.status !== 'deprecated') {
            await db.run('UPDATE model_registry SET status = "deprecated", lastVerified = ? WHERE id = ?',
                [new Date().toISOString(), model.id]);
            await this.alerter.sendAlert({
                level: 'CRITICAL', provider: model.provider, modelId: model.modelId, status: 'deprecated',
                message: `Model ${model.modelId} has been deprecated by ${model.provider}.`,
                timestamp: new Date().toISOString()
            });
        }
    }

    private async handleSuccess(model: ModelRegistry) {
        const db = await getDb();
        await db.run('UPDATE model_registry SET status = "active", failureCount = 0, lastError = NULL, lastVerified = ? WHERE id = ?',
            [new Date().toISOString(), model.id]);
    }

    private async handleGeneralError(provider: string, status: ModelStatus, error: any) {
        const db = await getDb();
        const msg = error.message || 'Unknown network error';
        await db.run('UPDATE model_registry SET lastError = ?, failureCount = failureCount + 1 WHERE provider = ?', [msg, provider]);
        const level = status === 'rate_limit' ? 'WARNING' : 'CRITICAL';
        await this.alerter.sendAlert({
            level, provider, status, message: `Error checking ${provider}: ${msg}`,
            timestamp: new Date().toISOString()
        });
    }

    private async retry<T>(op: () => Promise<T>, count: number, adapter: ProviderAdapter): Promise<T> {
        let lastErr;
        for (let i = 0; i < count; i++) {
            try { return await op(); }
            catch (e) {
                lastErr = e;
                if (adapter.mapError(e) === 'transient_error' && i < count - 1) {
                    await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
                    continue;
                }
                throw e;
            }
        }
        throw lastErr;
    }
}
