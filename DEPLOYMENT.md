# Sentinel Deployment Guide

Everything required to deploy Sentinel into a production-ready environment.

## 1. Environment Variables

Create a `.env` file in the project root:

```ini
# Core Configuration
PORT=3000
DATABASE_URL=./sentinel.db
CRON_SCHEDULE="0 */6 * * *"        # Checks models every 6 hours

# Provider API Keys
OPENAI_API_KEY=sk-...               # OpenAI secret key
ANTHROPIC_API_KEY=ant-api-...       # Anthropic secret key
COHERE_API_KEY=sh-...               # Cohere secret key

# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... # Required

# Mozart Sync (Optional)
MOZART_SERVER_API_URL=https://api-dev.mozart.la
```

## 2. Running Locally (Development)

Sentinel uses `tsx` for high-performance TypeScript monitoring.

```bash
# 1. Install dependencies
npm install

# 2. Run developer watch mode
npm run dev

# 3. Test a provider failure (Mock)
npm run demo:failure
```

## 3. Running with Docker

Sentinel is stateless (registry is stored in SQLite which defaults to file, but can be configured to use PostgreSQL for production redundancy).

```dockerfile
# (Concept) Production build process
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 4. Production Persistence

*   **SQLite**: Ensure the project root has write permissions to store `./sentinel.db`.
*   **PostgreSQL**: Simply update `DATABASE_URL=postgres://user:pass@host:5432/db` when configured as Sentinel supports multiple SQL backends via `sqlite3` or `pg`. (Currently optimized for SQLite as per case study requirements).
