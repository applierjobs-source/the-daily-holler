const https = require('https');
const http = require('http');
const cheerio = require('cheerio');

/**
 * Enhanced News Scraper
 * Scrapes news from multiple sources including Google News and RSS feeds
 */

class NewsScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.rssFeeds = [
      'https://feeds.feedburner.com/oreilly/radar',
      'https://rss.cnn.com/rss/edition.rss',
      'https://feeds.bbci.co.uk/news/rss.xml',
      'https://feeds.reuters.com/reuters/technologyNews',
      'https://feeds.npr.org/1001/rss.xml'
    ];
  }

  /**
   * Get news for a specific city from multiple sources
   * @param {string} cityName - Name of the city
   * @param {string} state - State abbreviation
   * @returns {Promise<Object|null>} News article or null
   */
  async getNewsForCity(cityName, state) {
    console.log(`🔍 Getting news for ${cityName}, ${state}...`);
    
    // Try multiple sources in order of preference
    const sources = [
      () => this.scrapeGoogleNews(cityName, state),
      () => this.scrapeRSSFeeds(cityName, state)
    ];

    for (const source of sources) {
      try {
        const result = await source();
        if (result) {
          console.log(`✅ Found news from ${result.source}: "${result.title}"`);
          return result;
        }
      } catch (error) {
        console.log(`⚠️ Source failed: ${error.message}`);
        continue;
      }
    }

    console.log(`❌ No news found for ${cityName}, ${state}`);
    return null;
  }

  /**
   * Scrape Google News with improved parsing
   */
  async scrapeGoogleNews(cityName, state) {
    try {
      console.log(`📰 Scraping Google News for ${cityName}, ${state}...`);
      
      const searchQuery = encodeURIComponent(`${cityName} ${state} news`);
      const newsUrl = `https://news.google.com/rss/search?q=${searchQuery}&hl=en-US&gl=US&ceid=US:en`;
      
      console.log(`📡 Fetching RSS: ${newsUrl}`);
      
      const xml = await this.fetchPage(newsUrl);
      const articles = this.parseRSSFeed(xml, cityName, state);
      
      if (articles.length > 0) {
        return articles[0]; // Return most recent article
      }
      
      return null;
    } catch (error) {
      console.log(`❌ Google News scraping failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Scrape RSS feeds for city-specific news
   */
  async scrapeRSSFeeds(cityName, state) {
    try {
      console.log(`📡 Checking RSS feeds for ${cityName}, ${state}...`);
      
      for (const feedUrl of this.rssFeeds) {
        try {
          const xml = await this.fetchPage(feedUrl);
          const articles = this.parseRSSFeed(xml, cityName, state);
          
          if (articles.length > 0) {
            console.log(`✅ Found ${articles.length} articles from RSS feed`);
            return articles[0];
          }
        } catch (error) {
          console.log(`⚠️ RSS feed failed: ${error.message}`);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.log(`❌ RSS scraping failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse RSS XML feed
   */
  parseRSSFeed(xml, cityName, state) {
    const articles = [];
    
    try {
      const $ = cheerio.load(xml, { xmlMode: true });
      
      $('item').each((index, element) => {
        if (index >= 5) return false; // Limit to 5 articles
        
        const $item = $(element);
        const title = $item.find('title').text().trim();
        const description = $item.find('description').text().trim();
        const link = $item.find('link').text().trim();
        const pubDate = $item.find('pubDate').text().trim();
        
        if (!title || !description) return;
        
        // Check if article is relevant to the city
        const isRelevant = this.isArticleRelevant(title, description, cityName, state);
        
        if (isRelevant) {
          articles.push({
            title: title,
            snippet: description,
            source: 'RSS Feed',
            publishedAt: pubDate,
            url: link,
            cityName: cityName,
            state: state,
            relevance: this.calculateRelevance(title, description, cityName, state)
          });
        }
      });
      
      // Sort by relevance
      articles.sort((a, b) => b.relevance - a.relevance);
      
    } catch (error) {
      console.error('❌ Error parsing RSS feed:', error.message);
    }
    
    return articles;
  }


  /**
   * Fetch a web page
   */
  async fetchPage(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const request = protocol.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        }
      }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          resolve(data);
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Check if article is relevant to the city
   */
  isArticleRelevant(title, description, cityName, state) {
    const text = (title + ' ' + description).toLowerCase();
    const cityLower = cityName.toLowerCase();
    const stateLower = state.toLowerCase();
    
    // Check for city name mentions
    const cityMentioned = text.includes(cityLower);
    
    // Check for state mentions
    const stateMentioned = text.includes(stateLower);
    
    // Check for local keywords
    const localKeywords = ['local', 'city', 'town', 'community', 'residents', 'area', 'region', 'district'];
    const hasLocalKeywords = localKeywords.some(keyword => text.includes(keyword));
    
    return cityMentioned || stateMentioned || hasLocalKeywords;
  }

  /**
   * Calculate relevance score for an article
   */
  calculateRelevance(title, description, cityName, state) {
    const text = (title + ' ' + description).toLowerCase();
    const cityLower = cityName.toLowerCase();
    const stateLower = state.toLowerCase();
    
    let score = 0;
    
    // City name in title gets highest score
    if (title.toLowerCase().includes(cityLower)) {
      score += 50;
    }
    
    // City name in description
    if (description.toLowerCase().includes(cityLower)) {
      score += 30;
    }
    
    // State name in title
    if (title.toLowerCase().includes(stateLower)) {
      score += 20;
    }
    
    // State name in description
    if (description.toLowerCase().includes(stateLower)) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }
}

module.exports = NewsScraper;
