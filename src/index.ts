import * as cron from 'node-cron';
import { executeTask } from './tasks/task';

console.log('Cron job scheduler started...');

cron.schedule('*/5 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Running scheduled task...`);
  await executeTask('San Francisco, CA'); // Default location for cron job
});

cron.schedule('0 */1 * * *', () => {
  console.log(`[${new Date().toISOString()}] Running hourly task...`);
});

console.log('Cron jobs scheduled:');
console.log('- Every 5 minutes: Main task execution');
console.log('- Every hour: Hourly task');
console.log('\nPress Ctrl+C to stop the scheduler.');