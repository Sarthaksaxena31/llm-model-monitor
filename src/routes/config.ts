import express, { type Request, type Response } from 'express';
import crypto from 'crypto';
import { type ModelInfo } from '../types/index.js';

const router = express.Router();

// In-memory model store, mirroring what the frontend adminService expects
// Grouped by provider
let modelStore: Record<string, ModelInfo[]> = {
    OpenAI: [
        {
            modelId: 'gpt-4o',
            name: 'GPT-4o',
            provider: 'OpenAI',
            description: 'Most capable GPT-4 model with multimodal capabilities.',
            contextWindow: 128000,
            maxOutputTokens: 4096,
            isPremium: true,
            inputTokenCostPerMillionTokens: 5.0,
            outputTokenCostPerMillionTokens: 15.0,
            isTemperatureSupported: true,
            isThinkingSupported: false,
            capabilities: ['text', 'vision', 'function_calling'],
        },
        {
            modelId: 'gpt-4o-mini',
            name: 'GPT-4o Mini',
            provider: 'OpenAI',
            description: 'Smaller, faster, and cheaper version of GPT-4o.',
            contextWindow: 128000,
            maxOutputTokens: 16384,
            isPremium: false,
            inputTokenCostPerMillionTokens: 0.15,
            outputTokenCostPerMillionTokens: 0.6,
            isTemperatureSupported: true,
            isThinkingSupported: false,
            capabilities: ['text', 'vision', 'function_calling'],
        },
    ],
    Anthropic: [
        {
            modelId: 'claude-3-5-sonnet',
            name: 'Claude 3.5 Sonnet',
            provider: 'Anthropic',
            description: 'Most intelligent Claude model with extended thinking.',
            contextWindow: 200000,
            maxOutputTokens: 8192,
            isPremium: true,
            inputTokenCostPerMillionTokens: 3.0,
            outputTokenCostPerMillionTokens: 15.0,
            isTemperatureSupported: true,
            isThinkingSupported: true,
            capabilities: ['text', 'vision', 'function_calling'],
        },
        {
            modelId: 'claude-3-haiku',
            name: 'Claude 3 Haiku',
            provider: 'Anthropic',
            description: 'Fast and compact model for near-instant responsiveness.',
            contextWindow: 200000,
            maxOutputTokens: 4096,
            isPremium: false,
            inputTokenCostPerMillionTokens: 0.25,
            outputTokenCostPerMillionTokens: 1.25,
            isTemperatureSupported: true,
            isThinkingSupported: false,
            capabilities: ['text'],
        },
    ],
    Cohere: [
        {
            modelId: 'command-r',
            name: 'Command R',
            provider: 'Cohere',
            description: 'Optimized for RAG and tool use.',
            contextWindow: 128000,
            maxOutputTokens: 4096,
            isPremium: false,
            inputTokenCostPerMillionTokens: 0.5,
            outputTokenCostPerMillionTokens: 1.5,
            isTemperatureSupported: true,
            isThinkingSupported: false,
            capabilities: ['text', 'rag'],
        },
        {
            modelId: 'command-r-plus',
            name: 'Command R+',
            provider: 'Cohere',
            description: 'Most capable Cohere model for complex tasks.',
            contextWindow: 128000,
            maxOutputTokens: 4096,
            isPremium: true,
            inputTokenCostPerMillionTokens: 3.0,
            outputTokenCostPerMillionTokens: 15.0,
            isTemperatureSupported: true,
            isThinkingSupported: false,
            capabilities: ['text', 'rag', 'function_calling'],
        },
    ],
};

// POST /api/v1/config/getModels
router.post('/getModels', (req: Request, res: Response) => {
    return res.json({ success: true, data: modelStore });
});

// POST /api/v1/config/createModel
router.post('/createModel', (req: Request, res: Response) => {
    const { AIProvider, modelData } = req.body;
    if (!AIProvider || !modelData?.modelId) {
        return res.status(400).json({ success: false, message: 'AIProvider and modelData.modelId are required' });
    }
    if (!modelStore[AIProvider]) {
        modelStore[AIProvider] = [];
    }
    const existing = modelStore[AIProvider].find(m => m.modelId === modelData.modelId);
    if (existing) {
        return res.status(409).json({ success: false, message: `Model ${modelData.modelId} already exists for ${AIProvider}` });
    }
    modelStore[AIProvider].push({ ...modelData, provider: AIProvider });
    return res.json({ success: true, data: modelData, message: 'Model created successfully' });
});

// PUT /api/v1/config/updateModel
router.put('/updateModel', (req: Request, res: Response) => {
    const { AIProvider, model, modelData } = req.body;
    if (!AIProvider || !model) {
        return res.status(400).json({ success: false, message: 'AIProvider and model are required' });
    }
    if (!modelStore[AIProvider]) {
        return res.status(404).json({ success: false, message: `Provider ${AIProvider} not found` });
    }
    const idx = modelStore[AIProvider].findIndex(m => m.modelId === model);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: `Model ${model} not found` });
    }
    modelStore[AIProvider][idx] = { ...modelStore[AIProvider][idx], ...modelData };
    return res.json({ success: true, data: modelStore[AIProvider][idx], message: 'Model updated successfully' });
});

// DELETE /api/v1/config/deleteModel
router.delete('/deleteModel', (req: Request, res: Response) => {
    const { AIProvider, model } = req.body;
    if (!AIProvider || !model) {
        return res.status(400).json({ success: false, message: 'AIProvider and model are required' });
    }
    if (!modelStore[AIProvider]) {
        return res.status(404).json({ success: false, message: `Provider ${AIProvider} not found` });
    }
    const beforeLen = modelStore[AIProvider].length;
    modelStore[AIProvider] = modelStore[AIProvider].filter(m => m.modelId !== model);
    if (modelStore[AIProvider].length === beforeLen) {
        return res.status(404).json({ success: false, message: `Model ${model} not found` });
    }
    return res.json({ success: true, message: `Model ${model} deleted successfully` });
});

export { modelStore };
export default router;
