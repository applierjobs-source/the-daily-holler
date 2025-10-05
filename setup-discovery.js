#!/usr/bin/env node

/**
 * Setup script for Discovery Feed System on Railway
 * This script initializes the database and runs the first discovery pipeline
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up Discovery Feed System...');

try {
  // Change to discovery directory
  const discoveryPath = path.join(__dirname, 'holler-discovery');
  
  console.log('📦 Installing Python dependencies...');
  execSync('pip install -e .', { 
    cwd: discoveryPath, 
    stdio: 'inherit',
    env: { ...process.env, PIP_USER: 'false' }
  });
  
  console.log('🗄️  Setting up database...');
  execSync('hndisc migrate-db', { 
    cwd: discoveryPath, 
    stdio: 'inherit' 
  });
  
  console.log('🔍 Running initial discovery pipeline...');
  execSync('hndisc full-pipeline', { 
    cwd: discoveryPath, 
    stdio: 'inherit' 
  });
  
  console.log('✅ Discovery Feed System setup complete!');
  console.log('📊 Check your Railway logs for detailed output');
  console.log('🌐 Your discovery pages will be available at:');
  console.log('   https://holler.news/discover/');
  console.log('   https://holler.news/sitemap-index.xml');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('📋 Make sure you have set the RAILWAY_DATABASE_URL environment variable');
  process.exit(1);
}
