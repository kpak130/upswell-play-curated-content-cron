import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import * as path from 'path';
const yelp = require('yelp-fusion');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '..', 'upswell-play-firebase-service-key.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'super-talents-candidates'
  });
}

const db = admin.firestore();

export async function executeTask(location: string = 'San Francisco, CA'): Promise<void> {
  console.log(`Executing main task for location: ${location}`);
  
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
      location: location,
      sort_by: 'best_match',
      limit: 20
    };
    
    const response = await client.search(searchRequest);
    console.log('Yelp Search Results:', response.jsonBody);
    
    // Get detailed business information for the first 3 listings
    const businesses = response.jsonBody.businesses;
    const first3Businesses = businesses.slice(0, 5);
    
    console.log('\n=== Getting detailed business information for first 3 listings ===\n');
    
    for (let i = 0; i < first3Businesses.length; i++) {
      const business = first3Businesses[i];
      console.log(`\n--- Business ${i + 1}: ${business.name} ---`);
      
      try {
        const businessDetails = await client.business(business.id);
        const businessData = businessDetails.jsonBody;
        
        // Prepare business data for Firestore (include all attributes)
        const firestoreData = {
          ...businessData,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          search_location: location,
          search_term: 'restaurants',
          source: 'yelp',
          source_id: businessData.id,
        };
        
        console.log('Detailed Business Info:', {
          name: businessData.name,
          rating: businessData.rating,
          review_count: businessData.review_count,
          price: businessData.price,
          phone: businessData.phone,
          address: businessData.location.display_address.join(', '),
          categories: businessData.categories.map((cat: any) => cat.title).join(', '),
          hours: businessData.hours?.[0]?.open?.map((hour: any) => 
            `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][hour.day]}: ${hour.start}-${hour.end}`
          ).join(', ') || 'Hours not available',
          website: businessData.url,
          photos: businessData.photos?.slice(0, 3) || []
        });
        
        // Check if business already exists in Firestore
        console.log(`🔍 Checking if business "${businessData.name}" already exists...`);
        const existingQuery = await db.collection('upswell_play_curated_venues')
          .where('source_id', '==', businessData.id)
          .limit(1)
          .get();
        
        if (!existingQuery.empty) {
          const existingDoc = existingQuery.docs[0];
          console.log(`⚠️  Business "${businessData.name}" already exists in Firestore`);
          console.log(`   Existing Document ID: ${existingDoc.id}`);
          console.log(`   Created at: ${existingDoc.data().created_at?.toDate?.() || 'Unknown'}`);
        } else {
          // Save to Firestore with random document ID
          const docRef = db.collection('upswell_play_curated_venues').doc();
          await docRef.set(firestoreData);
          console.log(`✅ Saved business "${businessData.name}" to Firestore with random ID: ${docRef.id}`);
        }
        
      } catch (error: any) {
        console.error(`Error processing ${business.name}:`, error.message);
      }
    }
    
    console.log('\nTask completed successfully!');
  } catch (error: any) {
    console.error('Error executing task:', error.message || error);
  }
}