import express, { type Request, type Response } from 'express';

const router = express.Router();

function generateMockData(period: string, count: number = 12) {
    const labels: string[] = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        if (period === 'day') {
            const d = new Date(now);
            d.setHours(now.getHours() - i);
            labels.push(d.toISOString().slice(0, 13));
        } else if (period === 'week') {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            labels.push(d.toISOString().slice(0, 10));
        } else {
            const d = new Date(now);
            d.setMonth(now.getMonth() - i);
            labels.push(d.toISOString().slice(0, 7));
        }
    }
    return labels.map(label => ({
        label,
        count: Math.floor(Math.random() * 100) + 10,
        cost: Math.random() * 5,
        tokens: Math.floor(Math.random() * 50000),
    }));
}

// POST /api/v1/costAnalytics/highestConversations
router.post('/highestConversations', (req: Request, res: Response) => {
    const { period = 'year', model = 'all', userType = 'all' } = req.query;
    const data = [
        { userId: 'usr_001', email: 'alice@example.com', conversationCount: 87, totalCost: 12.5 },
        { userId: 'usr_002', email: 'bob@example.com', conversationCount: 64, totalCost: 9.8 },
        { userId: 'usr_003', email: 'carol@example.com', conversationCount: 52, totalCost: 7.2 },
        { userId: 'usr_004', email: 'dan@example.com', conversationCount: 41, totalCost: 5.4 },
        { userId: 'usr_005', email: 'eve@example.com', conversationCount: 38, totalCost: 4.9 },
    ];
    return res.json({ success: true, data });
});

// POST /api/v1/costAnalytics/periodicDistribution
router.post('/periodicDistribution', (req: Request, res: Response) => {
    const { period = 'year' } = req.query;
    const data = generateMockData(period as string);
    return res.json({ success: true, data });
});

// POST /api/v1/costAnalytics/gptDistribution
router.post('/gptDistribution', (req: Request, res: Response) => {
    const modelData = [
        { model: 'gpt-4o', provider: 'OpenAI', count: 320, cost: 45.6, tokens: 1250000 },
        { model: 'gpt-4o-mini', provider: 'OpenAI', count: 580, cost: 8.7, tokens: 2100000 },
        { model: 'claude-3-5-sonnet', provider: 'Anthropic', count: 210, cost: 38.2, tokens: 980000 },
        { model: 'command-r', provider: 'Cohere', count: 145, cost: 5.4, tokens: 630000 },
        { model: 'command-r-plus', provider: 'Cohere', count: 88, cost: 12.3, tokens: 395000 },
    ];
    return res.json({ success: true, data: modelData });
});

export default router;
