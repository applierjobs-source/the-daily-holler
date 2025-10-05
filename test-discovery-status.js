#!/usr/bin/env node

/**
 * Test script to check discovery feed status
 */

const https = require('https');

const testUrls = [
  'https://holler.news/',
  'https://holler.news/discover/',
  'https://holler.news/sitemap-index.xml',
  'https://holler.news/discover/2024-01-05/'
];

console.log('🔍 Testing Discovery Feed Status...\n');

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      const status = res.statusCode;
      const statusText = status === 200 ? '✅ WORKING' : status === 404 ? '❌ NOT GENERATED YET' : `⚠️  ${status}`;
      console.log(`${statusText} - ${url}`);
      resolve({ url, status, statusText });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ERROR - ${url} (${err.message})`);
      resolve({ url, status: 'ERROR', statusText: 'ERROR' });
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ TIMEOUT - ${url}`);
      req.destroy();
      resolve({ url, status: 'TIMEOUT', statusText: 'TIMEOUT' });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('Testing URLs...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
  }
  
  console.log('\n📊 Summary:');
  console.log('• If main site (/) works but discover/ returns 404, GitHub Actions needs to run');
  console.log('• If all URLs return 200, discovery feed is working!');
  console.log('• To trigger GitHub Actions:');
  console.log('  1. Go to: https://github.com/applierjobs-source/the-daily-holler/actions');
  console.log('  2. Click "Discovery Feed Nightly Build"');
  console.log('  3. Click "Run workflow"');
  console.log('  4. Wait 10-15 minutes for completion');
}

runTests().catch(console.error);
