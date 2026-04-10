import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb } from './db/schema.js';
import { SchedulerService } from './services/scheduler.js';

// Route imports
import registryRoutes from './routes/registry.js';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import adminRoutes from './routes/admin.js';
import conversationRoutes from './routes/conversations.js';
import userRoutes from './routes/user.js';
import completionRoutes from './routes/completions.js';
import analyticsRoutes from './routes/analytics.js';
import paymentsRoutes from './routes/payments.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS — allow the Nuxt frontend (default: localhost:3001 or config CLIENT_URL)
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins in dev mode for convenience
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Timezone'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.method !== 'GET') console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

// ─── Sentinel Core Routes ────────────────────────────────────────────────────
app.use('/api/v1', registryRoutes);           // /api/v1/health, /api/v1/models, /api/v1/check

// ─── Auth ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);          // /api/v1/auth/login, /signup, /logout, /me, /google
app.use('/api/api/auth', authRoutes);         // Compatibility with frontend path construction
app.use('/api/auth', authRoutes);             // Direct better-auth compatibility

// ─── Model Config (Mozart API contract) ─────────────────────────────────────
app.use('/api/v1/config', configRoutes);      // /api/v1/config/getModels, /createModel, /updateModel, /deleteModel

// ─── Admin ───────────────────────────────────────────────────────────────────
app.use('/api/v1/admin', adminRoutes);        // /api/v1/admin/getVectorDatabase, /getAllCollections, /waitlist, /getGCRLogs

// ─── Conversations & Messages ─────────────────────────────────────────────────
app.use('/api/v1', conversationRoutes);       // /api/v1/conversation/*, /api/v1/message/*

// ─── User & Documents ────────────────────────────────────────────────────────
app.use('/api/v1', userRoutes);               // /api/v1/document/*, /api/v1/note/*, /api/v1/user/*, /api/v1/prompt/*, /api/v1/rag/*

// ─── Completions ─────────────────────────────────────────────────────────────
app.use('/api/v1', completionRoutes);         // /api/v1/completions, /api/v1/getResponse

// ─── Analytics ───────────────────────────────────────────────────────────────
app.use('/api/v1/costAnalytics', analyticsRoutes); // /api/v1/costAnalytics/*

// ─── Payments ────────────────────────────────────────────────────────────────
app.use('/api/v1/payments/stripe', paymentsRoutes); // /api/v1/payments/stripe/*

// ─── Global Health ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Sentinel + Mozart Mock API is running',
        health: '/health',
        api: '/api/v1'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'active',
        server: 'Sentinel + Mozart Mock API',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.path}`,
    });
});

async function start() {
    try {
        console.log('--- Initializing Sentinel Monitoring ---');
        await initDb();

        const scheduler = new SchedulerService();
        scheduler.start();

        app.listen(port, () => {
            console.log(`\n🛡️  Sentinel server running at http://localhost:${port}`);
            console.log(`📋  API Routes available:`);
            console.log(`    GET  /health`);
            console.log(`    GET  /api/v1/models          — List model registry`);
            console.log(`    POST /api/v1/check           — Trigger health check`);
            console.log(`    POST /api/v1/config/getModels — List Mozart models`);
            console.log(`    POST /api/v1/auth/login      — Login`);
            console.log(`    GET  /api/v1/auth/me         — Current user`);
            console.log(`    POST /api/v1/completions     — Chat completions (streaming)`);
            console.log(`\n`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
