#!/usr/bin/env node

const https = require('https');

const BATCH_SIZE = 10; // Smaller batches for Railway
const DELAY_BETWEEN_BATCHES = 3000; // 3 seconds

async function generateBatch(startIndex, batchSize) {
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
      }
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
    
    req.write(data);
    req.end();
  });
}

async function runRailwayGeneration() {
  console.log('🚀 Starting Railway article generation...');
  console.log(`📦 Processing in batches of ${BATCH_SIZE} articles`);
  
  let startIndex = 0;
  let totalCreated = 0;
  let totalFailed = 0;
  let batchNumber = 1;
  
  while (startIndex < 1690) {
    try {
      const endIndex = Math.min(startIndex + BATCH_SIZE, 1690);
      console.log(`\n📦 Batch ${batchNumber}: Processing articles ${startIndex + 1}-${endIndex}...`);
      
      const response = await generateBatch(startIndex, BATCH_SIZE);
      
      if (response.success) {
        totalCreated += response.totalCreated;
        totalFailed += response.totalFailed;
        
        const progress = Math.round((endIndex / 1690) * 100);
        console.log(`✅ Batch ${batchNumber} completed: ${response.totalCreated} created, ${response.totalFailed} failed`);
        console.log(`📊 Total so far: ${totalCreated} created, ${totalFailed} failed`);
        console.log(`📈 Progress: ${progress}% complete (${endIndex}/1690)`);
        
        startIndex = endIndex;
        batchNumber++;
        
        if (startIndex < 1690) {
          console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
        
      } else {
        console.error('❌ Batch failed:', response.error);
        console.log('⏳ Retrying in 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
    } catch (error) {
      console.error('❌ Error in batch generation:', error.message);
      console.log('⏳ Retrying in 15 seconds...');
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
  
  console.log('\n🎉 All articles completed!');
  console.log(`📊 Final totals: ${totalCreated} created, ${totalFailed} failed`);
  console.log(`⏰ Completed at: ${new Date().toISOString()}`);
}

// Run the Railway generation
runRailwayGeneration().catch(console.error);
