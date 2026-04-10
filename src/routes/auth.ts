import express, { type Request, type Response } from 'express';
import crypto from 'crypto';

const router = express.Router();

// ─── In-memory stores ─────────────────────────────────────────────────────────
const users: Record<string, any> = {
    'demo@mozart.la': {
        id: 'usr_demo_001',
        email: 'demo@mozart.la',
        name: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        role: 'admin',
        password: 'password123',
        emailVerified: true,
        organizationId: 'org_mozart_001',
        createdAt: new Date().toISOString(),
    }
};

// sessions keyed by token
export const sessions: Record<string, any> = {};

function generateToken(): string {
    return `mock_jwt_${crypto.randomBytes(32).toString('hex')}`;
}

function buildSession(user: any, token: string) {
    return {
        session: {
            id: `sess_${crypto.randomBytes(8).toString('hex')}`,
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ipAddress: null,
            userAgent: null,
        },
        user: {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName} ${user.lastName}`,
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ')[1] || '',
            emailVerified: user.emailVerified ?? false,
            image: user.image || null,
            role: user.role || 'user',
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            updatedAt: user.createdAt,
        }
    };
}

// ─── better-auth compatible endpoints ────────────────────────────────────────

// GET /get-session  — called by better-auth client on every page load
router.get('/get-session', (req: Request, res: Response) => {
    const cookieToken = req.cookies?.['better-auth.session_token'] ||
        req.cookies?.['better-auth.session-token'] ||
        req.cookies?.session_token ||
        req.cookies?.mozart;
    const headerToken = req.headers.authorization?.replace('Bearer ', '');
    const token = cookieToken || headerToken;

    if (token) console.log(`[Auth] get-session for token: ${token.substring(0, 15)}...`);

    const user = token ? sessions[token] : null;
    if (!user) {
        return res.json(null);
    }
    return res.json(buildSession(user, token!));
});

// POST /sign-in/email
router.post('/sign-in/email', (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(`[Auth] Sign-in attempt: ${email}`);
    const user = users[email];
    if (!user || user.password !== password) {
        console.log(`[Auth] Sign-in failed: Invalid credentials for ${email}`);
        return res.status(401).json({
            code: 'INVALID_EMAIL_OR_PASSWORD',
            message: 'Invalid email or password',
            status: 401,
        });
    }
    const token = generateToken();
    sessions[token] = user;
    console.log(`[Auth] Sign-in success: ${email}, token: ${token}`);
    res.cookie('better-auth.session_token', token, { httpOnly: false, maxAge: 86400000, sameSite: 'lax', path: '/' });
    res.cookie('mozart', token, { httpOnly: false, maxAge: 86400000, path: '/' });
    return res.json(buildSession(user, token));
});

// POST /sign-up/email
router.post('/sign-up/email', (req: Request, res: Response) => {
    const { email, password, name, firstName, lastName, country, planName, quantity } = req.body;
    console.log(`[Auth] Sign-up attempt: ${email}`);
    if (users[email]) {
        console.log(`[Auth] Sign-up failed: User already exists ${email}`);
        return res.status(422).json({
            code: 'USER_ALREADY_EXISTS',
            message: 'User with this email already exists',
            status: 422,
        });
    }
    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || email;
    const newUser = {
        id: `usr_${crypto.randomBytes(8).toString('hex')}`,
        email,
        name: fullName,
        firstName: firstName || name?.split(' ')[0] || '',
        lastName: lastName || name?.split(' ')[1] || '',
        password,
        role: 'user',
        emailVerified: false,
        organizationId: `org_${crypto.randomBytes(8).toString('hex')}`,
        country: country || null,
        planName: planName || 'starter',
        quantity: quantity || 1,
        createdAt: new Date().toISOString(),
    };
    users[email] = newUser;
    const token = generateToken();
    sessions[token] = newUser;
    res.cookie('better-auth.session_token', token, { httpOnly: false, maxAge: 86400000, sameSite: 'lax' });
    res.cookie('mozart', token, { httpOnly: false, maxAge: 86400000 });
    return res.json(buildSession(newUser, token));
});

// POST /sign-out
router.post('/sign-out', (req: Request, res: Response) => {
    const token = req.cookies?.['better-auth.session_token'] || req.cookies?.mozart;
    if (token) delete sessions[token];
    res.clearCookie('better-auth.session_token');
    res.clearCookie('mozart');
    return res.json({ success: true });
});

// POST /forget-password  (request reset)
router.post('/forget-password', (req: Request, res: Response) => {
    return res.json({ success: true, message: 'If an account exists, a reset email has been sent.' });
});

// POST /reset-password
router.post('/reset-password', (req: Request, res: Response) => {
    const { token: resetToken, newPassword } = req.body;
    return res.json({ success: true, message: 'Password has been reset successfully.' });
});

// POST /verify-email
router.post('/verify-email', (req: Request, res: Response) => {
    return res.json({ success: true, message: 'Email verified successfully.' });
});

// POST /send-verification-email
router.post('/send-verification-email', (req: Request, res: Response) => {
    return res.json({ success: true, message: 'Verification email sent.' });
});

// POST /change-password
router.post('/change-password', (req: Request, res: Response) => {
    const token = req.cookies?.['better-auth.session_token'] || req.cookies?.mozart;
    const user = token ? sessions[token] : null;
    if (!user) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated', status: 401 });
    const { currentPassword, newPassword } = req.body;
    if (users[user.email]?.password !== currentPassword) {
        return res.status(401).json({ code: 'INVALID_PASSWORD', message: 'Current password is incorrect', status: 401 });
    }
    users[user.email].password = newPassword;
    return res.json({ success: true });
});

// POST /update-user
router.post('/update-user', (req: Request, res: Response) => {
    const token = req.cookies?.['better-auth.session_token'] || req.cookies?.mozart;
    const user = token ? sessions[token] : null;
    if (!user) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated', status: 401 });
    const { name, image } = req.body;
    if (name) {
        users[user.email].name = name;
        sessions[token!].name = name;
    }
    return res.json(buildSession(sessions[token!], token!));
});

// POST /change-email
router.post('/change-email', (req: Request, res: Response) => {
    return res.json({ success: true, message: 'Email change request sent.' });
});

// GET /callback/google (Social OAuth)
router.get('/callback/google', (req: Request, res: Response) => {
    const token = generateToken();
    const mockUser = {
        id: 'usr_google_001', email: 'google@mozart.la',
        name: 'Google User', role: 'user', emailVerified: true,
        organizationId: 'org_mozart_001', createdAt: new Date().toISOString(),
    };
    sessions[token] = mockUser;
    res.cookie('better-auth.session_token', token, { httpOnly: false, maxAge: 86400000, sameSite: 'lax' });
    res.cookie('mozart', token, { httpOnly: false, maxAge: 86400000 });
    return res.redirect('/');
});

// POST /sign-in/social  (initiate social auth)
router.post('/sign-in/social', (req: Request, res: Response) => {
    return res.json({ url: 'https://accounts.google.com/o/oauth2/auth?mock=true', redirect: true });
});

// ─── Admin plugin endpoints (org/user management) ─────────────────────────────

// GET /admin/list-users
router.get('/admin/list-users', (req: Request, res: Response) => {
    const userList = Object.values(users).map(u => ({
        id: u.id, email: u.email, name: u.name, role: u.role,
        emailVerified: u.emailVerified, createdAt: u.createdAt,
    }));
    return res.json({ users: userList, total: userList.length });
});

// POST /admin/ban-user
router.post('/admin/ban-user', (req: Request, res: Response) => {
    return res.json({ success: true });
});

// POST /admin/impersonate-user
router.post('/admin/impersonate-user', (req: Request, res: Response) => {
    return res.json({ success: true });
});

// ─── Organization plugin endpoints ────────────────────────────────────────────

// POST /organization/create
router.post('/organization/create', (req: Request, res: Response) => {
    const { name, slug } = req.body;
    const org = {
        id: `org_${crypto.randomBytes(8).toString('hex')}`,
        name, slug: slug || name?.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
    };
    return res.json(org);
});

// GET /organization/list
router.get('/organization/list', (req: Request, res: Response) => {
    return res.json({ organizations: [] });
});

// GET /organization/get-active-organization
router.get('/organization/get-active-organization', (req: Request, res: Response) => {
    return res.json(null);
});

// POST /organization/set-active
router.post('/organization/set-active', (req: Request, res: Response) => {
    return res.json({ success: true });
});

// ─── Legacy endpoints (v1 API compatibility) ─────────────────────────────────

// POST /login  (legacy)
router.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken();
    sessions[token] = user;
    res.cookie('better-auth.session_token', token, { httpOnly: false, maxAge: 86400000, sameSite: 'lax' });
    res.cookie('mozart', token, { httpOnly: false, maxAge: 86400000 });
    return res.json({ success: true, data: { token, user: buildSession(user, token).user } });
});

// POST /signup (legacy)
router.post('/signup', (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    if (users[email]) {
        return res.status(409).json({ success: false, message: 'User already exists' });
    }
    const newUser = {
        id: `usr_${crypto.randomBytes(8).toString('hex')}`,
        email, name, password, role: 'user', emailVerified: false,
        organizationId: `org_${crypto.randomBytes(8).toString('hex')}`,
        createdAt: new Date().toISOString(),
    };
    users[email] = newUser;
    const token = generateToken();
    sessions[token] = newUser;
    res.cookie('better-auth.session_token', token, { httpOnly: false, maxAge: 86400000, sameSite: 'lax' });
    res.cookie('mozart', token, { httpOnly: false, maxAge: 86400000 });
    return res.json({ success: true, data: { token, user: buildSession(newUser, token).user } });
});

// POST /logout (legacy)
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('better-auth.session_token');
    res.clearCookie('mozart');
    return res.json({ success: true, message: 'Logged out' });
});

// GET /me (legacy)
router.get('/me', (req: Request, res: Response) => {
    const cookieToken = req.cookies?.['better-auth.session_token'] || req.cookies?.mozart;
    const headerToken = req.headers.authorization?.replace('Bearer ', '');
    const token = cookieToken || headerToken;
    const user = token ? sessions[token] : null;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    return res.json({ success: true, data: buildSession(user, token!).user });
});

// GET /google (legacy)
router.get('/google', (req: Request, res: Response) => {
    return res.json({ success: true, data: { url: 'https://accounts.google.com/o/oauth2/auth?mock=true' } });
});

// POST /oauthCallback (legacy)
router.post('/oauthCallback', (req: Request, res: Response) => {
    const token = generateToken();
    const mockUser = {
        id: 'usr_google_001', email: 'google@mozart.la',
        name: 'Google User', role: 'user', emailVerified: true,
        organizationId: 'org_mozart_001', createdAt: new Date().toISOString(),
    };
    sessions[token] = mockUser;
    res.cookie('better-auth.session_token', token, { httpOnly: false, maxAge: 86400000, sameSite: 'lax' });
    res.cookie('mozart', token, { httpOnly: false, maxAge: 86400000 });
    return res.json({ success: true, data: { token, user: buildSession(mockUser, token).user } });
});

export default router;
