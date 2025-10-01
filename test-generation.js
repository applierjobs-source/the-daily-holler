const { Pool } = require('pg');

// Use production database
const pool = new Pool({
  connectionString: 'postgresql://postgres:password@containers-us-west-146.railway.app:6543/railway',
  ssl: { rejectUnauthorized: false }
});

async function testGeneration() {
  try {
    console.log('🧪 Testing article generation...');
    
    // Test database connection
    const result = await pool.query('SELECT COUNT(*) FROM articles');
    console.log(`📊 Current articles in database: ${result.rows[0].count}`);
    
    // Insert a test article
    const testArticle = {
      title: 'Test Article for October 1st',
      content: 'This is a test article to verify the system is working.',
      city: 'Test City',
      state: 'TS',
      slug: 'test-city-test-article-for-october-1st',
      theme: 'test',
      is_today: true,
      published_at: new Date()
    };
    
    await pool.query(`
      INSERT INTO articles (title, content, city, state, slug, theme, is_today, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      testArticle.title,
      testArticle.content,
      testArticle.city,
      testArticle.state,
      testArticle.slug,
      testArticle.theme,
      testArticle.is_today,
      testArticle.published_at
    ]);
    
    console.log('✅ Test article inserted successfully');
    
    // Check total again
    const newResult = await pool.query('SELECT COUNT(*) FROM articles');
    console.log(`📊 New total articles: ${newResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testGeneration();
