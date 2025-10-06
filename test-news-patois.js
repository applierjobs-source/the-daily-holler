#!/usr/bin/env node

/**
 * Test script for Google News + Patois article generation
 */

const https = require('https');

const API_BASE_URL = process.env.API_BASE_URL || 'https://holler.news';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testNewsPatoisGeneration() {
  try {
    console.log('🧪 Testing Google News + Patois article generation...');
    console.log(`📡 API Base URL: ${API_BASE_URL}`);
    
    // Test with a specific city
    const testCity = {
      name: 'Miami',
      state: 'Florida',
      id: 1
    };
    
    console.log(`\n🏙️ Testing with ${testCity.name}, ${testCity.state}...`);
    
    const response = await makeRequest(`${API_BASE_URL}/api/generate-news-patois-article`, {
      method: 'POST',
      body: {
        cityName: testCity.name,
        state: testCity.state,
        cityId: testCity.id
      }
    });
    
    if (response.success) {
      console.log('✅ Google News + Patois article generated successfully!');
      console.log(`📰 Title: ${response.article.title}`);
      console.log(`🏙️ City: ${response.article.city}, ${response.article.state}`);
      console.log(`🔗 Slug: ${response.article.slug}`);
      console.log(`📊 Word Count: ${response.article.wordCount}`);
      console.log(`📰 Original Source: ${response.article.originalSource}`);
      console.log(`🔗 Original URL: ${response.article.originalUrl}`);
      
      if (response.translation) {
        console.log(`\n🔄 Translation Details:`);
        console.log(`📝 Original Title: ${response.translation.originalTitle}`);
        console.log(`🇯🇲 Patois Title: ${response.translation.patoisTitle}`);
        console.log(`📊 Word Count: ${response.translation.wordCount.patois} (Patois) / ${response.translation.wordCount.original} (Original)`);
      }
    } else {
      console.log('❌ Google News + Patois article generation failed:');
      console.log(`Error: ${response.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNewsPatoisGeneration();
