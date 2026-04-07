import { CheckerService } from './services/checker.js';
import { ProviderFactory } from './adapters/factory.js';
import { MockAdapter } from './adapters/mock.js';
import { initDb } from './db/schema.js';
import dotenv from 'dotenv';
dotenv.config();
async function runDemo() {
    console.log('--- STARTING DEMO: Cohere 404 Failure ---');
    await initDb();
    const cohereMock = new MockAdapter();
    cohereMock.simulatedErrorStatus = 'deprecated';
    ProviderFactory.setAdapter('cohere', cohereMock);
    const checker = new CheckerService();
    console.log('Running health check with Cohere forced to fail (404)...');
    await checker.runAllChecks();
    console.log('--- DEMO COMPLETE ---');
    process.exit(0);
}
runDemo().catch(err => {
    console.error('Demo failed:', err);
    process.exit(1);
});
//# sourceMappingURL=demo_failure.js.map