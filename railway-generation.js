#!/usr/bin/env node

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const BATCH_SIZE = 10; // Smaller batches for Railway
const DELAY_BETWEEN_BATCHES = 3000; // 3 seconds
const MAX_RETRIES_PER_BATCH = 10; // Maximum retries for a single batch
const RETRY_DELAYS = [5000, 10000, 15000, 30000, 60000]; // Exponential backoff delays
const PROGRESS_FILE = '/tmp/railway-generation-progress.json';

// Save progress to file
async function saveProgress(startIndex, totalCreated, totalFailed, batchNumber) {
  try {
    const progress = {
      startIndex,
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

async function generateBatch(startIndex, batchSize, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      batchSize: batchSize,
      startIndex: startIndex
    });

    const options = {
      hostname: 'holler.news',
      port: 443,
      path: '/api/generate-daily-articles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 60000 // 60 second timeout
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

async function runRailwayGeneration() {
  console.log('🚀 Starting Railway article generation...');
  console.log(`📦 Processing in batches of ${BATCH_SIZE} articles`);
  console.log(`🛡️ Maximum retries per batch: ${MAX_RETRIES_PER_BATCH}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  // Try to resume from previous progress
  const savedProgress = await loadProgress();
  let startIndex = savedProgress ? savedProgress.startIndex : 0;
  let totalCreated = savedProgress ? savedProgress.totalCreated : 0;
  let totalFailed = savedProgress ? savedProgress.totalFailed : 0;
  let batchNumber = savedProgress ? savedProgress.batchNumber : 1;
  
  if (savedProgress) {
    console.log(`📋 Resuming from previous progress:`);
    console.log(`   - Start index: ${startIndex}`);
    console.log(`   - Total created: ${totalCreated}`);
    console.log(`   - Total failed: ${totalFailed}`);
    console.log(`   - Batch number: ${batchNumber}`);
    console.log(`   - Last update: ${savedProgress.lastUpdate}`);
  }
  
  // Main generation loop - this will NEVER exit until all articles are done
  while (startIndex < 1690) {
    const endIndex = Math.min(startIndex + BATCH_SIZE, 1690);
    console.log(`\n📦 Batch ${batchNumber}: Processing articles ${startIndex + 1}-${endIndex}...`);
    
    let batchSuccess = false;
    let retryCount = 0;
    
    // Retry loop for each batch - will retry up to MAX_RETRIES_PER_BATCH times
    while (!batchSuccess && retryCount < MAX_RETRIES_PER_BATCH) {
      try {
        const response = await generateBatch(startIndex, BATCH_SIZE, retryCount);
        
        if (response.success) {
          totalCreated += response.totalCreated;
          totalFailed += response.totalFailed;
          
          const progress = Math.round((endIndex / 1690) * 100);
          console.log(`✅ Batch ${batchNumber} completed: ${response.totalCreated} created, ${response.totalFailed} failed`);
          console.log(`📊 Total so far: ${totalCreated} created, ${totalFailed} failed`);
          console.log(`📈 Progress: ${progress}% complete (${endIndex}/1690)`);
          
          // Save progress after each successful batch
          await saveProgress(endIndex, totalCreated, totalFailed, batchNumber + 1);
          
          startIndex = endIndex;
          batchNumber++;
          batchSuccess = true;
          
        } else {
          retryCount++;
          console.error(`❌ Batch ${batchNumber} failed (attempt ${retryCount}/${MAX_RETRIES_PER_BATCH}):`, response.error);
          
          if (retryCount < MAX_RETRIES_PER_BATCH) {
            const delay = RETRY_DELAYS[Math.min(retryCount - 1, RETRY_DELAYS.length - 1)];
            console.log(`⏳ Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error(`💥 Batch ${batchNumber} failed after ${MAX_RETRIES_PER_BATCH} attempts. Moving to next batch.`);
            startIndex = endIndex;
            batchNumber++;
            batchSuccess = true; // Move on to prevent infinite loop
          }
        }
        
      } catch (error) {
        retryCount++;
        console.error(`❌ Network/API error in batch ${batchNumber} (attempt ${retryCount}/${MAX_RETRIES_PER_BATCH}):`, error.message);
        
        if (retryCount < MAX_RETRIES_PER_BATCH) {
          const delay = RETRY_DELAYS[Math.min(retryCount - 1, RETRY_DELAYS.length - 1)];
          console.log(`⏳ Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`💥 Batch ${batchNumber} failed after ${MAX_RETRIES_PER_BATCH} attempts due to network issues. Moving to next batch.`);
          startIndex = endIndex;
          batchNumber++;
          batchSuccess = true; // Move on to prevent infinite loop
        }
      }
    }
    
    // Small delay between successful batches
    if (startIndex < 1690) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  // Clear progress file on completion
  await clearProgress();
  
  console.log('\n🎉 All articles completed!');
  console.log(`📊 Final totals: ${totalCreated} created, ${totalFailed} failed`);
  console.log(`⏰ Completed at: ${new Date().toISOString()}`);
}

// Process-level error handling to ensure the script never dies unexpectedly
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.log('🔄 Script will continue running...');
  // Don't exit - let the script continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('🔄 Script will continue running...');
  // Don't exit - let the script continue
});

// Run the Railway generation with infinite retry capability
async function runWithInfiniteRetry() {
  while (true) {
    try {
      await runRailwayGeneration();
      console.log('✅ Generation completed successfully, exiting.');
      process.exit(0);
    } catch (error) {
      console.error('💥 Fatal error in generation process:', error);
      console.log('🔄 Restarting generation process in 30 seconds...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      console.log('🚀 Restarting generation...');
    }
  }
}

// Start the resilient generation process
runWithInfiniteRetry();
