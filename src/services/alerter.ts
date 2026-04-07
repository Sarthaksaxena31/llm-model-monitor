import axios from 'axios';
import { type AlertPayload } from '../types/index.js';

export class AlerterService {
    private slackUrl: string;

    constructor() {
        this.slackUrl = process.env.SLACK_WEBHOOK_URL || '';
    }

    async sendAlert(payload: AlertPayload) {
        console.log(`[ALERT][${payload.level}] ${payload.provider} ${payload.modelId || ''}: ${payload.message}`);

        if (!this.slackUrl || this.slackUrl === 'your_slack_webhook_here') {
            console.warn('Slack Webhook URL not configured. Skipping Slack notification.');
            return;
        }

        try {
            await axios.post(this.slackUrl, {
                attachments: [{
                    color: payload.level === 'CRITICAL' ? '#f44336' : '#ff9800',
                    title: `Sentinel Alert: ${payload.level}`,
                    fields: [
                        { title: 'Provider', value: payload.provider, short: true },
                        { title: 'Status', value: payload.status, short: true },
                        { title: 'Timestamp', value: payload.timestamp, short: true }
                    ],
                    text: payload.message
                }]
            });
        } catch (error) {
            console.error('Failed to send Slack alert:', error);
        }
    }
}
