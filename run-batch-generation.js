#!/usr/bin/env node

const https = require('https');

const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds

async function runBatchGeneration() {
  console.log('🚀 Starting batch article generation...');
  
  let startIndex = 0;
  let totalCreated = 0;
  let totalFailed = 0;
  
  while (true) {
    try {
      console.log(`\n📦 Processing batch starting at index ${startIndex}...`);
      
      const response = await makeRequest({
        hostname: 'holler.news',
        port: 443,
        path: '/api/generate-daily-articles',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }, {
        batchSize: BATCH_SIZE,
        startIndex: startIndex
      });
      
      if (response.success) {
        totalCreated += response.totalCreated;
        totalFailed += response.totalFailed;
        
        console.log(`✅ Batch completed: ${response.totalCreated} created, ${response.totalFailed} failed`);
        console.log(`📊 Total so far: ${totalCreated} created, ${totalFailed} failed`);
        console.log(`📈 Remaining cities: ${response.batchInfo.remainingCities}`);
        
        if (response.batchInfo.remainingCities <= 0) {
          console.log('\n🎉 All batches completed!');
          console.log(`📊 Final totals: ${totalCreated} created, ${totalFailed} failed`);
          break;
        }
        
        startIndex = response.batchInfo.endIndex;
        
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        
      } else {
        console.error('❌ Batch failed:', response.error);
        break;
      }
      
    } catch (error) {
      console.error('❌ Error in batch generation:', error.message);
      console.log('⏳ Retrying in 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
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
    
    req.write(JSON.stringify(data));
    req.end();
  });
}

// Run the batch generation
runBatchGeneration().catch(console.error);
