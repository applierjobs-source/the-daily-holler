const https = require('https');
const cheerio = require('cheerio');

/**
 * Google News Scraper
 * Scrapes the latest news articles from Google News for a specific city
 */

class GoogleNewsScraper {
  constructor() {
    this.baseUrl = 'https://news.google.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Scrape Google News for a specific city
   * @param {string} cityName - Name of the city
   * @param {string} state - State abbreviation
   * @returns {Promise<Array>} Array of news articles
   */
  async scrapeNewsForCity(cityName, state) {
    try {
      console.log(`🔍 Scraping Google News for ${cityName}, ${state}...`);
      
      // Construct search query for the city
      const searchQuery = `${cityName} ${state} news`;
      const encodedQuery = encodeURIComponent(searchQuery);
      const newsUrl = `https://news.google.com/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US%3Aen`;
      
      console.log(`📡 Fetching: ${newsUrl}`);
      
      const html = await this.fetchPage(newsUrl);
      const articles = this.parseNewsResults(html, cityName, state);
      
      console.log(`✅ Found ${articles.length} news articles for ${cityName}, ${state}`);
      return articles;
      
    } catch (error) {
      console.error(`❌ Error scraping news for ${cityName}, ${state}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch a web page
   * @param {string} url - URL to fetch
   * @returns {Promise<string>} HTML content
   */
  async fetchPage(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
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
   * Parse Google News HTML results
   * @param {string} html - HTML content
   * @param {string} cityName - City name for filtering
   * @param {string} state - State for filtering
   * @returns {Array} Parsed articles
   */
  parseNewsResults(html, cityName, state) {
    const articles = [];
    
    try {
      const $ = cheerio.load(html);
      
      // Google News structure - look for article containers
      $('article').each((index, element) => {
        if (index >= 5) return false; // Limit to first 5 articles
        
        const $article = $(element);
        
        // Extract title
        const titleElement = $article.find('h3 a, h4 a').first();
        const title = titleElement.text().trim();
        
        if (!title) return;
        
        // Extract source
        const sourceElement = $article.find('[data-testid="source-name"]').first();
        const source = sourceElement.text().trim() || 'Unknown Source';
        
        // Extract snippet
        const snippetElement = $article.find('[data-testid="snippet"]').first();
        const snippet = snippetElement.text().trim();
        
        // Extract time
        const timeElement = $article.find('time').first();
        const timeText = timeElement.attr('datetime') || timeElement.text().trim();
        
        // Extract link (Google News uses relative URLs)
        const linkElement = $article.find('a').first();
        const relativeUrl = linkElement.attr('href');
        const fullUrl = relativeUrl ? this.baseUrl + relativeUrl.substring(1) : '';
        
        // Filter for city relevance
        const isCityRelevant = this.isArticleRelevantToCity(title, snippet, cityName, state);
        
        if (isCityRelevant && title && snippet) {
          articles.push({
            title: title,
            snippet: snippet,
            source: source,
            publishedAt: timeText,
            url: fullUrl,
            cityName: cityName,
            state: state,
            relevance: this.calculateRelevance(title, snippet, cityName, state)
          });
        }
      });
      
      // Sort by relevance and return the most relevant article
      articles.sort((a, b) => b.relevance - a.relevance);
      
    } catch (error) {
      console.error('❌ Error parsing news results:', error.message);
    }
    
    return articles;
  }

  /**
   * Check if article is relevant to the city
   * @param {string} title - Article title
   * @param {string} snippet - Article snippet
   * @param {string} cityName - Target city name
   * @param {string} state - Target state
   * @returns {boolean} Is relevant
   */
  isArticleRelevantToCity(title, snippet, cityName, state) {
    const text = (title + ' ' + snippet).toLowerCase();
    const cityLower = cityName.toLowerCase();
    const stateLower = state.toLowerCase();
    
    // Check for city name mentions
    const cityMentioned = text.includes(cityLower);
    
    // Check for state mentions
    const stateMentioned = text.includes(stateLower);
    
    // Check for local keywords
    const localKeywords = ['local', 'city', 'town', 'community', 'residents', 'area', 'region'];
    const hasLocalKeywords = localKeywords.some(keyword => text.includes(keyword));
    
    // Article is relevant if it mentions the city/state or has local keywords
    return cityMentioned || stateMentioned || hasLocalKeywords;
  }

  /**
   * Calculate relevance score for an article
   * @param {string} title - Article title
   * @param {string} snippet - Article snippet
   * @param {string} cityName - Target city name
   * @param {string} state - Target state
   * @returns {number} Relevance score (0-100)
   */
  calculateRelevance(title, snippet, cityName, state) {
    const text = (title + ' ' + snippet).toLowerCase();
    const cityLower = cityName.toLowerCase();
    const stateLower = state.toLowerCase();
    
    let score = 0;
    
    // City name in title gets highest score
    if (title.toLowerCase().includes(cityLower)) {
      score += 50;
    }
    
    // City name in snippet
    if (snippet.toLowerCase().includes(cityLower)) {
      score += 30;
    }
    
    // State name in title
    if (title.toLowerCase().includes(stateLower)) {
      score += 20;
    }
    
    // State name in snippet
    if (snippet.toLowerCase().includes(stateLower)) {
      score += 10;
    }
    
    // Local keywords bonus
    const localKeywords = ['local', 'city', 'town', 'community', 'residents'];
    localKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 5;
      }
    });
    
    return Math.min(score, 100);
  }

  /**
   * Get the most relevant news article for a city
   * @param {string} cityName - City name
   * @param {string} state - State abbreviation
   * @returns {Promise<Object|null>} Most relevant article or null
   */
  async getMostRelevantNews(cityName, state) {
    try {
      const articles = await this.scrapeNewsForCity(cityName, state);
      
      if (articles.length === 0) {
        console.log(`⚠️ No relevant news found for ${cityName}, ${state}, using fallback`);
        return this.getFallbackNews(cityName, state);
      }
      
      const mostRelevant = articles[0];
      console.log(`✅ Found most relevant news for ${cityName}, ${state}: "${mostRelevant.title}"`);
      
      return mostRelevant;
      
    } catch (error) {
      console.error(`❌ Error getting most relevant news for ${cityName}, ${state}:`, error.message);
      console.log(`🔄 Using fallback news for ${cityName}, ${state}`);
      return this.getFallbackNews(cityName, state);
    }
  }

  /**
   * Generate fallback news when scraping fails
   * @param {string} cityName - City name
   * @param {string} state - State abbreviation
   * @returns {Object} Fallback news article
   */
  getFallbackNews(cityName, state) {
    const fallbackNews = [
      {
        title: `${cityName} Community Events Bring Residents Together`,
        snippet: `Local residents in ${cityName}, ${state} are coming together for various community events this week. The city continues to see strong community engagement with local organizations hosting events throughout the area.`,
        source: 'Local News Network',
        publishedAt: new Date().toISOString(),
        url: `https://example.com/news/${cityName.toLowerCase().replace(/\s+/g, '-')}`,
        cityName: cityName,
        state: state,
        relevance: 100,
        isFallback: true
      },
      {
        title: `${cityName} Sees Continued Growth in Local Business Sector`,
        snippet: `The business community in ${cityName}, ${state} is experiencing positive growth with new establishments opening and existing businesses expanding their operations. Local officials are optimistic about the economic outlook.`,
        source: 'Business Today',
        publishedAt: new Date().toISOString(),
        url: `https://example.com/business/${cityName.toLowerCase().replace(/\s+/g, '-')}`,
        cityName: cityName,
        state: state,
        relevance: 95,
        isFallback: true
      },
      {
        title: `${cityName} Residents Enjoy Seasonal Activities and Local Attractions`,
        snippet: `With the changing seasons, residents of ${cityName}, ${state} are taking advantage of local parks, recreational facilities, and community centers. The city offers numerous opportunities for outdoor activities and family fun.`,
        source: 'Community Times',
        publishedAt: new Date().toISOString(),
        url: `https://example.com/community/${cityName.toLowerCase().replace(/\s+/g, '-')}`,
        cityName: cityName,
        state: state,
        relevance: 90,
        isFallback: true
      }
    ];

    // Return a random fallback news item
    const randomIndex = Math.floor(Math.random() * fallbackNews.length);
    const selectedNews = fallbackNews[randomIndex];
    
    console.log(`📰 Using fallback news for ${cityName}, ${state}: "${selectedNews.title}"`);
    return selectedNews;
  }
}

module.exports = GoogleNewsScraper;