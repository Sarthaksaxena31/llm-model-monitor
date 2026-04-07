import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import {} from '../types/index.js';
let db = null;
export async function getDb() {
    if (db)
        return db;
    db = await open({
        filename: process.env.DATABASE_URL || './sentinel.db',
        driver: sqlite3.Database
    });
    return db;
}
export async function initDb() {
    const database = await getDb();
    await database.exec(`
        CREATE TABLE IF NOT EXISTS model_registry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT NOT NULL,
            modelId TEXT NOT NULL,
            status TEXT NOT NULL,
            lastVerified DATETIME DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT,
            failureCount INTEGER DEFAULT 0,
            lastError TEXT
        )
    `);
    await seedModels();
}
async function seedModels() {
    const database = await getDb();
    const initialModels = [
        { provider: 'OpenAI', modelId: 'gpt-4o', status: 'active', metadata: JSON.stringify({ version: 'latest' }) },
        { provider: 'OpenAI', modelId: 'gpt-4o-mini', status: 'active', metadata: JSON.stringify({ version: 'latest' }) },
        { provider: 'Anthropic', modelId: 'claude-3-5-sonnet', status: 'active', metadata: JSON.stringify({ version: 'latest' }) },
        { provider: 'Cohere', modelId: 'command-r', status: 'active', metadata: JSON.stringify({ version: 'latest' }) },
        { provider: 'Cohere', modelId: 'command-r-plus', status: 'active', metadata: JSON.stringify({ version: 'latest' }) },
        { provider: 'Cohere', modelId: 'embed-english-v3.0', status: 'active', metadata: JSON.stringify({ version: 'latest' }) },
    ];
    for (const model of initialModels) {
        const existing = await database.get('SELECT id FROM model_registry WHERE provider = ? AND modelId = ?', [model.provider, model.modelId]);
        if (!existing) {
            await database.run('INSERT INTO model_registry (provider, modelId, status, lastVerified, metadata) VALUES (?, ?, ?, ?, ?)', [model.provider, model.modelId, model.status, new Date().toISOString(), model.metadata]);
        }
    }
}
//# sourceMappingURL=schema.js.map