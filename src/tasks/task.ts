import * as dotenv from 'dotenv';
const yelp = require('yelp-fusion');

// Load environment variables
dotenv.config();

export async function executeTask(): Promise<void> {
  console.log('Executing main task...');
  
  try {
    const timestamp = new Date().toISOString();
    console.log(`Task started at: ${timestamp}`);
    
    // Initialize Yelp client with API key from environment
    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      throw new Error('YELP_API_KEY is not set in environment variables');
    }
    
    const client = yelp.client(apiKey);
    
    // Search for businesses
    const searchRequest = {
      term: 'restaurants',
      location: 'San Francisco, CA',
      sort_by: 'best_match',
      limit: 20
    };
    
    const response = await client.search(searchRequest);
    console.log('Yelp API Response:', response.jsonBody);
    
    console.log('Task completed successfully!');
  } catch (error: any) {
    console.error('Error executing task:', error.message || error);
  }
}