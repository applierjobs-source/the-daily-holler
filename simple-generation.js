#!/usr/bin/env node

const https = require('https');

async function generateSingleArticle(cityIndex) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      batchSize: 1,
      startIndex: cityIndex
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

async function runSimpleGeneration() {
  console.log('🚀 Starting simple article generation (one at a time)...');
  
  let currentIndex = 0;
  let totalCreated = 0;
  let totalFailed = 0;
  
  while (currentIndex < 1690) {
    try {
      console.log(`\n📝 Generating article ${currentIndex + 1}/1690...`);
      
      const response = await generateSingleArticle(currentIndex);
      
      if (response.success) {
        totalCreated += response.totalCreated;
        totalFailed += response.totalFailed;
        
        console.log(`✅ Article ${currentIndex + 1} completed: ${response.totalCreated} created, ${response.totalFailed} failed`);
        console.log(`📊 Total so far: ${totalCreated} created, ${totalFailed} failed`);
        
        currentIndex++;
        
        // Small delay between articles
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } else {
        console.error('❌ Article generation failed:', response.error);
        console.log('⏳ Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      console.error('❌ Error generating article:', error.message);
      console.log('⏳ Retrying in 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log('\n🎉 All articles completed!');
  console.log(`📊 Final totals: ${totalCreated} created, ${totalFailed} failed`);
}

// Run the simple generation
runSimpleGeneration().catch(console.error);
