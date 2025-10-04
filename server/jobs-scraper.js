const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class JobsScraper {
  constructor() {
    this.cities = [];
    this.jobsData = [];
    this.rateLimitDelay = 2000; // 2 seconds between requests (conservative for Craigslist)
    this.craigslistDelay = 3000; // 3 seconds for Craigslist specifically
    this.maxRetries = 3;
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  // Load cities data
  async loadCities() {
    try {
      const citiesPath = path.join(__dirname, 'data/cities.json');
      const citiesData = await fs.readFile(citiesPath, 'utf8');
      this.cities = JSON.parse(citiesData);
      console.log(`✅ Loaded ${this.cities.length} cities`);
    } catch (error) {
      console.error('❌ Error loading cities:', error);
      throw error;
    }
  }

  // Map city to Craigslist subdomain
  getCraigslistUrl(city) {
    const cityName = city.name.toLowerCase().replace(/\s+/g, '');
    const stateName = city.stateName.toLowerCase().replace(/\s+/g, '');
    
    // Common Craigslist subdomain mappings
    const mappings = {
      'atlanta': 'atlanta',
      'austin': 'austin',
      'boston': 'boston',
      'chicago': 'chicago',
      'dallas': 'dallas',
      'denver': 'denver',
      'detroit': 'detroit',
      'houston': 'houston',
      'lasvegas': 'lasvegas',
      'losangeles': 'losangeles',
      'miami': 'miami',
      'newyork': 'newyork',
      'phoenix': 'phoenix',
      'portland': 'portland',
      'sanfrancisco': 'sfbay',
      'seattle': 'seattle',
      'washington': 'washingtondc'
    };

    // Check for direct city mapping - try search URL first
    if (mappings[cityName]) {
      return `https://${mappings[cityName]}.craigslist.org/search/jjj`;
    }

    // For smaller cities, they often fall under regional subdomains
    const regionalMappings = {
      'AL': 'bham', // Alabama
      'AK': 'anchorage',
      'AZ': 'phoenix',
      'AR': 'littlerock',
      'CA': 'sfbay',
      'CO': 'denver',
      'CT': 'hartford',
      'DE': 'delaware',
      'FL': 'miami',
      'GA': 'atlanta',
      'HI': 'honolulu',
      'ID': 'boise',
      'IL': 'chicago',
      'IN': 'indianapolis',
      'IA': 'desmoines',
      'KS': 'kansascity',
      'KY': 'louisville',
      'LA': 'neworleans',
      'ME': 'maine',
      'MD': 'baltimore',
      'MA': 'boston',
      'MI': 'detroit',
      'MN': 'minneapolis',
      'MS': 'jackson',
      'MO': 'kansascity',
      'MT': 'montana',
      'NE': 'omaha',
      'NV': 'lasvegas',
      'NH': 'nh',
      'NJ': 'newjersey',
      'NM': 'albuquerque',
      'NY': 'newyork',
      'NC': 'raleigh',
      'ND': 'fargo',
      'OH': 'columbus',
      'OK': 'oklahomacity',
      'OR': 'portland',
      'PA': 'philadelphia',
      'RI': 'providence',
      'SC': 'charleston',
      'SD': 'siouxfalls',
      'TN': 'nashville',
      'TX': 'dallas',
      'UT': 'saltlakecity',
      'VT': 'vermont',
      'VA': 'norfolk',
      'WA': 'seattle',
      'WV': 'charlestonwv',
      'WI': 'milwaukee',
      'WY': 'wyoming'
    };

    const regionalUrl = regionalMappings[city.state];
    if (regionalUrl) {
      return `https://${regionalUrl}.craigslist.org/search/jjj`;
    }

    return null; // No mapping found
  }

  // Real Craigslist scraping
  async fetchJobsFromCraigslist(city, maxJobs = 50) {
    try {
      const craigslistUrl = this.getCraigslistUrl(city);
      if (!craigslistUrl) {
        console.log(`⚠️  No Craigslist mapping for ${city.name}, ${city.state}`);
        return {
          source: 'craigslist',
          city: city,
          jobs: [],
          error: 'No URL mapping found'
        };
      }

      console.log(`🔍 Scraping Craigslist jobs from ${craigslistUrl}`);
      
      const response = await axios.get(craigslistUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 30000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      // Debug: Log page content structure
      console.log(`   📄 Page title: ${$('title').text()}`);
      console.log(`   📄 Found ${$('.result-row').length} .result-row elements`);
      console.log(`   📄 Found ${$('[data-pid]').length} [data-pid] elements`);
      console.log(`   📄 Found ${$('a[href*="html"]').length} job links`);
      console.log(`   📄 Found ${$('.cl-static-search-results li').length} search result items`);
      console.log(`   📄 Found ${$('ol.cl-static-search-results li').length} static search results`);

      // Try multiple selectors for job listings
      const selectors = [
        '.cl-static-search-results li',
        '.result-row',
        '[data-pid]',
        '.posting',
        '.result-info',
        'a[href*="/d/jobs/"]',
        'ol.cl-static-search-results li'
      ];

      let foundJobs = false;

      for (const selector of selectors) {
        if (foundJobs) break;

        $(selector).each((index, element) => {
          if (jobs.length >= maxJobs) return false; // Stop if we have enough jobs

          const $element = $(element);
          
          // Try different ways to extract job data
          let titleElement = $element.find('.result-title');
          let title = titleElement.text().trim();
          let jobUrl = titleElement.attr('href');

          // If no title found, try other selectors
          if (!title) {
            titleElement = $element.find('a[href*="html"]').first();
            title = titleElement.text().trim();
            jobUrl = titleElement.attr('href');
          }

          // If still no title, try getting it from the element itself
          if (!title && $element.is('a')) {
            title = $element.text().trim();
            jobUrl = $element.attr('href');
          }

          // Get full URL if relative
          const fullUrl = jobUrl && jobUrl.startsWith('/') ? 
            `https://${new URL(craigslistUrl).hostname}${jobUrl}` : jobUrl;

          // Skip if no title or URL
          if (!title || !fullUrl) return;

          // Extract price/salary info
          const priceElement = $element.find('.result-price, .price');
          const salary = priceElement.text().trim() || null;

          // Extract location info
          const locationElement = $element.find('.result-hood, .hood');
          const hood = locationElement.text().trim();
          
          // Extract posted date
          const dateElement = $element.find('.result-date, .date');
          const dateText = dateElement.attr('title') || dateElement.text().trim();
          
          // Parse the date
          const postedDate = this.parseCraigslistDate(dateText);

          // Extract additional details from the listing
          const metaElement = $element.find('.result-meta, .meta');
          const metaText = metaElement.text().trim();

          if (title && fullUrl) {
            jobs.push({
              id: `craigslist_${city.id}_${Date.now()}_${index}`,
              title: title,
              company: 'Company not specified',
              location: `${city.name}, ${city.state}${hood ? ` (${hood})` : ''}`,
              description: metaText || 'Job details available on Craigslist',
              postedDate: postedDate,
              url: fullUrl,
              source: 'craigslist',
              salary: salary,
              type: this.inferJobType(title, metaText),
              category: this.inferJobCategory(title, metaText)
            });
            foundJobs = true;
          }
        });
      }

      // If still no jobs found, try to find any job-related links
      if (jobs.length === 0) {
        $('a[href*="/d/jobs/"]').each((index, element) => {
          if (jobs.length >= maxJobs) return false;
          
          const $element = $(element);
          const title = $element.text().trim();
          const jobUrl = $element.attr('href');
          
          if (title && jobUrl && !title.toLowerCase().includes('craigslist')) {
            const fullUrl = jobUrl.startsWith('/') ? 
              `https://${new URL(craigslistUrl).hostname}${jobUrl}` : jobUrl;
            
            jobs.push({
              id: `craigslist_${city.id}_${Date.now()}_${index}`,
              title: title,
              company: 'Company not specified',
              location: `${city.name}, ${city.state}`,
              description: 'Job details available on Craigslist',
              postedDate: new Date().toISOString(),
              url: fullUrl,
              source: 'craigslist',
              type: this.inferJobType(title, ''),
              category: this.inferJobCategory(title, '')
            });
          }
        });
      }

      console.log(`✅ Found ${jobs.length} Craigslist jobs for ${city.name}, ${city.state}`);
      
      return {
        source: 'craigslist',
        city: city,
        jobs: jobs,
        url: craigslistUrl
      };

    } catch (error) {
      console.error(`❌ Error scraping Craigslist for ${city.name}:`, error.message);
      return {
        source: 'craigslist',
        city: city,
        jobs: [],
        error: error.message
      };
    }
  }

  // Parse Craigslist date format
  parseCraigslistDate(dateText) {
    try {
      if (!dateText) return new Date().toISOString();
      
      // Handle "Posted: " prefix
      const cleanDate = dateText.replace(/^Posted:\s*/, '');
      
      // Try to parse various Craigslist date formats
      const now = new Date();
      
      if (cleanDate.includes('today') || cleanDate.includes('Today')) {
        return now.toISOString();
      }
      
      if (cleanDate.includes('yesterday') || cleanDate.includes('Yesterday')) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString();
      }
      
      // Try parsing as a regular date
      const parsedDate = new Date(cleanDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
      
      // Default to now if parsing fails
      return now.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  // Infer job type from title and description
  inferJobType(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('part time') || text.includes('part-time')) return 'Part-time';
    if (text.includes('full time') || text.includes('full-time')) return 'Full-time';
    if (text.includes('contract') || text.includes('freelance')) return 'Contract';
    if (text.includes('internship') || text.includes('intern')) return 'Internship';
    if (text.includes('temporary') || text.includes('temp')) return 'Temporary';
    
    return 'Full-time'; // Default assumption
  }

  // Infer job category from title and description
  inferJobCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    const categories = {
      'technology': ['software', 'developer', 'programmer', 'engineer', 'tech', 'it', 'computer', 'data', 'analyst', 'web', 'mobile', 'app'],
      'healthcare': ['nurse', 'doctor', 'medical', 'health', 'care', 'hospital', 'clinic', 'therapist', 'dental', 'pharmacy'],
      'education': ['teacher', 'professor', 'instructor', 'education', 'school', 'university', 'college', 'tutor', 'training'],
      'retail': ['retail', 'sales', 'cashier', 'store', 'shop', 'customer service', 'clerk', 'associate'],
      'food': ['restaurant', 'food', 'cook', 'chef', 'server', 'waiter', 'bartender', 'kitchen', 'cafe'],
      'transportation': ['driver', 'delivery', 'truck', 'uber', 'lyft', 'taxi', 'transport', 'logistics'],
      'construction': ['construction', 'contractor', 'builder', 'carpenter', 'electrician', 'plumber', 'laborer'],
      'office': ['admin', 'administrative', 'office', 'receptionist', 'assistant', 'secretary', 'clerk'],
      'marketing': ['marketing', 'advertising', 'social media', 'content', 'digital', 'brand', 'promotion'],
      'finance': ['accounting', 'finance', 'bank', 'bookkeeper', 'analyst', 'financial', 'audit']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category.charAt(0).toUpperCase() + category.slice(1);
      }
    }
    
    return 'General'; // Default category
  }

  // Alternative job data sources (legitimate APIs)
  async fetchJobsFromIndeed(city, jobQuery = '') {
    // Indeed API would require API key and proper setup
    // This is a placeholder for legitimate job API integration
    console.log(`🔍 Would fetch Indeed jobs for ${city.name}, ${city.state}`);
    
    // Return mock data structure for now
    return {
      source: 'indeed',
      city: city,
      jobs: [
        {
          id: `indeed_${city.id}_${Date.now()}`,
          title: `Sample Job in ${city.name}`,
          company: 'Local Company',
          location: `${city.name}, ${city.state}`,
          description: 'Job description would come from Indeed API',
          postedDate: new Date().toISOString(),
          url: 'https://indeed.com/job/example',
          source: 'indeed'
        }
      ]
    };
  }

  async fetchJobsFromGlassdoor(city, jobQuery = '') {
    // Glassdoor API integration would go here
    console.log(`🔍 Would fetch Glassdoor jobs for ${city.name}, ${city.state}`);
    
    return {
      source: 'glassdoor',
      city: city,
      jobs: [
        {
          id: `glassdoor_${city.id}_${Date.now()}`,
          title: `Glassdoor Job in ${city.name}`,
          company: 'Tech Company',
          location: `${city.name}, ${city.state}`,
          description: 'Job description from Glassdoor',
          postedDate: new Date().toISOString(),
          url: 'https://glassdoor.com/job/example',
          source: 'glassdoor'
        }
      ]
    };
  }

  // Rate limiting helper
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Process a single city
  async processCity(city, sources = ['craigslist', 'indeed', 'glassdoor']) {
    console.log(`🏙️  Processing ${city.name}, ${city.state}...`);
    
    const cityJobs = [];
    
    for (const source of sources) {
      try {
        let sourceJobs;
        
        switch (source) {
          case 'craigslist':
            sourceJobs = await this.fetchJobsFromCraigslist(city, 25); // Limit to 25 per source
            break;
          case 'indeed':
            sourceJobs = await this.fetchJobsFromIndeed(city);
            break;
          case 'glassdoor':
            sourceJobs = await this.fetchJobsFromGlassdoor(city);
            break;
          default:
            console.warn(`⚠️  Unknown source: ${source}`);
            continue;
        }
        
        if (sourceJobs && sourceJobs.jobs) {
          cityJobs.push(...sourceJobs.jobs);
        }
        
        // Rate limiting - be more conservative with Craigslist
        const delay = source === 'craigslist' ? this.craigslistDelay : this.rateLimitDelay;
        await this.delay(delay);
        
      } catch (error) {
        console.error(`❌ Error fetching ${source} jobs for ${city.name}:`, error.message);
      }
    }
    
    return {
      city: city,
      jobs: cityJobs,
      timestamp: new Date().toISOString()
    };
  }

  // Process cities in batches
  async processCitiesBatch(startIndex = 0, batchSize = 10) {
    if (this.cities.length === 0) {
      await this.loadCities();
    }
    
    const endIndex = Math.min(startIndex + batchSize, this.cities.length);
    const batchCities = this.cities.slice(startIndex, endIndex);
    
    console.log(`🚀 Processing batch ${startIndex}-${endIndex} (${batchCities.length} cities)`);
    
    const batchResults = [];
    
    for (const city of batchCities) {
      try {
        const result = await this.processCity(city);
        batchResults.push(result);
      } catch (error) {
        console.error(`❌ Error processing ${city.name}:`, error.message);
        batchResults.push({
          city: city,
          jobs: [],
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return batchResults;
  }

  // Save jobs data to file
  async saveJobsData(jobsData, filename = 'jobs.json') {
    try {
      const jobsPath = path.join(__dirname, 'data', filename);
      await fs.writeFile(jobsPath, JSON.stringify(jobsData, null, 2));
      console.log(`💾 Saved ${jobsData.length} job entries to ${filename}`);
    } catch (error) {
      console.error('❌ Error saving jobs data:', error);
      throw error;
    }
  }

  // Load existing jobs data
  async loadJobsData(filename = 'jobs.json') {
    try {
      const jobsPath = path.join(__dirname, 'data', filename);
      const data = await fs.readFile(jobsPath, 'utf8');
      this.jobsData = JSON.parse(data);
      console.log(`📂 Loaded ${this.jobsData.length} existing job entries`);
      return this.jobsData;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📂 No existing jobs file found, starting fresh');
        this.jobsData = [];
        return [];
      }
      throw error;
    }
  }

  // Merge new jobs with existing data
  mergeJobsData(newJobsData) {
    const existingJobs = new Map();
    
    // Index existing jobs by ID
    this.jobsData.forEach(jobEntry => {
      jobEntry.jobs.forEach(job => {
        existingJobs.set(job.id, job);
      });
    });
    
    // Add new jobs, avoiding duplicates
    let newJobsCount = 0;
    newJobsData.forEach(cityData => {
      cityData.jobs.forEach(job => {
        if (!existingJobs.has(job.id)) {
          existingJobs.set(job.id, job);
          newJobsCount++;
        }
      });
    });
    
    console.log(`🔄 Added ${newJobsCount} new jobs, ${existingJobs.size} total jobs`);
    
    // Convert back to city-based structure
    const cityJobsMap = new Map();
    
    existingJobs.forEach(job => {
      const cityKey = `${job.location}`;
      if (!cityJobsMap.has(cityKey)) {
        cityJobsMap.set(cityKey, []);
      }
      cityJobsMap.get(cityKey).push(job);
    });
    
    this.jobsData = Array.from(cityJobsMap.entries()).map(([cityKey, jobs]) => ({
      cityKey,
      jobs,
      lastUpdated: new Date().toISOString()
    }));
    
    return this.jobsData;
  }

  // Get jobs statistics
  getStats() {
    const totalJobs = this.jobsData.reduce((sum, cityData) => sum + cityData.jobs.length, 0);
    const citiesWithJobs = this.jobsData.length;
    
    return {
      totalJobs,
      citiesWithJobs,
      totalCities: this.cities.length,
      coverage: ((citiesWithJobs / this.cities.length) * 100).toFixed(2) + '%'
    };
  }

  // Main execution method
  async run(batchSize = 10, startIndex = 0) {
    console.log('🚀 Starting Jobs Scraper...');
    
    try {
      // Load existing data
      await this.loadJobsData();
      await this.loadCities();
      
      // Process cities in batches
      const batchResults = await this.processCitiesBatch(startIndex, batchSize);
      
      // Merge with existing data
      const updatedData = this.mergeJobsData(batchResults);
      
      // Save updated data
      await this.saveJobsData(updatedData);
      
      // Show statistics
      const stats = this.getStats();
      console.log('📊 Jobs Scraper Statistics:');
      console.log(`   Total Jobs: ${stats.totalJobs}`);
      console.log(`   Cities with Jobs: ${stats.citiesWithJobs}`);
      console.log(`   Total Cities: ${stats.totalCities}`);
      console.log(`   Coverage: ${stats.coverage}`);
      
      return {
        success: true,
        stats,
        batchResults
      };
      
    } catch (error) {
      console.error('❌ Jobs Scraper failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = JobsScraper;

// CLI execution
if (require.main === module) {
  const scraper = new JobsScraper();
  const batchSize = parseInt(process.argv[2]) || 10;
  const startIndex = parseInt(process.argv[3]) || 0;
  
  scraper.run(batchSize, startIndex)
    .then(result => {
      if (result.success) {
        console.log('✅ Jobs scraping completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Jobs scraping failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}
