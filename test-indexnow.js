#!/usr/bin/env node

/**
 * Test script for IndexNow API integration
 * This script tests the IndexNow endpoints and submits sample URLs
 */

// Using built-in fetch (Node.js 18+)

const BASE_URL = 'https://holler.news';
const INDEXNOW_KEY = '3b3002e1947f479c964658673b0c75d2';

async function testIndexNowIntegration() {
  console.log('🔍 Testing IndexNow Integration...\n');

  // Test 1: Verify the key file is accessible
  console.log('1. Testing key file accessibility...');
  try {
    const keyResponse = await fetch(`${BASE_URL}/3b3002e1947f479c964658673b0c75d2.txt`);
    if (keyResponse.ok) {
      const keyContent = await keyResponse.text();
      if (keyContent.trim() === INDEXNOW_KEY) {
        console.log('✅ Key file is accessible and contains correct key');
      } else {
        console.log('❌ Key file contains incorrect content');
      }
    } else {
      console.log('❌ Key file is not accessible');
    }
  } catch (error) {
    console.log('❌ Error accessing key file:', error.message);
  }

  // Test 2: Test manual URL submission
  console.log('\n2. Testing manual URL submission...');
  try {
    const testUrls = [
      'https://holler.news/',
      'https://holler.news/news',
      'https://holler.news/cities',
      'https://holler.news/jobs'
    ];

    const response = await fetch(`${BASE_URL}/api/submit-to-indexnow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls: testUrls })
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ Successfully submitted ${result.submitted} URLs to IndexNow`);
      console.log('   Submitted URLs:', result.urls);
    } else {
      console.log('❌ URL submission failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error testing URL submission:', error.message);
  }

  // Test 3: Test recent articles submission
  console.log('\n3. Testing recent articles submission...');
  try {
    const response = await fetch(`${BASE_URL}/api/submit-recent-articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit: 10 })
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ Successfully submitted ${result.submitted} URLs from recent articles`);
      console.log(`   Article count: ${result.articleCount}`);
      console.log(`   Total URLs: ${result.totalUrls}`);
    } else {
      console.log('❌ Recent articles submission failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error testing recent articles submission:', error.message);
  }

  console.log('\n🎉 IndexNow integration test completed!');
  console.log('\nNext steps:');
  console.log('1. Check Bing Webmaster Tools to verify URLs are received');
  console.log('2. Monitor search results for faster indexing');
  console.log('3. Use the API endpoints to submit URLs when creating new content');
}

// Run the test
testIndexNowIntegration().catch(console.error);
