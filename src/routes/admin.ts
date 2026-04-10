import express, { type Request, type Response } from 'express';
import crypto from 'crypto';

const router = express.Router();

// In-memory data stores
let vectorDatabases: any[] = [
    { id: 'vdb_001', name: 'Primary Vector DB', type: 'qdrant', url: 'http://localhost:6333', status: 'active', createdAt: new Date().toISOString() }
];

let collections: any[] = [
    { id: 'col_001', name: 'Default Collection', vectorDbId: 'vdb_001', status: 'active', documentCount: 42, createdAt: new Date().toISOString() }
];

const waitlist: any[] = [
    { id: 'wl_001', email: 'user1@example.com', name: 'Alice Smith', isOnboarded: false, createdAt: new Date().toISOString() },
    { id: 'wl_002', email: 'user2@example.com', name: 'Bob Jones', isOnboarded: true, createdAt: new Date().toISOString() },
];

// GET /api/v1/admin/getVectorDatabase
router.get('/getVectorDatabase', (req: Request, res: Response) => {
    return res.json({ success: true, data: vectorDatabases });
});

// POST /api/v1/admin/updateVectorDatabase
router.post('/updateVectorDatabase', (req: Request, res: Response) => {
    const { id, ...updates } = req.body;
    const idx = vectorDatabases.findIndex(db => db.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Vector database not found' });
    vectorDatabases[idx] = { ...vectorDatabases[idx], ...updates };
    return res.json({ success: true, data: vectorDatabases[idx] });
});

// POST /api/v1/admin/createVectorDatabase
router.post('/createVectorDatabase', (req: Request, res: Response) => {
    const newDb = {
        id: `vdb_${crypto.randomBytes(4).toString('hex')}`,
        ...req.body,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    vectorDatabases.push(newDb);
    return res.json({ success: true, data: newDb });
});

// GET /api/v1/admin/getAllCollections
router.get('/getAllCollections', (req: Request, res: Response) => {
    return res.json({ success: true, data: collections });
});

// POST /api/v1/admin/grantCollectionAccess
router.post('/grantCollectionAccess', (req: Request, res: Response) => {
    const { email, collectionId, type } = req.body;
    return res.json({ success: true, message: `Access granted for ${email} to collection ${collectionId} as ${type}` });
});

// POST /api/v1/admin/waitlist
router.post('/waitlist', (req: Request, res: Response) => {
    const { email, name } = req.body;
    const existing = waitlist.find(u => u.email === email);
    if (existing) return res.status(409).json({ success: false, message: 'User already on waitlist' });
    const newEntry = {
        id: `wl_${crypto.randomBytes(4).toString('hex')}`,
        email, name, isOnboarded: false, createdAt: new Date().toISOString()
    };
    waitlist.push(newEntry);
    return res.json({ success: true, data: newEntry });
});

// GET /api/v1/admin/waitlist
router.get('/waitlist', (req: Request, res: Response) => {
    return res.json({ success: true, data: waitlist });
});

// PUT /api/v1/admin/waitlist
router.put('/waitlist', (req: Request, res: Response) => {
    const { id, isOnboarded } = req.body;
    const entry = waitlist.find(u => u.id === id);
    if (!entry) return res.status(404).json({ success: false, message: 'User not found' });
    entry.isOnboarded = isOnboarded;
    return res.json({ success: true, data: entry });
});

// DELETE /api/v1/admin/waitlist/:email
router.delete('/waitlist/:email', (req: Request, res: Response) => {
    const { email } = req.params;
    const idx = waitlist.findIndex(u => u.email === email);
    if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
    waitlist.splice(idx, 1);
    return res.json({ success: true, message: `User ${email} removed from waitlist` });
});

// GET /api/v1/admin/getGCRLogs
router.get('/getGCRLogs', (req: Request, res: Response) => {
    const { pageSize = 10, pageToken } = req.query;
    const mockLogs = Array.from({ length: Number(pageSize) }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        severity: 'INFO',
        message: `Mock GCR log entry ${i + 1}`,
        logName: 'projects/mozart-dev/logs/run.googleapis.com',
    }));
    return res.json({ success: true, data: { logs: mockLogs, nextPageToken: null } });
});

export default router;
