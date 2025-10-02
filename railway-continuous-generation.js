#!/usr/bin/env node

/**
 * Railway Continuous Article Generation Script
 * 
 * This script runs continuously (every few hours) and only generates
 * new articles for cities that don't have recent articles, making it
 * efficient for 24/7 operation.
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
  : 'https://holler.news';

const BATCH_SIZE = 10; // Process 10 cities at a time
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches
const MAX_RETRIES = 3;
const HOURS_THRESHOLD = 6; // Only generate articles if last article is older than 6 hours

console.log('🚀 Railway Continuous Article Generation Starting...');
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log(`⏰ Started at: ${new Date().toISOString()}`);
console.log(`🔄 Mode: Continuous generation (24/7)`);

/**
 * Make HTTP request with retry logic
 */
async function makeRequest(url, options = {}, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: 30000, // 30 second timeout
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } else {
            throw new Error(`HTTP ${res.statusCode}: ${data}`);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      if (retries > 0) {
        console.log(`⚠️ Request failed, retrying... (${retries} retries left)`);
        setTimeout(() => {
          makeRequest(url, options, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 2000);
      } else {
        reject(error);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      if (retries > 0) {
        console.log(`⏰ Request timeout, retrying... (${retries} retries left)`);
        setTimeout(() => {
          makeRequest(url, options, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 2000);
      } else {
        reject(new Error('Request timeout'));
      }
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Check if city needs a new article (no recent article)
 */
async function checkCityNeedsArticle(city) {
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/news/city/${city.id}`);
    
    if (!response.articles || response.articles.length === 0) {
      return true; // No articles at all
    }

    // Check if the most recent article is older than threshold
    const latestArticle = response.articles[0];
    const articleDate = new Date(latestArticle.created_at);
    const now = new Date();
    const hoursDiff = (now - articleDate) / (1000 * 60 * 60);

    return hoursDiff > HOURS_THRESHOLD;
  } catch (error) {
    console.log(`⚠️ Could not check articles for ${city.name}, ${city.state}: ${error.message}`);
    return true; // Assume it needs an article if we can't check
  }
}

/**
 * Fetch all cities from the API
 */
async function fetchCities() {
  console.log('🏙️ Fetching cities from API...');
  
  try {
    const cities = await makeRequest(`${API_BASE_URL}/api/cities`);
    console.log(`✅ Fetched ${cities.length} cities`);
    return cities;
  } catch (error) {
    console.error('❌ Failed to fetch cities:', error.message);
    throw error;
  }
}

/**
 * Filter cities that need new articles
 */
async function filterCitiesNeedingArticles(cities) {
  console.log('🔍 Checking which cities need new articles...');
  
  const citiesNeedingArticles = [];
  let checkedCount = 0;

  for (const city of cities) {
    checkedCount++;
    if (checkedCount % 50 === 0) {
      console.log(`📊 Checked ${checkedCount}/${cities.length} cities...`);
    }

    const needsArticle = await checkCityNeedsArticle(city);
    if (needsArticle) {
      citiesNeedingArticles.push(city);
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`✅ Found ${citiesNeedingArticles.length} cities needing new articles`);
  return citiesNeedingArticles;
}

/**
 * Generate article for a single city
 */
async function generateArticleForCity(city) {
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/generate-single-article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cityName: city.name,
        state: city.state,
        cityId: city.id
      })
    });

    if (response.success) {
      console.log(`✅ Created article for ${city.name}, ${city.state}`);
      return { success: true, city: city.name, state: city.state };
    } else {
      console.log(`⚠️ No events found for ${city.name}, ${city.state}`);
      return { success: false, city: city.name, state: city.state, error: response.error };
    }
  } catch (error) {
    console.error(`❌ Error generating article for ${city.name}, ${city.state}:`, error.message);
    return { success: false, city: city.name, state: city.state, error: error.message };
  }
}

/**
 * Process cities in batches
 */
async function processCitiesInBatches(cities) {
  if (cities.length === 0) {
    console.log('🎉 All cities already have recent articles! Nothing to generate.');
    return { successCount: 0, failureCount: 0, processedCount: 0 };
  }

  const totalCities = cities.length;
  let processedCount = 0;
  let successCount = 0;
  let failureCount = 0;

  console.log(`📦 Processing ${totalCities} cities in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(totalCities / BATCH_SIZE);

    console.log(`\n📦 Batch ${batchNumber}/${totalBatches}: Processing ${batch.length} cities (${Math.round((i / totalCities) * 100)}% complete)...`);

    const batchPromises = batch.map(city => generateArticleForCity(city));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      
      const batchSuccess = batchResults.filter(r => r.success).length;
      const batchFailures = batchResults.filter(r => !r.success).length;
      
      successCount += batchSuccess;
      failureCount += batchFailures;
      processedCount += batch.length;

      console.log(`✅ Batch ${batchNumber} completed: ${batchSuccess} created, ${batchFailures} failed`);
      console.log(`📊 Total so far: ${successCount} created, ${failureCount} failed`);
      console.log(`📈 Progress: ${Math.round((processedCount / totalCities) * 100)}% complete (${processedCount}/${totalCities} cities)`);

      // Wait between batches (except for the last one)
      if (i + BATCH_SIZE < cities.length) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }

    } catch (error) {
      console.error(`💥 Batch ${batchNumber} failed:`, error.message);
      failureCount += batch.length;
      processedCount += batch.length;
    }
  }

  return { successCount, failureCount, processedCount };
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🔍 Starting continuous article generation...');
    
    // Fetch cities from API
    const allCities = await fetchCities();
    
    if (allCities.length === 0) {
      console.log('⚠️ No cities found - nothing to process');
      return;
    }

    // Filter cities that need new articles
    const citiesNeedingArticles = await filterCitiesNeedingArticles(allCities);

    // Process cities in batches
    const results = await processCitiesInBatches(citiesNeedingArticles);

    // Final summary
    console.log('\n🎉 Continuous generation cycle completed!');
    console.log(`📊 Final totals: ${results.successCount} created, ${results.failureCount} failed`);
    console.log(`🏙️ Processed ${results.processedCount} cities`);
    console.log(`📈 Efficiency: ${Math.round((results.processedCount / allCities.length) * 100)}% of cities needed updates`);
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);

    // Exit with appropriate code
    if (results.failureCount === 0) {
      console.log('✅ All articles generated successfully!');
      process.exit(0);
    } else if (results.successCount > 0) {
      console.log('⚠️ Some articles failed, but generation completed');
      process.exit(0);
    } else {
      console.log('❌ All articles failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
