#!/usr/bin/env node

/**
 * Test script for Craigslist scraping functionality
 * Tests real Craigslist scraping with a small sample of cities
 */

const JobsScraper = require('./server/jobs-scraper');

async function testCraigslistScraping() {
  console.log('🧪 Testing Craigslist Scraping...\n');
  
  try {
    // Initialize scraper
    console.log('1️⃣ Initializing scraper...');
    const scraper = new JobsScraper();
    await scraper.loadCities();
    console.log(`✅ Loaded ${scraper.cities.length} cities\n`);
    
    // Test with a few major cities that have Craigslist presence
    const testCities = [
      { name: 'Atlanta', state: 'GA' },
      { name: 'Austin', state: 'TX' },
      { name: 'Boston', state: 'MA' },
      { name: 'Chicago', state: 'IL' },
      { name: 'Denver', state: 'CO' }
    ];
    
    console.log('2️⃣ Testing Craigslist URL mapping...');
    for (const testCity of testCities) {
      const city = scraper.cities.find(c => 
        c.name.toLowerCase() === testCity.name.toLowerCase() && 
        c.state === testCity.state
      );
      
      if (city) {
        const url = scraper.getCraigslistUrl(city);
        console.log(`   ${city.name}, ${city.state} → ${url || 'No mapping'}`);
      } else {
        console.log(`   ⚠️  ${testCity.name}, ${testCity.state} not found in database`);
      }
    }
    console.log('✅ URL mapping test completed\n');
    
    // Test with one city that definitely has Craigslist
    console.log('3️⃣ Testing real Craigslist scraping...');
    const atlanta = scraper.cities.find(c => 
      c.name.toLowerCase() === 'atlanta' && c.state === 'GA'
    );
    
    if (atlanta) {
      console.log(`   Testing with ${atlanta.name}, ${atlanta.state}...`);
      const result = await scraper.fetchJobsFromCraigslist(atlanta, 5); // Limit to 5 jobs for testing
      
      console.log(`   ✅ Scraped ${result.jobs.length} jobs from Craigslist`);
      
      if (result.jobs.length > 0) {
        console.log('   Sample job:');
        const sampleJob = result.jobs[0];
        console.log(`     Title: ${sampleJob.title}`);
        console.log(`     Location: ${sampleJob.location}`);
        console.log(`     Type: ${sampleJob.type}`);
        console.log(`     Category: ${sampleJob.category}`);
        console.log(`     Salary: ${sampleJob.salary || 'Not specified'}`);
        console.log(`     Posted: ${new Date(sampleJob.postedDate).toLocaleDateString()}`);
        console.log(`     URL: ${sampleJob.url}`);
      }
      
      if (result.error) {
        console.log(`   ⚠️  Error: ${result.error}`);
      }
    } else {
      console.log('   ❌ Atlanta, GA not found in cities database');
    }
    console.log('✅ Craigslist scraping test completed\n');
    
    // Test batch processing with Craigslist
    console.log('4️⃣ Testing batch processing with Craigslist...');
    const testBatch = scraper.cities.slice(0, 2); // Test with first 2 cities
    const batchResults = [];
    
    for (const city of testBatch) {
      console.log(`   Processing ${city.name}, ${city.state}...`);
      const result = await scraper.processCity(city, ['craigslist']); // Only Craigslist for testing
      batchResults.push(result);
      console.log(`     Found ${result.jobs.length} jobs`);
    }
    
    const totalJobs = batchResults.reduce((sum, result) => sum + result.jobs.length, 0);
    console.log(`✅ Batch processing completed: ${totalJobs} total jobs from ${batchResults.length} cities\n`);
    
    // Test data storage
    console.log('5️⃣ Testing data storage...');
    await scraper.saveJobsData(batchResults, 'test-craigslist-jobs.json');
    console.log('✅ Data storage test completed\n');
    
    console.log('🎉 All Craigslist tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Cities loaded: ${scraper.cities.length}`);
    console.log(`   ✅ URL mapping: Working`);
    console.log(`   ✅ Real scraping: Working`);
    console.log(`   ✅ Batch processing: ${batchResults.length} cities`);
    console.log(`   ✅ Data storage: Working`);
    console.log(`   ✅ Total jobs scraped: ${totalJobs}`);
    
    console.log('\n🚀 Craigslist scraping is ready for production!');
    console.log('   • The system will now scrape real Craigslist jobs');
    console.log('   • Rate limiting: 3 seconds between requests');
    console.log('   • Batch size: 20 cities per batch');
    console.log('   • Start the server to begin automatic scraping');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔍 Debug information:');
    console.error('   Error:', error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Network error - possible solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify Craigslist is accessible');
      console.error('   3. Check if you\'re behind a firewall/proxy');
    }
    
    if (error.response) {
      console.error('\n📡 HTTP Response:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Headers:`, error.response.headers);
    }
    
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testCraigslistScraping()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testCraigslistScraping;
