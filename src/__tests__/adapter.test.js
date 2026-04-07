import test from 'node:test';
import assert from 'node:assert';
import { MockAdapter } from '../adapters/mock.js';
import { ProviderFactory } from '../adapters/factory.js';
test('ProviderFactory should return requested adapter', (t) => {
    const adapter = ProviderFactory.getAdapter('mock');
    assert.strictEqual(adapter.provider, 'Mock');
});
test('MockAdapter should simulate deprecated status via 404', async (t) => {
    const adapter = new MockAdapter();
    adapter.simulatedErrorStatus = 'deprecated';
    try {
        await adapter.fetchModels();
        assert.fail('Should have thrown an error');
    }
    catch (e) {
        const errorStatus = adapter.mapError(e);
        assert.strictEqual(errorStatus, 'deprecated');
    }
});
test('MockAdapter should simulate auth failure via 401', async (t) => {
    const adapter = new MockAdapter();
    adapter.simulatedErrorStatus = 'auth_failure';
    const isValid = await adapter.verifyKey();
    assert.strictEqual(isValid, false);
});
//# sourceMappingURL=adapter.test.js.map