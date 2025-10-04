#!/usr/bin/env node

/**
 * Test script for the Jobs Scraping System
 * This script tests the core functionality of the jobs system
 */

const JobsScraper = require('./server/jobs-scraper');
const path = require('path');

async function testJobsSystem() {
  console.log('🧪 Testing Jobs Scraping System...\n');
  
  try {
    // Test 1: Initialize scraper
    console.log('1️⃣ Testing scraper initialization...');
    const scraper = new JobsScraper();
    await scraper.loadCities();
    console.log(`✅ Loaded ${scraper.cities.length} cities\n`);
    
    // Test 2: Test city mapping (educational only)
    console.log('2️⃣ Testing city to URL mapping...');
    const testCities = scraper.cities.slice(0, 5);
    testCities.forEach(city => {
      const url = scraper.getCraigslistUrl(city);
      console.log(`   ${city.name}, ${city.state} → ${url || 'No mapping'}`);
    });
    console.log('✅ URL mapping test completed (educational purposes only)\n');
    
    // Test 3: Test mock job generation
    console.log('3️⃣ Testing mock job generation...');
    const testCity = scraper.cities[0];
    const indeedJobs = await scraper.fetchJobsFromIndeed(testCity);
    const glassdoorJobs = await scraper.fetchJobsFromGlassdoor(testCity);
    
    console.log(`   Indeed jobs for ${testCity.name}: ${indeedJobs.jobs.length}`);
    console.log(`   Glassdoor jobs for ${testCity.name}: ${glassdoorJobs.jobs.length}`);
    console.log('✅ Mock job generation test completed\n');
    
    // Test 4: Test batch processing
    console.log('4️⃣ Testing batch processing...');
    const batchResult = await scraper.processCitiesBatch(0, 2);
    console.log(`   Processed ${batchResult.length} cities in batch`);
    console.log('✅ Batch processing test completed\n');
    
    // Test 5: Test data storage
    console.log('5️⃣ Testing data storage...');
    await scraper.saveJobsData(batchResult, 'test-jobs.json');
    console.log('✅ Data storage test completed\n');
    
    // Test 6: Test statistics
    console.log('6️⃣ Testing statistics...');
    const stats = scraper.getStats();
    console.log(`   Total Jobs: ${stats.totalJobs}`);
    console.log(`   Cities with Jobs: ${stats.citiesWithJobs}`);
    console.log(`   Coverage: ${stats.coverage}`);
    console.log('✅ Statistics test completed\n');
    
    // Cleanup
    console.log('🧹 Cleaning up test files...');
    const testJobsFile = path.join(__dirname, 'server', 'data', 'test-jobs.json');
    try {
      const fs = require('fs').promises;
      await fs.unlink(testJobsFile);
      console.log('✅ Test files cleaned up\n');
    } catch (error) {
      console.log('⚠️  Test file cleanup skipped (file may not exist)\n');
    }
    
    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Cities loaded: ${scraper.cities.length}`);
    console.log(`   ✅ Mock jobs generated: ${indeedJobs.jobs.length + glassdoorJobs.jobs.length}`);
    console.log(`   ✅ Batch processing: ${batchResult.length} cities`);
    console.log(`   ✅ Data storage: Working`);
    console.log(`   ✅ Statistics: Working`);
    
    console.log('\n🚀 The jobs scraping system is ready to use!');
    console.log('   • Start the server: npm start');
    console.log('   • Open admin panel: jobs-admin.html');
    console.log('   • View jobs page: /jobs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔍 Debug information:');
    console.error('   Error:', error);
    
    if (error.code === 'ENOENT') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Make sure you\'re running from the project root');
      console.error('   2. Ensure server/data/cities.json exists');
      console.error('   3. Run: cd server && npm install');
    }
    
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testJobsSystem()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testJobsSystem;
