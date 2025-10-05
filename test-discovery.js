#!/usr/bin/env node

/**
 * Quick test script for Discovery Feed System
 * Tests the system without requiring full deployment
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing Discovery Feed System...');

try {
  const discoveryPath = path.join(__dirname, 'holler-discovery');
  
  // Test if we can import the modules
  console.log('📦 Testing Python installation...');
  execSync('python -c "import holler_discovery; print(\'✅ Module imported successfully\')"', { 
    cwd: discoveryPath, 
    stdio: 'inherit' 
  });
  
  // Test CLI help
  console.log('🔧 Testing CLI interface...');
  execSync('hndisc --help', { 
    cwd: discoveryPath, 
    stdio: 'inherit' 
  });
  
  console.log('✅ All tests passed!');
  console.log('🚀 Ready for deployment');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.log('💡 Make sure Python and pip are installed');
  process.exit(1);
}
