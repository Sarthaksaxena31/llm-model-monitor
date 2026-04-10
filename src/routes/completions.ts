import express, { type Request, type Response } from 'express';

const router = express.Router();

// POST /api/v1/completions — streaming mock response
router.post('/completions', (req: Request, res: Response) => {
    const { messages, model, stream } = req.body;
    const userMessage = messages?.[messages.length - 1]?.content || 'Hello';

    if (stream === false) {
        // Non-streaming
        return res.json({
            success: true,
            data: {
                content: `[Mock ${model || 'gpt-4o'}] Response to: "${userMessage}"`,
                usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
            }
        });
    }

    // Streaming SSE response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const abortId = `abort_${Date.now()}`;
    const mockResponse = `This is a mock streaming response from the ${model || 'gpt-4o'} model. Your query was: "${userMessage}"`;
    const words = mockResponse.split(' ');

    // Send init event with abortId
    res.write(`data: ${JSON.stringify({ type: 'init', abortId })}\n\n\n\n`);

    let i = 0;
    const interval = setInterval(() => {
        if (i >= words.length) {
            clearInterval(interval);
            res.write(`data: ${JSON.stringify({ type: 'done', content: '' })}\n\n\n\n`);
            res.end();
            return;
        }
        res.write(`data: ${JSON.stringify({ type: 'text', content: words[i] + (i < words.length - 1 ? ' ' : '') })}\n\n\n\n`);
        i++;
    }, 50);

    req.on('close', () => clearInterval(interval));
});

// GET /api/v1/completions/abort/:abortId
router.get('/completions/abort/:abortId', (req: Request, res: Response) => {
    return res.json({ success: true, message: 'Stream aborted' });
});

// POST /api/v1/getResponse
router.post('/getResponse', (req: Request, res: Response) => {
    const { prompt, AI } = req.body;
    return res.json({
        success: true,
        data: `[Mock ${AI || 'GPT-4o'}] ${prompt}`
    });
});

export default router;
