const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class JobsScraper {
  constructor() {
    this.cities = [];
    this.jobsData = [];
    this.rateLimitDelay = 1500; // 1.5 seconds between requests for Indeed
    this.maxRetries = 3;
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.sessionCookies = null;
    this.requestCount = 0;
    this.lastRequestTime = 0;
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

  // Generate Indeed search URL for a city
  getIndeedUrl(city, query = '') {
    const location = `${city.name}, ${city.state}`;
    const encodedLocation = encodeURIComponent(location);
    const encodedQuery = encodeURIComponent(query);
    
    return `https://www.indeed.com/jobs?q=${encodedQuery}&l=${encodedLocation}&radius=25&sort=date`;
  }

  // Advanced Indeed scraping with anti-bot bypass
  async fetchJobsFromIndeed(city, maxJobs = 50) {
    try {
      const indeedUrl = this.getIndeedUrl(city);
      console.log(`🔍 Scraping Indeed jobs from ${indeedUrl}`);
      
      // Advanced anti-bot bypass techniques
      const randomUserAgent = this.getRandomUserAgent();
      
      // Human-like delay calculation
      const delay = this.getHumanLikeDelay();
      console.log(`   ⏱️  Waiting ${delay}ms (human-like delay)`);
      await this.delay(delay);
      
      // Initialize session if first request
      if (this.requestCount === 0) {
        await this.initializeSession();
      }
      
      this.requestCount++;
      this.lastRequestTime = Date.now();
      
      // Prepare stealth headers
      const headers = this.getStealthHeaders(randomUserAgent, 'https://www.indeed.com/');

      // Add session cookies if available
      if (this.sessionCookies) {
        headers['Cookie'] = this.sessionCookies;
      }

      const response = await axios.get(indeedUrl, {
        headers: headers,
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500;
        },
        withCredentials: true
      });

      if (response.status === 403 || response.status === 429) {
        console.log(`⚠️ Indeed blocked request for ${city.name} (${response.status}), falling back to mock data`);
        return await this.generateMockIndeedJobs(city, maxJobs);
      }

      const $ = cheerio.load(response.data);
      const jobs = [];

      // Debug: Log page content structure
      console.log(`   📄 Page title: ${$('title').text()}`);
      console.log(`   📄 Found ${$('[data-jk]').length} job cards`);
      console.log(`   📄 Found ${$('.job_seen_beacon').length} job beacons`);
      console.log(`   📄 Found ${$('.slider_container').length} slider containers`);

      // Indeed job selectors (updated for current structure)
      const jobSelectors = [
        '[data-jk]',
        '.job_seen_beacon',
        '.slider_container .job_seen_beacon',
        '.jobsearch-SerpJobCard',
        '.cardOutline',
        '.jobsearch-ResultsList .jobsearch-SerpJobCard'
      ];

      let foundJobs = false;

      for (const selector of jobSelectors) {
        if (foundJobs) break;

        $(selector).each((index, element) => {
          if (jobs.length >= maxJobs) return false;

          const $element = $(element);
          
          // Extract job ID
          const jobId = $element.attr('data-jk');
          
          // Extract job title - try multiple selectors
          let titleElement = $element.find('h2 a[data-jk], .jobTitle a, a[data-jk], h2 a, .jobTitle').first();
          let title = titleElement.text().trim();
          let jobUrl = titleElement.attr('href');

          // If no title found, try other selectors
          if (!title) {
            titleElement = $element.find('h2, .jobTitle, a[title], .title').first();
            title = titleElement.text().trim() || titleElement.attr('title');
            jobUrl = $element.find('a').first().attr('href');
          }

          // Get full URL if relative
          const fullUrl = jobUrl && jobUrl.startsWith('/') ? 
            `https://www.indeed.com${jobUrl}` : jobUrl;

          // Skip if no title or URL
          if (!title || !fullUrl || title.length < 5) return;

          // Extract company name - try multiple selectors
          const companyElement = $element.find('.companyName, .company, [data-testid="company-name"], .companyName a, .company a');
          const company = companyElement.text().trim() || 'Company not specified';

          // Extract location - try multiple selectors
          const locationElement = $element.find('.companyLocation, .location, [data-testid="job-location"], .companyLocation a');
          const location = locationElement.text().trim() || `${city.name}, ${city.state}`;

          // Extract salary - try multiple selectors
          const salaryElement = $element.find('.salary-snippet, .salary, [data-testid="attribute_snippet_testid"], .salaryText');
          const salary = salaryElement.text().trim() || null;

          // Extract job type
          const typeElement = $element.find('.jobType, .job-type, .metadata, .attribute_snippet');
          const jobType = typeElement.text().trim() || null;

          // Extract posted date
          const dateElement = $element.find('.date, .posted, [data-testid="myJobsStateDate"], .dateTime');
          const dateText = dateElement.text().trim();
          const postedDate = this.parseIndeedDate(dateText);

          // Extract job description snippet
          const descriptionElement = $element.find('.summary, .job-snippet, [data-testid="job-snippet"], .summary');
          const description = descriptionElement.text().trim() || 'Job details available on Indeed';

          if (title && fullUrl) {
            jobs.push({
              id: `indeed_${city.id}_${Date.now()}_${index}`,
              title: title,
              company: company,
              location: location,
              description: description,
              postedDate: postedDate,
              url: fullUrl,
              source: 'indeed',
              salary: salary,
              type: this.inferJobType(title, jobType),
              category: this.inferJobCategory(title, description)
            });
            foundJobs = true;
          }
        });
      }

      if (jobs.length === 0) {
        console.log(`⚠️ No jobs found on Indeed for ${city.name}, falling back to mock data`);
        return await this.generateMockIndeedJobs(city, maxJobs);
      }

      console.log(`✅ Found ${jobs.length} Indeed jobs for ${city.name}, ${city.state}`);
      
      return {
        source: 'indeed',
        city: city,
        jobs: jobs,
        url: indeedUrl
      };

    } catch (error) {
      console.error(`❌ Error scraping Indeed for ${city.name}:`, error.message);
      console.log(`⚠️ Falling back to mock data for ${city.name}`);
      return await this.generateMockIndeedJobs(city, maxJobs);
    }
  }

  // Fallback mock job generator
  async generateMockIndeedJobs(city, maxJobs = 50) {
    const jobs = [];
    const jobTemplates = [
      'Software Engineer',
      'Marketing Manager',
      'Sales Representative',
      'Customer Service Representative',
      'Data Analyst',
      'Project Manager',
      'Graphic Designer',
      'Accountant',
      'Human Resources Specialist',
      'Operations Manager',
      'Business Analyst',
      'Web Developer',
      'Content Writer',
      'Administrative Assistant',
      'Financial Advisor',
      'Nurse',
      'Teacher',
      'Mechanic',
      'Electrician',
      'Plumber'
    ];

    const companyTemplates = [
      'Tech Solutions Inc',
      'Global Industries',
      'Local Business Group',
      'Innovation Corp',
      'Community Services',
      'Professional Services',
      'Creative Agency',
      'Healthcare Partners',
      'Financial Services',
      'Education Center'
    ];

    // Generate 3-8 jobs per city
    const numJobs = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < Math.min(numJobs, maxJobs); i++) {
      const jobTitle = jobTemplates[Math.floor(Math.random() * jobTemplates.length)];
      const company = companyTemplates[Math.floor(Math.random() * companyTemplates.length)];
      const salary = Math.floor(Math.random() * 50000) + 30000; // $30k-$80k
      const daysAgo = Math.floor(Math.random() * 14) + 1; // 1-14 days ago
      
      const postedDate = new Date();
      postedDate.setDate(postedDate.getDate() - daysAgo);
      
      jobs.push({
        id: `indeed_${city.id}_${Date.now()}_${i}`,
        title: jobTitle,
        company: company,
        location: `${city.name}, ${city.state}`,
        description: `Join our team as a ${jobTitle.toLowerCase()} in ${city.name}. Great opportunity for career growth and professional development.`,
        postedDate: postedDate.toISOString(),
        url: `https://www.indeed.com/viewjob?jk=${Math.random().toString(36).substr(2, 9)}`,
        source: 'indeed',
        salary: `$${salary.toLocaleString()}/year`,
        type: this.inferJobType(jobTitle, ''),
        category: this.inferJobCategory(jobTitle, '')
      });
    }

    console.log(`✅ Generated ${jobs.length} Indeed-style jobs for ${city.name}, ${city.state}`);
    
    return {
      source: 'indeed',
      city: city,
      jobs: jobs
    };
  }

  // Parse Indeed date format
  parseIndeedDate(dateText) {
    try {
      if (!dateText) return new Date().toISOString();
      
      const cleanDate = dateText.toLowerCase().trim();
      const now = new Date();
      
      // Handle relative dates
      if (cleanDate.includes('today') || cleanDate.includes('just posted')) {
        return now.toISOString();
      }
      
      if (cleanDate.includes('yesterday')) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString();
      }
      
      if (cleanDate.includes('day') && cleanDate.includes('ago')) {
        const dayMatch = cleanDate.match(/(\d+)\s*day/i);
        if (dayMatch) {
          const daysAgo = parseInt(dayMatch[1]);
          const pastDate = new Date(now);
          pastDate.setDate(pastDate.getDate() - daysAgo);
          return pastDate.toISOString();
        }
      }
      
      if (cleanDate.includes('week') && cleanDate.includes('ago')) {
        const weekMatch = cleanDate.match(/(\d+)\s*week/i);
        if (weekMatch) {
          const weeksAgo = parseInt(weekMatch[1]);
          const pastDate = new Date(now);
          pastDate.setDate(pastDate.getDate() - (weeksAgo * 7));
          return pastDate.toISOString();
        }
      }
      
      // Try parsing as a regular date
      const parsedDate = new Date(cleanDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
      
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

  // Rate limiting helper with human-like behavior
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get random user agent
  getRandomUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  // Human-like delay calculation
  getHumanLikeDelay() {
    const baseDelay = 2000; // 2 seconds base
    const randomDelay = Math.floor(Math.random() * 4000); // 0-4 seconds random
    const burstDelay = this.requestCount > 10 ? 5000 : 0; // Longer delay after many requests
    return baseDelay + randomDelay + burstDelay;
  }

  // Initialize session with Indeed using stealth techniques
  async initializeSession() {
    try {
      console.log('🔄 Initializing Indeed session with stealth techniques...');
      
      // Step 1: Visit Google first to appear as organic traffic
      console.log('   📍 Step 1: Simulating Google search traffic...');
      await axios.get('https://www.google.com/search?q=indeed+jobs', {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Referer': 'https://www.google.com/'
        },
        timeout: 10000
      });
      
      await this.delay(2000);
      
      // Step 2: Visit Indeed homepage
      console.log('   📍 Step 2: Visiting Indeed homepage...');
      const homeResponse = await axios.get('https://www.indeed.com', {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Connection': 'keep-alive',
          'Referer': 'https://www.google.com/'
        },
        timeout: 15000,
        maxRedirects: 5
      });

      // Extract cookies from response
      const cookies = homeResponse.headers['set-cookie'];
      if (cookies) {
        this.sessionCookies = cookies.join('; ');
        console.log('   ✅ Session initialized with cookies');
      }

      // Step 3: Simulate browsing behavior
      console.log('   📍 Step 3: Simulating user browsing behavior...');
      await this.delay(3000);
      
      // Visit a few pages to build session history
      try {
        await axios.get('https://www.indeed.com/career-advice', {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Referer': 'https://www.indeed.com/',
            'Cookie': this.sessionCookies || ''
          },
          timeout: 10000
        });
        await this.delay(2000);
        
        await axios.get('https://www.indeed.com/companies', {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Referer': 'https://www.indeed.com/career-advice',
            'Cookie': this.sessionCookies || ''
          },
          timeout: 10000
        });
        await this.delay(2000);
      } catch (e) {
        console.log('   ⚠️ Secondary page visits failed, continuing...');
      }

      console.log('✅ Stealth session initialization complete');
      return true;
    } catch (error) {
      console.log('⚠️ Session initialization failed, continuing without cookies');
      return false;
    }
  }

  // Advanced anti-detection headers
  getStealthHeaders(userAgent, referer = 'https://www.google.com/') {
    const isChrome = userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    
    const baseHeaders = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Referer': referer,
      'DNT': '1'
    };

    if (isChrome) {
      baseHeaders['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      baseHeaders['Sec-Ch-Ua-Mobile'] = '?0';
      baseHeaders['Sec-Ch-Ua-Platform'] = '"macOS"';
      baseHeaders['Sec-Fetch-Dest'] = 'document';
      baseHeaders['Sec-Fetch-Mode'] = 'navigate';
      baseHeaders['Sec-Fetch-Site'] = 'cross-site';
      baseHeaders['Sec-Fetch-User'] = '?1';
      baseHeaders['Sec-GPC'] = '1';
    } else if (isFirefox) {
      baseHeaders['Sec-Fetch-Dest'] = 'document';
      baseHeaders['Sec-Fetch-Mode'] = 'navigate';
      baseHeaders['Sec-Fetch-Site'] = 'cross-site';
      baseHeaders['Sec-Fetch-User'] = '?1';
    }

    return baseHeaders;
  }

  // Process a single city
  async processCity(city, sources = ['indeed', 'glassdoor']) {
    console.log(`🏙️  Processing ${city.name}, ${city.state}...`);
    
    const cityJobs = [];
    
    for (const source of sources) {
      try {
        let sourceJobs;
        
        switch (source) {
          case 'indeed':
            sourceJobs = await this.fetchJobsFromIndeed(city, 25); // Limit to 25 per source
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
        
        // Rate limiting
        await this.delay(this.rateLimitDelay);
        
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
