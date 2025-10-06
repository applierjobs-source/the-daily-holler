#!/usr/bin/env node

/**
 * Google News Scraper
 * 
 * Scrapes the first news result from Google News for a given city
 * and extracts the article content for translation to Patois.
 */

const https = require('https');
const http = require('http');
const cheerio = require('cheerio');

// Configuration
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout
const MAX_RETRIES = 3;

/**
 * Search Google News for a specific city
 */
async function searchGoogleNews(cityName, state) {
  try {
    console.log(`🔍 Searching Google News for ${cityName}, ${state}...`);
    
    // Construct Google News search URL
    const searchQuery = encodeURIComponent(`${cityName} ${state} news today`);
    const googleNewsUrl = `https://news.google.com/search?q=${searchQuery}&hl=en&gl=US&ceid=US:en`;
    
    console.log(`📡 Fetching: ${googleNewsUrl}`);
    
    // Fetch Google News page
    const html = await makeRequest(googleNewsUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!html) {
      throw new Error('Failed to fetch Google News page');
    }
    
    // Parse HTML with Cheerio
    const $ = cheerio.load(html);
    
    // Find the first news article link
    const firstArticle = $('article').first();
    
    if (firstArticle.length === 0) {
      console.log(`⚠️ No articles found for ${cityName}, ${state}`);
      return null;
    }
    
    // Extract article link (Google News uses relative URLs)
    const articleLink = firstArticle.find('a[href^="./articles/"]').attr('href');
    
    if (!articleLink) {
      console.log(`⚠️ No article link found for ${cityName}, ${state}`);
      return null;
    }
    
    // Convert relative URL to absolute URL
    const fullArticleUrl = `https://news.google.com${articleLink.replace('./', '/')}`;
    
    console.log(`📰 Found article: ${fullArticleUrl}`);
    
    // Extract article metadata
    const title = firstArticle.find('h3').text().trim();
    const source = firstArticle.find('div[data-testid="source-name"]').text().trim();
    const timeAgo = firstArticle.find('time').text().trim();
    
    return {
      url: fullArticleUrl,
      title: title,
      source: source,
      timeAgo: timeAgo,
      searchQuery: `${cityName} ${state} news today`
    };
    
  } catch (error) {
    console.error(`❌ Error searching Google News for ${cityName}, ${state}:`, error.message);
    return null;
  }
}

/**
 * Extract article content from the actual news source
 */
async function extractArticleContent(articleInfo) {
  try {
    console.log(`📄 Extracting content from: ${articleInfo.url}`);
    
    // For Google News URLs, we need to follow redirects to get the actual article
    const html = await makeRequest(articleInfo.url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      followRedirects: true
    });
    
    if (!html) {
      throw new Error('Failed to fetch article content');
    }
    
    const $ = cheerio.load(html);
    
    // Try to extract article content using common selectors
    let content = '';
    
    // Common article content selectors
    const contentSelectors = [
      'article .article-body',
      'article .content',
      'article .post-content',
      'article .entry-content',
      'article .story-body',
      'article .article-content',
      '.article-body',
      '.content',
      '.post-content',
      '.entry-content',
      '.story-body',
      '.article-content',
      'main article',
      'main .content',
      '[data-testid="article-body"]',
      '.ArticleBody'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 100) { // Ensure we have substantial content
          break;
        }
      }
    }
    
    // If no content found with selectors, try to get all paragraph text
    if (!content || content.length < 100) {
      content = $('p').map((i, el) => $(el).text().trim()).get().join(' ').trim();
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    if (content.length < 50) {
      console.log(`⚠️ Insufficient content extracted (${content.length} chars) for ${articleInfo.url}`);
      return null;
    }
    
    console.log(`✅ Extracted ${content.length} characters of content`);
    
    return {
      ...articleInfo,
      content: content,
      wordCount: content.split(' ').length
    };
    
  } catch (error) {
    console.error(`❌ Error extracting content from ${articleInfo.url}:`, error.message);
    return null;
  }
}

/**
 * Make HTTP request with retry logic
 */
async function makeRequest(url, options = {}, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const req = client.request(url, {
          ...options,
          timeout: REQUEST_TIMEOUT,
          headers: {
            'User-Agent': USER_AGENT,
            ...options.headers
          }
        }, (res) => {
          let data = '';
          
          // Handle gzip encoding
          if (res.headers['content-encoding'] === 'gzip') {
            const zlib = require('zlib');
            const gunzip = zlib.createGunzip();
            res.pipe(gunzip);
            gunzip.on('data', chunk => data += chunk);
            gunzip.on('end', () => resolve(data));
            gunzip.on('error', reject);
          } else {
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
          }
        });

        req.on('error', (err) => {
          if (attempt < retries) {
            console.log(`⏳ Retrying in ${Math.pow(2, attempt)} seconds...`);
            setTimeout(() => {
              makeRequest(url, options, retries - attempt).then(resolve).catch(reject);
            }, Math.pow(2, attempt) * 1000);
          } else {
            reject(err);
          }
        });

        req.on('timeout', () => {
          req.destroy();
          if (attempt < retries) {
            console.log(`⏳ Request timeout, retrying in ${Math.pow(2, attempt)} seconds...`);
            setTimeout(() => {
              makeRequest(url, options, retries - attempt).then(resolve).catch(reject);
            }, Math.pow(2, attempt) * 1000);
          } else {
            reject(new Error('Request timeout'));
          }
        });

        req.end();
      });
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`⏳ Retrying in ${Math.pow(2, attempt)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Main function to get news article for a city
 */
async function getNewsForCity(cityName, state) {
  try {
    console.log(`🌍 Getting news for ${cityName}, ${state}...`);
    
    // Search Google News
    const articleInfo = await searchGoogleNews(cityName, state);
    
    if (!articleInfo) {
      return {
        success: false,
        error: 'No news articles found',
        cityName,
        state
      };
    }
    
    // Extract article content
    const fullArticle = await extractArticleContent(articleInfo);
    
    if (!fullArticle) {
      return {
        success: false,
        error: 'Failed to extract article content',
        cityName,
        state,
        articleInfo
      };
    }
    
    return {
      success: true,
      article: fullArticle,
      cityName,
      state
    };
    
  } catch (error) {
    console.error(`❌ Error getting news for ${cityName}, ${state}:`, error.message);
    return {
      success: false,
      error: error.message,
      cityName,
      state
    };
  }
}

module.exports = {
  getNewsForCity,
  searchGoogleNews,
  extractArticleContent
};