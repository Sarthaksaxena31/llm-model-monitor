import express from 'express';
import dotenv from 'dotenv';
import { initDb } from './db/schema.js';
import { SchedulerService } from './services/scheduler.js';
import registryRoutes from './routes/registry.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use('/api/v1', registryRoutes);
app.get('/health', (req, res) => {
    res.json({ status: 'active', server: 'Sentinel' });
});
async function start() {
    try {
        console.log('--- Initializing Sentinel Monitoring ---');
        await initDb();
        const scheduler = new SchedulerService();
        scheduler.start();
        app.listen(port, () => {
            console.log(`Sentinel server running at http://localhost:${port}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map