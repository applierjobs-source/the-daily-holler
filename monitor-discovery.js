#!/usr/bin/env node

/**
 * Monitor discovery feed generation progress
 */

const https = require('https');

console.log('🔍 Monitoring Discovery Feed Generation...\n');

function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      const status = res.statusCode;
      resolve({ url, status });
    });
    
    req.on('error', () => {
      resolve({ url, status: 'ERROR' });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ url, status: 'TIMEOUT' });
    });
    
    req.end();
  });
}

async function checkStatus() {
  const urls = [
    'https://holler.news/discover/',
    'https://holler.news/sitemap-index.xml'
  ];
  
  console.log(`⏰ ${new Date().toLocaleTimeString()} - Checking status...`);
  
  let allWorking = true;
  
  for (const url of urls) {
    const result = await testUrl(url);
    
    if (result.status === 200) {
      // Check if it's actually discovery content or just the React app
      const contentCheck = await new Promise((resolve) => {
        const req = https.request(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const isDiscoveryContent = data.includes('Underlight by Holler.News') || 
                                     data.includes('sitemapindex') || 
                                     data.includes('Discovery Feed');
            resolve(isDiscoveryContent);
          });
        });
        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => {
          req.destroy();
          resolve(false);
        });
        req.end();
      });
      
      if (contentCheck) {
        console.log(`✅ WORKING - ${url} (Discovery content detected!)`);
      } else {
        console.log(`🔄 BUILDING - ${url} (Still showing React app)`);
        allWorking = false;
      }
    } else {
      console.log(`⏳ PENDING - ${url} (Status: ${result.status})`);
      allWorking = false;
    }
  }
  
  if (allWorking) {
    console.log('\n🎉 SUCCESS! Discovery feed is live!');
    console.log('🌐 Your discovery pages are now available at:');
    console.log('   https://holler.news/discover/');
    console.log('   https://holler.news/sitemap-index.xml');
    process.exit(0);
  } else {
    console.log('\n⏳ Still generating... Check again in 2-3 minutes.\n');
  }
}

// Check immediately
checkStatus();

// Then check every 2 minutes
setInterval(checkStatus, 120000);
