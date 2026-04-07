# Sentinel: LLM Model Monitoring & Alerting

Sentinel is a production-ready microservice built for **Mozart** to proactively detect, flag, and alert on deprecated or broken LLM models (OpenAI, Anthropic, Cohere).

##  Key Features

*   ** Registry Monitoring**: Tracks 6+ production LLM models across 3 major providers.
*   ** Automated Health Checks**: Cron-driven (6hr) parallel checks for model existence and API key validity.
*   ** Multi-Channel Alerting**: Slack webhook integration for `CRITICAL` (deprecation, auth fail) and `WARNING` (rate limit) states.
*   ** Mozart Sync System**: Built-in logic to synchronise model availability with the Mozart platform API.
*   ** Robust Error Handling**: Automatic retry policy (2x) with exponential backoff for transient failures.

##  Repository Structure

*   **/src/adapters**: Provider-specific logic (OpenAI, Anthropic, Cohere).
*   **/src/services**: Core business logic (Checker, Alerter, Scheduler, MozartSync).
*   **/src/db**: Database schema and Registry configuration.
*   **/src/routes**: Node.js REST API endpoints.
*   **ARCHITECTURE.md**: System design and component diagrams.
*   **ALERT_STRATEGY.md**: Rules for alerting levels and engineering response.
*   **DEPLOYMENT.md**: Environment setup and production deployment instructions.

##  Getting Started

### 1. Prerequisites
*   Node.js v18+
*   NPM

### 2. Installation
```bash
npm install
```

### 3. Setup Environment
Rename `.env.example` to `.env` (or create one using the template in `DEPLOYMENT.md`) and add your API keys.

```bash
# Required
SLACK_WEBHOOK_URL=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
COHERE_API_KEY=...
```

### 4. Run the Service
```bash
# Start in Dev mode (with hot-reload)
npm run dev
```

### 5. Manual Health Check
You can trigger a manual check anytime via:
```bash
curl -X POST http://localhost:3000/api/v1/check
```

##  Demo: Monitoring Failure (Demo Script)

Sentinel includes a simulation script to prove it correctly detects a Cohere deprecation (404) and fires an alert.

```bash
npm run demo:failure
```

---
**Author**: Sarthak Saxena (Senior Full Stack Developer Case Study for Mozart)
**Repository**: [llm-model-monitor](https://github.com/Sarthaksaxena31/llm-model-monitor)
