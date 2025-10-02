#!/usr/bin/env node

/**
 * Railway Minute-by-Minute Article Generation Script
 * 
 * This script generates exactly 1 article per minute, cycling through cities
 * to ensure continuous content generation around the clock.
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
  : 'https://holler.news';

const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout

console.log('🚀 Railway Minute-by-Minute Article Generation Starting...');
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log(`⏰ Started at: ${new Date().toISOString()}`);
console.log('🎯 Target: 1 article per minute (60 articles/hour, 1,440/day)');

/**
 * Make HTTP request with retry logic
 */
async function makeRequest(url, options = {}, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return new Promise((resolve, reject) => {
        const req = https.request(url, {
          ...options,
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Railway-Cron-Generator/1.0',
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

        req.on('error', (err) => {
          if (attempt < retries) {
            console.log(`⏳ Retrying in ${Math.pow(2, attempt)} seconds...`);
            setTimeout(() => {
              makeRequest(url, options, retries - attempt).then(resolve).catch(reject);
            }, Math.pow(2, attempt) * 1000);
          } else {
            reject(err);
          }
        });

        req.on('timeout', () => {
          req.destroy();
          if (attempt < retries) {
            console.log(`⏳ Request timeout, retrying in ${Math.pow(2, attempt)} seconds...`);
            setTimeout(() => {
              makeRequest(url, options, retries - attempt).then(resolve).catch(reject);
            }, Math.pow(2, attempt) * 1000);
          } else {
            reject(new Error('Request timeout'));
          }
        });

        if (options.body) {
          req.write(JSON.stringify(options.body));
        }
        req.end();
      });
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`⏳ Retrying in ${Math.pow(2, attempt)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Fetch all cities from the API
 */
async function fetchCities() {
  console.log('🏙️ Fetching cities from API...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/cities`);
    
    if (!response || !Array.isArray(response)) {
      throw new Error('Invalid cities response format');
    }
    
    console.log(`✅ Found ${response.length} cities`);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch cities:', error.message);
    throw error;
  }
}

/**
 * Generate article for a single city
 */
async function generateArticleForCity(city) {
  try {
    console.log(`🏙️ Generating article for ${city.name}, ${city.state}...`);
    
    const response = await makeRequest(`${API_BASE_URL}/api/generate-single-article`, {
      method: 'POST',
      body: {
        cityName: city.name,
        state: city.state,
        cityId: city.id
      }
    });
    
    if (response && response.success) {
      console.log(`✅ Article created for ${city.name}, ${city.state}`);
      return { success: true, city: city.name, state: city.state };
    } else {
      console.log(`⚠️ Article generation failed for ${city.name}, ${city.state}: ${response?.error || 'Unknown error'}`);
      return { success: false, city: city.name, state: city.state, error: response?.error };
    }
  } catch (error) {
    console.log(`❌ Error generating article for ${city.name}, ${city.state}: ${error.message}`);
    return { success: false, city: city.name, state: city.state, error: error.message };
  }
}

/**
 * Main generation loop - generates 1 article per minute
 */
async function startMinuteGeneration() {
  try {
    // Fetch all cities
    const cities = await fetchCities();
    
    if (cities.length === 0) {
      console.log('❌ No cities found. Exiting.');
      return;
    }
    
    console.log(`🔄 Starting minute-by-minute generation for ${cities.length} cities`);
    console.log('⏰ Each city will get a new article every ~28 hours (1,440 minutes ÷ 50 cities)');
    
    let cityIndex = 0;
    let totalGenerated = 0;
    let totalFailed = 0;
    
    // Generate 1 article per minute indefinitely
    while (true) {
      const currentCity = cities[cityIndex];
      const startTime = Date.now();
      
      console.log(`\n⏰ ${new Date().toISOString()} - Generating article ${totalGenerated + 1}`);
      console.log(`🏙️ Processing: ${currentCity.name}, ${currentCity.state}`);
      
      const result = await generateArticleForCity(currentCity);
      
      if (result.success) {
        totalGenerated++;
        console.log(`✅ Success! Total generated: ${totalGenerated}`);
      } else {
        totalFailed++;
        console.log(`❌ Failed! Total failed: ${totalFailed}`);
      }
      
      // Move to next city
      cityIndex = (cityIndex + 1) % cities.length;
      
      // Calculate time to wait for next minute
      const elapsedTime = Date.now() - startTime;
      const waitTime = Math.max(0, 60000 - elapsedTime); // Wait until next minute
      
      console.log(`⏳ Waiting ${Math.round(waitTime / 1000)} seconds until next minute...`);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error in minute generation:', error.message);
    process.exit(1);
  }
}

// Start the generation
startMinuteGeneration().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
