import { initDb } from './db/schema.js';
import { CheckerService } from './services/checker.js';
import dotenv from 'dotenv';

dotenv.config();

async function runLiveCheck() {
    console.log('\n=================================================');
    console.log('   SENTINEL — Live End-to-End Verification');
    console.log('=================================================\n');

    console.log('Environment Check:');
    console.log('  OPENAI_API_KEY    :', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('  ANTHROPIC_API_KEY :', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('  COHERE_API_KEY    :', process.env.COHERE_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('  SLACK_WEBHOOK_URL :', process.env.SLACK_WEBHOOK_URL && process.env.SLACK_WEBHOOK_URL !== 'your_slack_webhook_here' ? '✅ Set' : '❌ Missing');
    console.log('\n-------------------------------------------------\n');

    await initDb();
    const checker = new CheckerService();

    console.log('Running LIVE health checks against all providers...\n');
    await checker.runAllChecks();

    console.log('\n=================================================');
    console.log('   Check complete. Watch your Slack channel!');
    console.log('=================================================\n');
    process.exit(0);
}

runLiveCheck().catch(err => {
    console.error('Live check failed:', err);
    process.exit(1);
});
