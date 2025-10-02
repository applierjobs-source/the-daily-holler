#!/usr/bin/env node

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const BATCH_SIZE = 10; // Smaller batches to avoid timeouts
const DELAY_BETWEEN_BATCHES = 3000; // 3 seconds between batches
const MAX_RETRIES_PER_BATCH = 3; // Fewer retries since we're targeting specific cities
const RETRY_DELAYS = [5000, 10000, 15000]; // Shorter retry delays
const PROGRESS_FILE = process.env.RAILWAY_VOLUME_MOUNT_PATH ? 
  `${process.env.RAILWAY_VOLUME_MOUNT_PATH}/targeted-generation-progress.json` : 
  '/tmp/targeted-generation-progress.json';

// Fetch cities from the API
async function fetchCitiesFromAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'holler.news',
      port: 443,
      path: '/api/cities',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`✅ Fetched ${parsed.cities.length} cities from API`);
          resolve(parsed.cities);
        } catch (error) {
          reject(new Error(`Failed to parse cities response: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Cities API request timeout'));
    });
    
    req.end();
  });
}

// Save progress to file
async function saveProgress(processedCities, totalCreated, totalFailed, batchNumber) {
  try {
    const progress = {
      processedCities,
      totalCreated,
      totalFailed,
      batchNumber,
      lastUpdate: new Date().toISOString()
    };
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.warn('⚠️ Could not save progress:', error.message);
  }
}

// Load progress from file
async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('📝 No previous progress found, starting fresh');
    return null;
  }
}

// Clear progress file
async function clearProgress() {
  try {
    await fs.unlink(PROGRESS_FILE);
  } catch (error) {
    // File doesn't exist, that's fine
  }
}

// Generate article for a single city
async function generateArticleForCity(city) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      cityName: city.name,
      state: city.state,
      cityId: city.id
    });

    const options = {
      hostname: 'holler.news',
      port: 443,
      path: '/api/generate-single-article',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 120000 // 2 minute timeout for single article
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(data);
    req.end();
  });
}

async function runTargetedGeneration() {
  console.log('🎯 Starting targeted article generation for cities on holler.news...');
  console.log(`📦 Processing in batches of ${BATCH_SIZE} articles`);
  console.log(`🛡️ Maximum retries per batch: ${MAX_RETRIES_PER_BATCH}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  try {
    // Fetch cities from the API
    console.log('🌍 Fetching cities from holler.news API...');
    const cities = await fetchCitiesFromAPI();
    
    if (!cities || cities.length === 0) {
      console.error('❌ No cities found from API');
      return;
    }
    
    console.log(`📋 Found ${cities.length} cities to process`);
    
    // Try to resume from previous progress
    const savedProgress = await loadProgress();
    let processedCities = savedProgress ? savedProgress.processedCities : [];
    let totalCreated = savedProgress ? savedProgress.totalCreated : 0;
    let totalFailed = savedProgress ? savedProgress.totalFailed : 0;
    let batchNumber = savedProgress ? savedProgress.batchNumber : 1;
    
    if (savedProgress) {
      console.log(`📋 Resuming from previous progress:`);
      console.log(`   - Processed cities: ${processedCities.length}`);
      console.log(`   - Total created: ${totalCreated}`);
      console.log(`   - Total failed: ${totalFailed}`);
      console.log(`   - Batch number: ${batchNumber}`);
      console.log(`   - Last update: ${savedProgress.lastUpdate}`);
    }
    
    // Filter out already processed cities
    const remainingCities = cities.filter(city => !processedCities.includes(city.id));
    console.log(`🔄 ${remainingCities.length} cities remaining to process`);
    
    // Process cities in batches
    for (let i = 0; i < remainingCities.length; i += BATCH_SIZE) {
      const batchCities = remainingCities.slice(i, i + BATCH_SIZE);
      const progressPercent = Math.round(((i + processedCities.length) / cities.length) * 100);
      
      console.log(`\n📦 Batch ${batchNumber}: Processing ${batchCities.length} cities (${progressPercent}% complete)...`);
      
      let batchSuccess = false;
      let retryCount = 0;
      let batchCreated = 0;
      let batchFailed = 0;
      
      // Retry loop for each batch
      while (!batchSuccess && retryCount < MAX_RETRIES_PER_BATCH) {
        try {
          // Process each city in the batch
          for (const city of batchCities) {
            try {
              console.log(`🏙️ Processing ${city.name}, ${city.state}...`);
              
              const response = await generateArticleForCity(city);
              
              if (response.success) {
                batchCreated++;
                totalCreated++;
                processedCities.push(city.id);
                console.log(`✅ Created article for ${city.name}, ${city.state}`);
              } else {
                batchFailed++;
                totalFailed++;
                console.log(`❌ Failed to create article for ${city.name}, ${city.state}: ${response.error}`);
              }
              
              // Small delay between cities
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (error) {
              batchFailed++;
              totalFailed++;
              console.error(`❌ Error processing ${city.name}, ${city.state}:`, error.message);
            }
          }
          
          // Save progress after each batch
          await saveProgress(processedCities, totalCreated, totalFailed, batchNumber + 1);
          
          console.log(`✅ Batch ${batchNumber} completed: ${batchCreated} created, ${batchFailed} failed`);
          console.log(`📊 Total so far: ${totalCreated} created, ${totalFailed} failed`);
          console.log(`📈 Progress: ${progressPercent}% complete (${processedCities.length}/${cities.length} cities)`);
          
          batchNumber++;
          batchSuccess = true;
          
        } catch (error) {
          retryCount++;
          console.error(`❌ Batch ${batchNumber} failed (attempt ${retryCount}/${MAX_RETRIES_PER_BATCH}):`, error.message);
          
          if (retryCount < MAX_RETRIES_PER_BATCH) {
            const delay = RETRY_DELAYS[Math.min(retryCount - 1, RETRY_DELAYS.length - 1)];
            console.log(`⏳ Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error(`💥 Batch ${batchNumber} failed after ${MAX_RETRIES_PER_BATCH} attempts. Moving to next batch.`);
            batchNumber++;
            batchSuccess = true; // Move on to prevent infinite loop
          }
        }
      }
      
      // Delay between batches
      if (i + BATCH_SIZE < remainingCities.length) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    // Clear progress file on completion
    await clearProgress();
    
    console.log('\n🎉 All articles completed!');
    console.log(`📊 Final totals: ${totalCreated} created, ${totalFailed} failed`);
    console.log(`🏙️ Processed ${processedCities.length} cities`);
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('💥 Error in targeted generation:', error);
  }
}

// Process-level error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.log('🔄 Script will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('🔄 Script will continue running...');
});

// Run the targeted generation
runTargetedGeneration();
