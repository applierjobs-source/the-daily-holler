#!/usr/bin/env node

/**
 * Railway 2-Second Article Generation Script
 * 
 * This script generates exactly 1 article every 2 seconds, cycling through cities
 * to ensure continuous content generation around the clock.
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://holler.news';

const MAX_RETRIES = 5;
const REQUEST_TIMEOUT = 60000; // 60 seconds timeout

console.log('🚀 Railway 2-Second Article Generation Starting...');
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log(`⏰ Started at: ${new Date().toISOString()}`);
console.log('🎯 Target: 1 article every 2 seconds (1,800 articles/hour, 43,200/day)');

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
 * Test API connection
 */
async function testAPIConnection() {
  console.log('🔍 Testing API connection...');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/cities?limit=1`);
    if (response && response.cities && Array.isArray(response.cities)) {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.error('❌ API connection failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    return false;
  }
}

/**
 * Fetch all cities from the API
 */
async function fetchCities() {
  console.log('🏙️ Fetching all cities from API...');
  
  try {
    // Fetch all cities by using a large limit
    const response = await makeRequest(`${API_BASE_URL}/api/cities?limit=2000`);
    
    if (!response || !response.cities || !Array.isArray(response.cities)) {
      throw new Error('Invalid cities response format');
    }
    
    console.log(`✅ Found ${response.cities.length} cities (total available: ${response.total || response.cities.length})`);
    return response.cities;
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
 * Generate Google News article for a city
 */
async function generateGoogleNewsArticleForCity(city) {
  try {
    console.log(`🏙️ Generating Google News article for ${city.name}, ${city.state}...`);
    
    const response = await makeRequest(`${API_BASE_URL}/api/generate-google-news-article`, {
      method: 'POST',
      body: {
        cityName: city.name,
        state: city.state,
        cityId: city.id
      }
    });
    
    if (response && response.success) {
      console.log(`✅ Google News article created for ${city.name}, ${city.state}`);
      return { success: true, city: city.name, state: city.state, type: 'google-news' };
    } else {
      console.log(`⚠️ Google News article generation failed for ${city.name}, ${city.state}: ${response?.error || 'Unknown error'}`);
      return { success: false, city: city.name, state: city.state, error: response?.error, type: 'google-news' };
    }
  } catch (error) {
    console.log(`❌ Error generating Google News article for ${city.name}, ${city.state}: ${error.message}`);
    return { success: false, city: city.name, state: city.state, error: error.message, type: 'google-news' };
  }
}

/**
 * Main generation loop - generates 1 article every 2 seconds, alternating between event news and Google news
 */
async function start2SecondGeneration() {
  try {
    // Test API connection first
    const connectionOk = await testAPIConnection();
    if (!connectionOk) {
      console.log('❌ API connection failed. Retrying in 30 seconds...');
      setTimeout(start2SecondGeneration, 30000);
      return;
    }
    
    // Fetch all cities
    const cities = await fetchCities();
    
    if (cities.length === 0) {
      console.log('❌ No cities found. Exiting.');
      return;
    }
    
    console.log(`🔄 Starting 2-second generation for ${cities.length} cities`);
    console.log(`⏰ Each city will get a new article every ~${Math.round((cities.length * 2) / 3600)} hours (${cities.length} cities × 2 seconds ÷ 3600 seconds/hour)`);
    console.log(`📰 Alternating between Event News and Google News with Patwah translation`);
    
    let cityIndex = 0;
    let totalGenerated = 0;
    let totalFailed = 0;
    let useGoogleNews = false; // Toggle between event news and Google news
    
    // Generate 1 article every 2 seconds indefinitely
    while (true) {
      const currentCity = cities[cityIndex];
      
      // Test connection periodically (every 50 articles)
      if (totalGenerated > 0 && totalGenerated % 50 === 0) {
        console.log('🔍 Testing API connection...');
        const connectionOk = await testAPIConnection();
        if (!connectionOk) {
          console.log('❌ API connection lost. Retrying in 30 seconds...');
          await new Promise(resolve => setTimeout(resolve, 30000));
          continue;
        }
      }
      
      const startTime = Date.now();
      const articleType = useGoogleNews ? 'Google News (Patwah)' : 'Event News';
      
      console.log(`\n⏰ ${new Date().toISOString()} - Generating ${articleType} article ${totalGenerated + 1}`);
      console.log(`🏙️ Processing: ${currentCity.name}, ${currentCity.state}`);
      
      let result;
      
      if (useGoogleNews) {
        // Generate Google News article with Patwah translation
        result = await generateGoogleNewsArticleForCity(currentCity);
      } else {
        // Generate Event News article (existing logic)
        result = await generateArticleForCity(currentCity);
      }
      
      if (result.success) {
        totalGenerated++;
        console.log(`✅ ${articleType} Success! Total generated: ${totalGenerated}`);
      } else {
        totalFailed++;
        console.log(`❌ ${articleType} Failed! Total failed: ${totalFailed}`);
      }
      
      // Toggle between event news and Google news
      useGoogleNews = !useGoogleNews;
      
      // Move to next city
      cityIndex = (cityIndex + 1) % cities.length;
      console.log(`🔄 Next city index: ${cityIndex} | Next type: ${useGoogleNews ? 'Google News (Patwah)' : 'Event News'}`);
      
      // Calculate time to wait for next 2-second interval
      const elapsedTime = Date.now() - startTime;
      const waitTime = Math.max(0, 2000 - elapsedTime); // Wait until next 2 seconds
      
      console.log(`⏳ Waiting ${Math.round(waitTime / 1000)} seconds until next 2-second interval...`);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error in 2-second generation:', error.message);
    process.exit(1);
  }
}

// Export functions for use in other modules
module.exports = {
  generateArticleForCity,
  generateGoogleNewsArticleForCity,
  fetchCities,
  makeRequest
};

// Start the generation if this file is run directly
if (require.main === module) {
  start2SecondGeneration().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}
