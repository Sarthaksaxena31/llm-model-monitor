# Sentinel Architecture

Sentinel is a production-ready microservice designed to monitor LLM model health across multiple providers (OpenAI, Anthropic, Cohere).

## Component Overview

### 1. Model Registry (SQLite)
*   **Purpose**: Stores the inventory of models being monitored.
*   **Schema**: Tracks ID, Provider, ModelId, Status (active/deprecated/error), Failure Counts, and Metadata.
*   **Seeding**: Automatically seeds with core production models on startup.

### 2. Provider Adapters
*   **Purpose**: Abstract provider-specific API logic (REST endpoints, auth headers, error structures).
*   **Factory Pattern**: Dynamically instantiates the correct adapter based on the model provider.
*   **Interface Driven**: All adapters follow a strict interface ensuring the core checker logic is provider-agnostic.

### 3. Checker Service
*   **Core Logic**: Handles the monitoring workflow:
    1.  Verify API Key validity (Auth check).
    2.  Fetch current model list from the provider.
    3.  Compare fetched list against the Registry.
    4.  Flag missing models as `deprecated`.
    5.  Execute retry logic for transient network or 5xx errors.

### 4. Alerter Service (Slack)
*   **Purpose**: Triggers real-time notifications to engineering teams.
*   **Logic**: Differentiates between `CRITICAL` (immediate action) and `WARNING` (transient issues) states.

### 5. Mozart Sync Service (Bonus)
*   **Purpose**: Synchronises Sentinel's findings with the main Mozart platform.
*   **Integration**: Automatically triggers deletes or updates via the Mozart Config API when model health changes.

## Data Flow Diagram

```mermaid
graph TD
    A[Scheduler / API Trigger] --> B[Checker Service]
    B --> C[Provider Factory]
    C --> D[OpenAI Adapter]
    C --> E[Anthropic Adapter]
    C --> F[Cohere Adapter]
    B --> G[Model Registry DB]
    B --> H[Alerter Service]
    H --> I[Slack Webhook]
    B --> J[Mozart Sync Service]
    J --> K[Mozart API (Mock)]
```
