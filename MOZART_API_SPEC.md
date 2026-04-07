# Mozart Model Configuration API Contract

This document specifies the contract Sentinel uses to sync model health state back to the Mozart platform. (MOCKED for Case Study).

## API Endpoints

### 1. Get All Models
Retrieves current models grouped by provider.
*   **Method**: `POST`
*   **Endpoint**: `/api/v1/config/getModels`
*   **Response**: `200 OK`
```json
{
  "openai": [ { "id": "gpt-4o", "name": "GPT-4o" } ],
  "anthropic": [ { "id": "claude-3-5-sonnet", "name": "Claude 3.5 Sonnet" } ]
}
```

### 2. Delete Model
Removes a deprecated or broken model from the platform.
*   **Method**: `DELETE`
*   **Endpoint**: `/api/v1/config/deleteModel`
*   **Request Body**:
```json
{
  "AIProvider": "cohere",
  "model": "command-r"
}
```

### 3. Create Model
Adds a new model or re-adds a previously removed one.
*   **Method**: `POST`
*   **Endpoint**: `/api/v1/config/createModel`
*   **Request Body**:
```json
{
  "AIProvider": "openai",
  "modelData": {
    "modelId": "gpt-4o",
    "name": "GPT-4o",
    "provider": "openai",
    "description": "High performance model",
    "contextWindow": 128000,
    "maxOutputTokens": 4096,
    "isPremium": true,
    "isTemperatureSupported": true,
    "isThinkingSupported": false,
    "capabilities": ["text", "code"]
  }
}
```

## Internal Sync Module (`MozartSyncService`)

Sentinel implements this contract via the `MozartSyncService` class to ensure any model marked as `deprecated` during automated checks is proactively queued for removal from the user-facing platform.
