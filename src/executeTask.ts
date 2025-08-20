import { executeTask } from './tasks/task';

// Run the task for multiple locations
(async () => {
  const locations = ['San Francisco, CA', 'Los Angeles, CA', 'New York, NY'];
  
  console.log(`Starting tasks for ${locations.length} locations...\n`);
  
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`LOCATION ${i + 1}/${locations.length}: ${location.toUpperCase()}`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
      await executeTask(location);
    } catch (error: any) {
      console.error(`Failed to execute task for ${location}:`, error.message);
    }
    
    // Add a small delay between locations to avoid rate limiting
    if (i < locations.length - 1) {
      console.log(`\n⏱️  Waiting 3 seconds before next location...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('ALL LOCATIONS COMPLETED');
  console.log(`${'='.repeat(60)}`);
})();
