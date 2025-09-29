#!/usr/bin/env node

/**
 * Script to generate local flavor for all 1,682 cities
 * This will take some time and cost money, but will give us complete coverage
 */

const ComprehensiveLocalFlavor = require('./comprehensive-local-flavor');

async function generateAllLocalFlavor() {
  console.log('🚀 Starting comprehensive local flavor generation for all cities');
  console.log('💰 This will cost approximately $15-25 in AI API calls');
  console.log('⏱️ Estimated time: 30-45 minutes');
  console.log('');
  
  const localFlavor = new ComprehensiveLocalFlavor();
  
  try {
    await localFlavor.generateAllCitiesLocalFlavor();
    
    console.log('');
    console.log('🎉 Local flavor generation complete!');
    console.log('📊 All cities now have local flavor data');
    console.log('💾 Data cached for future use');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. Update content variety system to use comprehensive local flavor');
    console.log('2. Test the updated system');
    console.log('3. Deploy to production');
    
  } catch (error) {
    console.error('❌ Error generating local flavor:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateAllLocalFlavor();
}

module.exports = { generateAllLocalFlavor };

