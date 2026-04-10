import express, { type Request, type Response } from 'express';
import crypto from 'crypto';

const router = express.Router();

// In-memory stores for user-related data
const documents: Record<string, any> = {};
const notes: Record<string, any[]> = {};
const prompts: any[] = [
    { id: 'p_001', key: 'default_system', title: 'Default System', content: 'You are a helpful AI assistant.', userId: 'usr_demo_001', createdAt: new Date().toISOString() }
];
const apiKeys: Record<string, any[]> = {};
const userSettings: Record<string, any> = {
    'usr_demo_001': { theme: 'light', defaultModel: 'gpt-4o', language: 'en', notifications: true }
};
const userModels: Record<string, string[]> = {
    'usr_demo_001': ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'command-r']
};
const integrations: Record<string, any[]> = {};

// POST /api/v1/document/upload
router.post('/document/upload', (req: Request, res: Response) => {
    const { organizationId } = req.body;
    const file = (req as any).file;
    const docId = `doc_${crypto.randomBytes(8).toString('hex')}`;
    const newDoc = {
        id: docId,
        name: file?.originalname || 'uploaded_file.pdf',
        organizationId,
        status: 'processing',
        size: file?.size || 0,
        type: file?.mimetype || 'application/pdf',
        createdAt: new Date().toISOString(),
    };
    documents[docId] = newDoc;
    return res.json({ success: true, data: newDoc });
});

// GET /api/v1/document/get
router.get('/document/get', (req: Request, res: Response) => {
    const { organizationId } = req.query;
    const docs = Object.values(documents).filter(d => d.organizationId === organizationId);
    return res.json({ success: true, data: docs });
});

// POST /api/v1/document/getParsedData
router.post('/document/getParsedData', (req: Request, res: Response) => {
    return res.json({ success: true, data: { content: 'Mock parsed document content', chunks: [] } });
});

// POST /api/v1/document/update
router.post('/document/update', (req: Request, res: Response) => {
    const { id, organizationId, ...updates } = req.body;
    if (documents[id]) {
        documents[id] = { ...documents[id], ...updates };
        return res.json({ success: true, data: documents[id] });
    }
    return res.status(404).json({ success: false, message: 'Document not found' });
});

// POST /api/v1/document/delete
router.post('/document/delete', (req: Request, res: Response) => {
    const { documentId } = req.body;
    delete documents[documentId];
    return res.json({ success: true });
});

// POST /api/v1/document/updateStatus/:documentId
router.post('/document/updateStatus/:documentId', (req: Request, res: Response) => {
    const { documentId } = req.params;
    const { status } = req.body;
    if (documents[documentId]) documents[documentId].status = status;
    return res.json({ success: true });
});

// POST /api/v1/document/getSourceFileParsedData
router.post('/document/getSourceFileParsedData', (req: Request, res: Response) => {
    return res.json({ success: true, data: { content: 'Mock source file content', metadata: {} } });
});

// GET /api/v1/note/get
router.get('/note/get', (req: Request, res: Response) => {
    const { organizationId } = req.query;
    const orgNotes = (notes[organizationId as string] || []);
    return res.json({ success: true, data: orgNotes });
});

// POST /api/v1/note/create
router.post('/note/create', (req: Request, res: Response) => {
    const { organizationId, ...noteData } = req.body;
    const newNote = {
        id: `note_${crypto.randomBytes(4).toString('hex')}`,
        ...noteData,
        organizationId,
        createdAt: new Date().toISOString(),
    };
    if (!notes[organizationId]) notes[organizationId] = [];
    notes[organizationId].push(newNote);
    return res.json({ success: true, data: newNote });
});

// POST /api/v1/note/update
router.post('/note/update', (req: Request, res: Response) => {
    const { organizationId, id, ...updates } = req.body;
    const orgNotes = notes[organizationId] || [];
    const note = orgNotes.find((n: any) => n.id === id);
    if (note) Object.assign(note, updates);
    return res.json({ success: true, data: note });
});

// POST /api/v1/note/delete
router.post('/note/delete', (req: Request, res: Response) => {
    const { noteId, organizationId } = req.body;
    if (notes[organizationId]) {
        notes[organizationId] = notes[organizationId].filter((n: any) => n.id !== noteId);
    }
    return res.json({ success: true });
});

// GET /api/v1/rag/token
router.get('/rag/token', (req: Request, res: Response) => {
    return res.json({ success: true, data: { token: `rag_token_${crypto.randomBytes(16).toString('hex')}` } });
});

// GET /api/v1/user/settings
router.get('/user/settings', (req: Request, res: Response) => {
    return res.json({ success: true, data: userSettings['usr_demo_001'] });
});

// PUT /api/v1/user/settings
router.put('/user/settings', (req: Request, res: Response) => {
    Object.assign(userSettings['usr_demo_001'], req.body);
    return res.json({ success: true, data: userSettings['usr_demo_001'] });
});

