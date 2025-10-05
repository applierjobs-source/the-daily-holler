#!/usr/bin/env node

/**
 * Node.js script to run discovery feed setup on Railway
 * This provides a fallback if GitHub Actions isn't working
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running Discovery Feed Setup...');

// Check if we're in production (Railway)
const isProduction = process.env.NODE_ENV === 'production';
const discoveryPath = path.join(__dirname, 'holler-discovery');

console.log('Environment:', isProduction ? 'Production (Railway)' : 'Development');
console.log('Discovery path:', discoveryPath);

// Check if discovery directory exists
if (!fs.existsSync(discoveryPath)) {
  console.log('❌ Discovery directory not found. GitHub Actions should generate the files.');
  console.log('📋 Please run the GitHub Actions workflow manually:');
  console.log('   1. Go to: https://github.com/applierjobs-source/the-daily-holler/actions');
  console.log('   2. Click "Discovery Feed Nightly Build"');
  console.log('   3. Click "Run workflow"');
  process.exit(0);
}

// Check if Python is available
const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

console.log('🐍 Checking for Python...');

const checkPython = spawn(pythonCommand, ['--version'], { 
  cwd: discoveryPath,
  stdio: 'pipe' 
});

checkPython.on('close', (code) => {
  if (code !== 0) {
    console.log('❌ Python not available. GitHub Actions will handle discovery feed generation.');
    console.log('📋 The discovery feed will be available after GitHub Actions runs.');
    process.exit(0);
  }

  console.log('✅ Python found, running discovery setup...');
  
  // Run the discovery pipeline
  const discoveryProcess = spawn(pythonCommand, ['-m', 'holler_discovery.cli', 'full-pipeline'], {
    cwd: discoveryPath,
    stdio: 'inherit',
    env: { ...process.env }
  });

  discoveryProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Discovery feed setup completed successfully!');
      console.log('🌐 Your discovery pages are now available at:');
      console.log('   https://holler.news/discover/');
      console.log('   https://holler.news/sitemap-index.xml');
    } else {
      console.log('❌ Discovery setup failed. Check the logs above.');
      console.log('📋 GitHub Actions will handle discovery feed generation.');
    }
  });

  discoveryProcess.on('error', (error) => {
    console.error('❌ Error running discovery setup:', error.message);
    console.log('📋 GitHub Actions will handle discovery feed generation.');
  });
});

checkPython.on('error', (error) => {
  console.log('❌ Python not available:', error.message);
  console.log('📋 GitHub Actions will handle discovery feed generation.');
});
