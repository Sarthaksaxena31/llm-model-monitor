import express, {} from 'express';
import { getDb } from '../db/schema.js';
import { CheckerService } from '../services/checker.js';
const router = express.Router();
const checker = new CheckerService();
router.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'Sentinel' });
});
router.get('/models', async (req, res) => {
    try {
        const db = await getDb();
        const models = await db.all('SELECT * FROM model_registry');
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch models' });
    }
});
router.post('/check', async (req, res) => {
    try {
        checker.runAllChecks().catch(err => console.error('Manual check error:', err));
        res.json({ message: 'Health check triggered' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to trigger check' });
    }
});
export default router;
//# sourceMappingURL=registry.js.map