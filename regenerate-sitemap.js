#!/usr/bin/env node

/**
 * Regenerate Sitemap from Database
 * This script queries all articles from the PostgreSQL database
 * and regenerates the sitemap.xml files
 */

const { Pool } = require('pg');
const { updateSitemap } = require('./utils/sitemap-manager');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:uFyjKulFQOkfcqvFLKFXEAwLEAfkWMFZ@shortline.proxy.rlwy.net:18373/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

async function main() {
  try {
    console.log('🚀 Starting sitemap regeneration...');
    console.log('📊 Database:', process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using default connection');
    
    // Test database connection
    const testResult = await pool.query('SELECT COUNT(*) as count FROM articles');
    const articleCount = testResult.rows[0].count;
    console.log(`✅ Database connected! Found ${articleCount} articles`);
    
    // Regenerate sitemap
    console.log('\n🔄 Regenerating sitemap...');
    const result = await updateSitemap(pool);
    
    if (result.success) {
      console.log('\n✅ Sitemap regeneration complete!');
      console.log(`📝 Added ${result.articleCount} articles to sitemap`);
      console.log('📍 Updated files:');
      console.log('   - client/public/sitemap.xml');
      console.log('   - client/build/sitemap.xml');
      process.exit(0);
    } else {
      console.error('\n❌ Sitemap regeneration failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

