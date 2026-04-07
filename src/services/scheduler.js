import cron from 'node-cron';
import { CheckerService } from './checker.js';
export class SchedulerService {
    checker;
    constructor() {
        this.checker = new CheckerService();
    }
    start() {
        const schedule = process.env.CRON_SCHEDULE || '0 */6 * * *';
        console.log(`Scheduler started with schedule: ${schedule}`);
        cron.schedule(schedule, async () => {
            console.log('Running scheduled check:', new Date().toLocaleString());
            try {
                await this.checker.runAllChecks();
            }
            catch (err) {
                console.error('Scheduled check failed:', err);
            }
        });
    }
}
//# sourceMappingURL=scheduler.js.map