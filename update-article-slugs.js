const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Generate unique article slug
function generateUniqueArticleSlug(title, city) {
  if (!title || !city) return '';
  const citySlug = city.toLowerCase().replace(/\s+/g, '-');
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  return `${citySlug}-${titleSlug}`;
}

async function updateArticleSlugs() {
  try {
    console.log('🔄 Updating article slugs...');
    
    // Get all articles (no limit)
    const result = await pool.query('SELECT id, title, city FROM articles ORDER BY id ASC');
    
    console.log(`Found ${result.rows.length} articles to update`);
    
    let updated = 0;
    let failed = 0;
    const usedSlugs = new Set();
    
    for (const article of result.rows) {
      try {
        let newSlug = generateUniqueArticleSlug(article.title, article.city);
        
        // Handle duplicate slugs by adding a numeric suffix
        let slugAttempt = newSlug;
        let counter = 1;
        while (usedSlugs.has(slugAttempt)) {
          slugAttempt = `${newSlug}-${counter}`;
          counter++;
        }
        
        usedSlugs.add(slugAttempt);
        
        await pool.query(
          'UPDATE articles SET slug = $1 WHERE id = $2',
          [slugAttempt, article.id]
        );
        
        updated++;
        if (updated % 10 === 0) {
          console.log(`Progress: ${updated}/${result.rows.length} articles updated...`);
        }
      } catch (error) {
        console.error(`Failed to update article ${article.id}:`, error.message);
        failed++;
      }
    }
    
    console.log('✅ Article slugs updated successfully!');
    console.log(`   Updated: ${updated}`);
    console.log(`   Failed: ${failed}`);
  } catch (error) {
    console.error('❌ Error updating article slugs:', error);
  } finally {
    await pool.end();
  }
}

updateArticleSlugs();
