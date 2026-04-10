import express, { type Request, type Response } from 'express';
import crypto from 'crypto';

const router = express.Router();

// In-memory stores
const conversations: Record<string, any> = {
    'conv_001': {
        id: 'conv_001',
        title: 'Welcome conversation',
        type: 'interaction',
        userId: 'usr_demo_001',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false,
        projectId: null,
        messageCount: 2,
    }
};

const messages: Record<string, any[]> = {
    'conv_001': [
        { id: 'msg_001', conversationId: 'conv_001', role: 'user', content: 'Hello!', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'msg_002', conversationId: 'conv_001', role: 'assistant', content: 'Hello! How can I help you today?', createdAt: new Date(Date.now() - 3590000).toISOString() },
    ]
};

const projects: Record<string, any> = {};
const collaborators: Record<string, any[]> = {};

// POST /api/v1/message/getById
router.post('/message/getById', (req: Request, res: Response) => {
    const { conversationId } = req.body;
    const msgs = messages[conversationId] || [];
    return res.json({ success: true, data: msgs });
});

// GET /api/v1/conversation/get
router.get('/conversation/get', (req: Request, res: Response) => {
    const { type, archived = '0', limit = '20' } = req.query;
    let convList = Object.values(conversations);
    if (type) convList = convList.filter(c => c.type === type);
    if (archived === '0') convList = convList.filter(c => !c.archived);
    else if (archived === '1') convList = convList.filter(c => c.archived);
    return res.json({
        success: true,
        data: {
            compose: convList.filter(c => c.type === 'compose'),
            interaction: convList.filter(c => c.type !== 'compose'),
            sharedCompose: [],
            sharedInteraction: [],
        }
    });
});

// GET /api/v1/conversation/deleteAll
router.get('/conversation/deleteAll', (req: Request, res: Response) => {
    Object.keys(conversations).forEach(k => delete conversations[k]);
    return res.json({ success: true, message: 'All conversations deleted' });
});

// POST /api/v1/conversation/delete
router.post('/conversation/delete', (req: Request, res: Response) => {
    const conversationId = req.body?.data?.conversationId || req.body?.conversationId;
    if (conversations[conversationId]) {
        delete conversations[conversationId];
        delete messages[conversationId];
    }
    return res.json({ success: true });
});

// POST /api/v1/conversation/rename
router.post('/conversation/rename', (req: Request, res: Response) => {
    const { conversationId, title } = req.body?.data || req.body;
    if (conversations[conversationId]) {
        conversations[conversationId].title = title;
        conversations[conversationId].updatedAt = new Date().toISOString();
    }
    return res.json({ success: true });
});

// POST /api/v1/conversation/share
router.post('/conversation/share', (req: Request, res: Response) => {
    const { conversationId, email, role, isCopyLink } = req.body;
    if (!collaborators[conversationId]) collaborators[conversationId] = [];
    collaborators[conversationId].push({ email, role, addedAt: new Date().toISOString() });
    return res.json({ success: true, data: { shareLink: isCopyLink ? `https://mozart.la/shared/${conversationId}` : null } });
});

// POST /api/v1/conversation/deleteSharedConversation
router.post('/conversation/deleteSharedConversation', (req: Request, res: Response) => {
    const { conversationId, collaboratorId } = req.body;
    if (collaborators[conversationId]) {
        collaborators[conversationId] = collaborators[conversationId].filter(c => c.id !== collaboratorId);
    }
    return res.json({ success: true });
});

// POST /api/v1/conversation/getCollaborators
router.post('/conversation/getCollaborators', (req: Request, res: Response) => {
    const { conversationId } = req.body;
    return res.json({ success: true, data: collaborators[conversationId] || [] });
});

// POST /api/v1/conversation/validateShareInvite
router.post('/conversation/validateShareInvite', (req: Request, res: Response) => {
    const { inviteId } = req.body;
    return res.json({ success: true, data: { valid: true, conversationId: 'conv_001', role: 'viewer' } });
});

// POST /api/v1/conversation/archive
router.post('/conversation/archive', (req: Request, res: Response) => {
    const { conversationId } = req.body;
    if (conversations[conversationId]) conversations[conversationId].archived = true;
    return res.json({ success: true });
});

// POST /api/v1/conversation/restore
router.post('/conversation/restore', (req: Request, res: Response) => {
    const { conversationId } = req.body;
    if (conversations[conversationId]) conversations[conversationId].archived = false;
    return res.json({ success: true });
});

// POST /api/v1/conversation/project — create project
router.post('/conversation/project', (req: Request, res: Response) => {
    const { name, description, scope, organizationId } = req.body;
    const id = `proj_${crypto.randomBytes(4).toString('hex')}`;
    const project = { id, name, description, scope, organizationId, createdAt: new Date().toISOString() };
    projects[id] = project;
    return res.json({ success: true, data: project });
});

// DELETE /api/v1/conversation/project
router.delete('/conversation/project', (req: Request, res: Response) => {
    const { projectId } = req.query;
    if (projectId && projects[projectId as string]) {
        delete projects[projectId as string];
        return res.json({ success: true });
    }
    return res.status(404).json({ success: false, message: 'Project not found' });
});

// GET /api/v1/conversation/project
router.get('/conversation/project', (req: Request, res: Response) => {
    const { scope } = req.query;
    const projectList = Object.values(projects).filter(p => !scope || p.scope === scope);
    return res.json({ success: true, data: projectList });
});

// PUT /api/v1/conversation/project
router.put('/conversation/project', (req: Request, res: Response) => {
    const { projectId, name, description, scope, organizationId } = req.body;
    if (!projects[projectId]) return res.status(404).json({ success: false, message: 'Project not found' });
    projects[projectId] = { ...projects[projectId], name, description, scope, organizationId };
    return res.json({ success: true, data: projects[projectId] });
});

// POST /api/v1/conversation/move
router.post('/conversation/move', (req: Request, res: Response) => {
    const { conversationId, projectId } = req.body;
    if (conversations[conversationId]) {
        conversations[conversationId].projectId = projectId;
    }
    return res.json({ success: true });
});

// GET /api/v1/conversation/getProjectConversations
router.get('/conversation/getProjectConversations', (req: Request, res: Response) => {
    const { projectId } = req.query;
    const projectConvs = Object.values(conversations).filter(c => c.projectId === projectId);
    return res.json({ success: true, data: projectConvs });
});

export { conversations, messages };
export default router;
