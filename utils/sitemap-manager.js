const fs = require('fs').promises;
const path = require('path');

/**
 * Sitemap Manager
 * Handles updating the sitemap.xml with article URLs
 */

const SITEMAP_PATH = path.join(__dirname, '..', 'client', 'public', 'sitemap.xml');
const BUILD_SITEMAP_PATH = path.join(__dirname, '..', 'client', 'build', 'sitemap.xml');
const SITE_URL = 'https://holler.news';

// Static pages that should always be in the sitemap
const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/cities', priority: '0.8', changefreq: 'weekly' },
  { loc: '/news', priority: '0.8', changefreq: 'daily' },
  { loc: '/jobs', priority: '0.7', changefreq: 'daily' },
  { loc: '/about', priority: '0.5', changefreq: 'monthly' }
];

/**
 * Generate XML for a URL entry
 */
function generateUrlEntry(loc, lastmod, changefreq = 'weekly', priority = '0.6') {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Load articles from the database
 * Now queries PostgreSQL instead of JSON file
 */
async function loadArticles(pool) {
  try {
    // If no pool provided, fall back to JSON file (for backwards compatibility)
    if (!pool) {
      console.log('⚠️  No database pool provided, falling back to JSON file');
      const articlesPath = path.join(__dirname, '..', 'server', 'data', 'articles.json');
      const articlesData = await fs.readFile(articlesPath, 'utf8');
      const parsed = JSON.parse(articlesData);
      return parsed.articles || [];
    }

    // Query all articles from PostgreSQL database
    console.log('🔍 Querying all articles from database...');
    const result = await pool.query(`
      SELECT 
        id, 
        title, 
        city, 
        state, 
        slug, 
        published_at,
        created_at
      FROM articles 
      ORDER BY published_at DESC, id DESC
    `);
    
    console.log(`✅ Retrieved ${result.rows.length} articles from database`);
    
    // Transform database rows to match expected format
    return result.rows.map(row => ({
      id: row.id,
      headline: row.title,
      cityName: row.city,
      state: row.state,
      slug: row.slug,
      publishedAt: row.published_at || row.created_at
    }));
  } catch (error) {
    console.error('❌ Error loading articles:', error);
    throw error;
  }
}

/**
 * Generate a slug from article data
 */
function generateSlug(article) {
  // Use existing slug if available
  if (article.slug) {
    return article.slug;
  }
  
  // Generate from headline
  if (article.headline) {
    return article.headline
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  
  // Fallback to ID
  return `article-${article.id}`;
}

/**
 * Generate article URL path
 */
function generateArticlePath(article) {
  const citySlug = article.cityName 
    ? article.cityName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    : 'unknown';
  const stateSlug = article.state 
    ? article.state.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    : 'unknown';
  const slug = generateSlug(article);
  
  return `/news/${stateSlug}/${citySlug}/${slug}`;
}

/**
 * Get last modified date for an article
 */
function getLastModDate(article) {
  if (article.publishedAt) {
    const date = new Date(article.publishedAt);
    return date.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Update sitemap with all articles
 * @param {Object} pool - PostgreSQL connection pool
 */
async function updateSitemap(pool = null) {
  try {
    console.log('🗺️  Updating sitemap...');
    
    const articles = await loadArticles(pool);
    console.log(`📰 Found ${articles.length} articles to add to sitemap`);
    
    // Generate sitemap content
    let sitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    const today = new Date().toISOString().split('T')[0];
    for (const page of STATIC_PAGES) {
      sitemapContent += generateUrlEntry(page.loc, today, page.changefreq, page.priority) + '\n';
    }
    
    // Add all articles
    for (const article of articles) {
      const articlePath = generateArticlePath(article);
      const lastmod = getLastModDate(article);
      sitemapContent += generateUrlEntry(articlePath, lastmod, 'weekly', '0.6') + '\n';
    }
    
    sitemapContent += '</urlset>\n';
    
    // Write to public directory
    await fs.writeFile(SITEMAP_PATH, sitemapContent, 'utf8');
    console.log(`✅ Sitemap updated: ${SITEMAP_PATH}`);
    
    // Also update build directory if it exists
    try {
      await fs.access(BUILD_SITEMAP_PATH);
      await fs.writeFile(BUILD_SITEMAP_PATH, sitemapContent, 'utf8');
      console.log(`✅ Build sitemap updated: ${BUILD_SITEMAP_PATH}`);
    } catch (error) {
      // Build directory doesn't exist, that's okay
      console.log('ℹ️  Build directory not found, skipping build sitemap update');
    }
    
    console.log(`🎉 Sitemap update complete! Added ${articles.length} articles`);
    return { success: true, articleCount: articles.length };
    
  } catch (error) {
    console.error('❌ Error updating sitemap:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add a single article to the sitemap (incremental update)
 */
async function addArticleToSitemap(article) {
  try {
    // Read current sitemap
    let sitemapContent = await fs.readFile(SITEMAP_PATH, 'utf8');
    
    // Generate new URL entry
    const articlePath = generateArticlePath(article);
    const lastmod = getLastModDate(article);
    const urlEntry = generateUrlEntry(articlePath, lastmod, 'weekly', '0.6');
    
    // Insert before closing </urlset> tag
    sitemapContent = sitemapContent.replace('</urlset>', `${urlEntry}\n</urlset>`);
    
    // Write back
    await fs.writeFile(SITEMAP_PATH, sitemapContent, 'utf8');
    
    // Also update build directory if it exists
    try {
      await fs.access(BUILD_SITEMAP_PATH);
      await fs.writeFile(BUILD_SITEMAP_PATH, sitemapContent, 'utf8');
    } catch (error) {
      // Build directory doesn't exist, that's okay
    }
    
    console.log(`✅ Added article to sitemap: ${articlePath}`);
    return { success: true, path: articlePath };
    
  } catch (error) {
    console.error('❌ Error adding article to sitemap:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  updateSitemap()
    .then(result => {
      console.log('Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  updateSitemap,
  addArticleToSitemap,
  generateArticlePath,
  generateSlug
};



