#!/usr/bin/env node

/**
 * Direct test of IndexNow API integration
 * This script tests the IndexNow API directly without going through the server
 */

const INDEXNOW_KEY = '3b3002e1947f479c964658673b0c75d2';
const INDEXNOW_KEY_LOCATION = 'https://holler.news/3b3002e1947f479c964658673b0c75d2.txt';

async function testIndexNowDirect() {
  console.log('🔍 Testing IndexNow API Direct Integration...\n');

  // Test URLs to submit
  const testUrls = [
    'https://holler.news/',
    'https://holler.news/news',
    'https://holler.news/cities',
    'https://holler.news/jobs',
    'https://holler.news/about'
  ];

  console.log('📝 Submitting URLs to IndexNow API...');
  console.log('URLs to submit:', testUrls);
  console.log('Key:', INDEXNOW_KEY);
  console.log('Key Location:', INDEXNOW_KEY_LOCATION);

  try {
    const payload = {
      host: 'holler.news',
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: testUrls
    };

    console.log('\n📤 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    console.log('\n📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      console.log('✅ Successfully submitted URLs to IndexNow API!');
      console.log('   Status:', response.status, response.statusText);
      
      // Try to read response body if any
      try {
        const responseText = await response.text();
        if (responseText) {
          console.log('   Response Body:', responseText);
        }
      } catch (e) {
        // Ignore if no response body
      }
    } else {
      console.log('❌ IndexNow API submission failed');
      console.log('   Status:', response.status, response.statusText);
      
      try {
        const errorText = await response.text();
        console.log('   Error Body:', errorText);
      } catch (e) {
        console.log('   No error body available');
      }
    }

  } catch (error) {
    console.log('❌ Error submitting to IndexNow API:', error.message);
  }

  console.log('\n🎉 Direct IndexNow test completed!');
  console.log('\nNext steps:');
  console.log('1. Wait for server deployment to include the key file endpoint');
  console.log('2. Check Bing Webmaster Tools to verify URLs are received');
  console.log('3. Monitor search results for faster indexing');
  console.log('4. The key file will be available at: https://holler.news/3b3002e1947f479c964658673b0c75d2.txt');
}

// Run the test
testIndexNowDirect().catch(console.error);