// POST /api/v1/prompt/create
router.post('/prompt/create', (req: Request, res: Response) => {
    const newPrompt = { id: `p_${crypto.randomBytes(4).toString('hex')}`, ...req.body, createdAt: new Date().toISOString() };
    prompts.push(newPrompt);
    return res.json({ success: true, data: newPrompt });
});

// POST /api/v1/prompt/update
router.post('/prompt/update', (req: Request, res: Response) => {
    const { id, ...updates } = req.body;
    const prompt = prompts.find(p => p.id === id);
    if (prompt) Object.assign(prompt, updates);
    return res.json({ success: true, data: prompt });
});

// GET /api/v1/prompt/get
router.get('/prompt/get', (req: Request, res: Response) => {
    return res.json({ success: true, data: prompts });
});

// POST /api/v1/prompt/getByKey
router.post('/prompt/getByKey', (req: Request, res: Response) => {
    const { key } = req.body;
    const prompt = prompts.find(p => p.key === key);
    return res.json({ success: true, data: prompt || null });
});

// POST /api/v1/user/addAPIKey
router.post('/user/addAPIKey', (req: Request, res: Response) => {
    const { service, apiKey, ...rest } = req.body;
    if (!apiKeys['usr_demo_001']) apiKeys['usr_demo_001'] = [];
    apiKeys['usr_demo_001'] = apiKeys['usr_demo_001'].filter((k: any) => k.service !== service);
    apiKeys['usr_demo_001'].push({ service, apiKey: '***masked***', ...rest, addedAt: new Date().toISOString() });
    return res.json({ success: true, message: 'API key added' });
});

// POST /api/v1/user/apiKeys/delete
router.post('/user/apiKeys/delete', (req: Request, res: Response) => {
    const { service } = req.body;
    if (apiKeys['usr_demo_001']) {
        apiKeys['usr_demo_001'] = apiKeys['usr_demo_001'].filter((k: any) => k.service !== service);
    }
    return res.json({ success: true });
});

// GET /api/v1/user/apiKeys
router.get('/user/apiKeys', (req: Request, res: Response) => {
    return res.json({ success: true, data: apiKeys['usr_demo_001'] || [] });
});

// GET /api/v1/user/integration-services
router.get('/user/integration-services', (req: Request, res: Response) => {
    return res.json({
        success: true,
        data: [
            { id: 'google-drive', name: 'Google Drive', connected: false, icon: 'google-drive' },
            { id: 'notion', name: 'Notion', connected: false, icon: 'notion' },
            { id: 'slack', name: 'Slack', connected: false, icon: 'slack' },
        ]
    });
});

// POST /api/v1/user/apiKeys/validate-save
router.post('/user/apiKeys/validate-save', (req: Request, res: Response) => {
    return res.json({ success: true, message: 'Integration validated and saved' });
});

// GET /api/v1/user/googleDrive/files
router.get('/user/googleDrive/files', (req: Request, res: Response) => {
    return res.json({
        success: true, data: {
            files: [
                { id: 'gdrive_001', name: 'Sample Document.pdf', mimeType: 'application/pdf', size: 102400 },
                { id: 'gdrive_002', name: 'Meeting Notes.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 51200 },
            ],
            nextPageToken: null
        }
    });
});

// GET /api/v1/file/getIntegrationFile
router.get('/file/getIntegrationFile', (req: Request, res: Response) => {
    return res.json({ success: true, data: { content: 'Mock integration file content', metadata: {} } });
});

// POST /api/v1/integrations/addFiles
router.post('/integrations/addFiles', (req: Request, res: Response) => {
    const { source, files } = req.body;
    return res.json({ success: true, data: { added: files.length, source } });
});

// POST /api/v1/integrations/deleteFile
router.post('/integrations/deleteFile', (req: Request, res: Response) => {
    return res.json({ success: true });
});

// GET /api/v1/user/models
router.get('/user/models', (req: Request, res: Response) => {
    return res.json({ success: true, data: userModels['usr_demo_001'] || [] });
});

// POST /api/v1/user/models
router.post('/user/models', (req: Request, res: Response) => {
    const { modelIds } = req.body;
    if (!userModels['usr_demo_001']) userModels['usr_demo_001'] = [];
    modelIds.forEach((id: string) => {
        if (!userModels['usr_demo_001'].includes(id)) {
            userModels['usr_demo_001'].push(id);
        }
    });
    return res.json({ success: true, data: userModels['usr_demo_001'] });
});

// PUT /api/v1/user/models (also handles deleteUserModel)
router.put('/user/models', (req: Request, res: Response) => {
    const { modelIds } = req.body;
    if (!userModels['usr_demo_001']) userModels['usr_demo_001'] = [];
    userModels['usr_demo_001'] = userModels['usr_demo_001'].filter((id: string) => !modelIds.includes(id));
    return res.json({ success: true, data: userModels['usr_demo_001'] });
});

export default router;
