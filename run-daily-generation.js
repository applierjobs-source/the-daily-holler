#!/usr/bin/env node

const { generateDailyArticles } = require('./daily-article-generator');

console.log('🚀 Starting Daily Article Generation Process');
console.log('⏰ Time:', new Date().toISOString());
console.log('');

generateDailyArticles()
  .then(() => {
    console.log('\n✅ Daily generation process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Daily generation process failed:', error);
    process.exit(1);
  });
