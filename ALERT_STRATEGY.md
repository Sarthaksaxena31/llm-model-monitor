# Sentinel Alert Strategy

Sentinel differentiates between transient issues (Warning) and structural failures (Critical) to ensure engineer attention is focused where it matters most.

## 1. Critical Alerts (Immediate Notification)

*   **Auth Failure**: The API key for a provider is invalid, expired, or has insufficient credits. Immediate action is required because it affects ALL models for that provider.
*   **Deprecation Detection**: A model previously in the registry is no longer returned by the provider's `/models` list. 
    *   **Action**: Engineers must migrate to a newer model version immediately.
*   **Mozart Sync Failure**: If Sentinel cannot update the main Mozart config, it flags for manual sync.

## 2. Warning Alerts (Log & Retry)

*   **Rate Limits (429)**: Sentinel is being throttled. 
    *   **Action**: Log and use exponential backoff for the next run. Only alert if rate limits persist across multiple runs.
*   **Transient Errors (5xx)**: The provider's API is temporarily unreachable or returning HTTP 500 status.
    *   **Action**: Retry up to 2 times automatically. Log the failure.

## 3. Automation and Sync Rules

*   **Success Recovery**: When a model previously in `error` or `unknown` is successfully verified, it automatically transitions back to `active`.
*   **Automatic Sync**: Deprecated models are automatically reported to the `MozartSyncService` to be removed from the platform options.

## 4. Slack Payload Structure

| Header | Description |
| :--- | :--- |
| **Level** | CRITICAL (Red) or WARNING (Orange) |
| **Provider** | The LLM Provider (e.g., OpenAI) |
| **Model** | The specific model ID (e.g., gpt-4) |
| **Status** | auth_failure, deprecated, rate_limit, transient_error |
| **Timestamp** | ISO string of when failure was detected |
| **Actionable MSG** | Short instruction (e.g., 'Check API usage dashboard') |
