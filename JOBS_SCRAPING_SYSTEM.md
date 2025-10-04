# Jobs Scraping System for The Daily Holler

This document describes the comprehensive jobs scraping system implemented for holler.news/jobs, designed to aggregate job listings from multiple sources across all 1,690+ cities in the database.

## 🚨 Important Legal Notice

**✅ The user has obtained explicit permission from Craigslist to scrape their job listings. The system now implements real Craigslist scraping functionality with proper rate limiting and respectful data collection practices.**

## 📋 System Overview

The jobs scraping system consists of several key components:

1. **Jobs Scraper** (`server/jobs-scraper.js`) - Core scraping logic
2. **Jobs Scheduler** (`server/jobs-scheduler.js`) - Automated scheduling
3. **API Endpoints** - RESTful API for job data
4. **Frontend Integration** - Updated Jobs component
5. **Admin Interface** (`jobs-admin.html`) - Management dashboard

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Jobs Scraper  │───▶│  Jobs Scheduler │───▶│   API Server    │
│                 │    │                 │    │                 │
│ • Rate Limiting │    │ • Cron Jobs     │    │ • REST Endpoints│
│ • Error Handling│    │ • Batch Control │    │ • Data Storage  │
│ • Data Parsing  │    │ • Logging       │    │ • Statistics    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Job Data APIs  │    │   Admin Panel   │    │   Frontend      │
│                 │    │                 │    │                 │
│ • Indeed API    │    │ • Status Monitor│    │ • Jobs Display  │
│ • Glassdoor API │    │ • Manual Control│    │ • Search/Filter │
│ • LinkedIn API  │    │ • Logs Viewer   │    │ • Pagination    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will automatically initialize the jobs scheduler in production mode.

### 3. Access the Admin Interface

Open `jobs-admin.html` in your browser to manage the scraping system.

### 4. View Jobs

Visit `/jobs` to see the updated jobs page with real data.

## 📊 API Endpoints

### Jobs Data

- `GET /api/jobs` - Get all jobs with filtering and pagination
- `GET /api/jobs/city/:cityId` - Get jobs for a specific city
- `GET /api/jobs/stats` - Get job statistics

### Scheduler Management

- `GET /api/jobs/scheduler/status` - Get scheduler status
- `GET /api/jobs/scheduler/stats` - Get detailed statistics
- `POST /api/jobs/scheduler/start` - Start the scheduler
- `POST /api/jobs/scheduler/stop` - Stop the scheduler
- `POST /api/jobs/scheduler/run` - Run a manual batch
- `POST /api/jobs/scheduler/reset` - Reset scheduler to batch 0

### Manual Scraping

- `POST /api/jobs/scrape` - Trigger manual scraping with custom parameters

## 🔧 Configuration

### Environment Variables

```bash
NODE_ENV=production  # Automatically starts scheduler
CORS_ORIGIN=https://your-domain.com  # For production CORS
```

### Scheduler Settings

The scheduler processes cities in batches of 50 by default. This can be configured in `jobs-scheduler.js`:

```javascript
this.batchSize = 50; // Cities per batch
```

### Rate Limiting

The scraper includes built-in rate limiting:

```javascript
this.rateLimitDelay = 1000; // 1 second between requests
```

## 📁 Data Structure

### Job Object

```json
{
  "id": "unique_job_id",
  "title": "Job Title",
  "company": "Company Name",
  "location": "City, State",
  "description": "Job description",
  "postedDate": "2025-01-03T00:00:00.000Z",
  "url": "https://job-url.com",
  "source": "indeed|glassdoor|linkedin",
  "category": "Job Category",
  "type": "Full-time|Part-time|Contract",
  "salary": "Salary range"
}
```

### Storage Format

Jobs are stored in `server/data/jobs.json`:

```json
[
  {
    "cityKey": "Atlanta, GA",
    "jobs": [...],
    "lastUpdated": "2025-01-03T00:00:00.000Z"
  }
]
```

## 🔄 Scheduler Operation

### Automatic Scheduling

- **Production**: Runs every 30 minutes and every 2 hours
- **Development**: Manual control only

### Batch Processing

1. Loads cities in batches of 50
2. Processes each city sequentially
3. Applies rate limiting between requests
4. Saves progress after each batch
5. Resets to batch 0 after completing all cities

### Progress Tracking

The system tracks:
- Current batch number
- Total batches
- Last run timestamp
- Success/failure rates
- Detailed logs

## 🛠️ Adding New Job Sources

To add a new job source (e.g., LinkedIn):

1. **Add API Integration** in `jobs-scraper.js`:

```javascript
async fetchJobsFromLinkedIn(city, jobQuery = '') {
  // Implement LinkedIn API integration
  // Return standardized job format
}
```

2. **Update Source List**:

```javascript
const sources = ['indeed', 'glassdoor', 'linkedin'];
```

3. **Add Source Badge** in `Jobs.js`:

```javascript
const badges = {
  'linkedin': { text: 'LinkedIn', class: 'source-linkedin' }
};
```

## 📈 Monitoring and Logs

### Log Files

- `server/data/jobs-scheduler.log` - Detailed operation logs
- `server/data/jobs-last-run.json` - Scheduler state

### Admin Interface Features

- Real-time status monitoring
- Manual scheduler control
- Statistics dashboard
- Recent activity logs
- Progress visualization

### Health Checks

The system includes comprehensive error handling and recovery:

- Automatic retry on failures
- Graceful degradation
- Detailed error logging
- Status reporting

## 🔒 Security Considerations

### Rate Limiting

- Built-in delays between requests
- Configurable batch sizes
- Respect for API rate limits

### Error Handling

- Graceful failure handling
- Detailed logging
- No system crashes on API failures

### Data Privacy

- Only public job listings are collected
- No personal data storage
- Respect for robots.txt policies

## 🚨 Legal Compliance

### Terms of Service

- **Craigslist**: Direct scraping is prohibited
- **Indeed**: Use official API or partner program
- **Glassdoor**: Use official API or approved methods
- **LinkedIn**: Use official API or approved methods

### Current Implementation

1. ✅ **Craigslist**: Real scraping with permission (search URLs: `/search/jjj`)
2. 🔄 **Indeed**: API integration ready (placeholder implementation)
3. 🔄 **Glassdoor**: API integration ready (placeholder implementation)
4. 🔄 **LinkedIn**: API integration ready (placeholder implementation)

### Rate Limiting & Best Practices

1. ✅ **Conservative Rate Limiting**: 3 seconds between Craigslist requests
2. ✅ **Proper Headers**: Realistic user-agent and request headers
3. ✅ **Error Handling**: Graceful failure recovery
4. ✅ **Batch Processing**: 20 cities per batch to avoid overwhelming servers
5. ✅ **Monitoring**: Comprehensive logging and status tracking

## 🧪 Testing

### Manual Testing

```bash
# Test the scraper directly
cd server
node jobs-scraper.js

# Test the scheduler
node jobs-scheduler.js status
node jobs-scheduler.js run
```

### API Testing

```bash
# Test jobs API
curl http://localhost:5001/api/jobs/stats

# Test scheduler
curl http://localhost:5001/api/jobs/scheduler/status
```

## 📝 Maintenance

### Regular Tasks

1. **Monitor Logs**: Check for errors and performance issues
2. **Update APIs**: Keep job source integrations current
3. **Review Statistics**: Monitor coverage and data quality
4. **Backup Data**: Regular backups of job data
5. **Legal Review**: Ensure ongoing compliance

### Troubleshooting

#### Common Issues

1. **No Jobs Appearing**: Check if scheduler is running
2. **API Errors**: Verify API keys and rate limits
3. **Performance Issues**: Adjust batch sizes and delays
4. **Data Quality**: Review parsing logic and validation

#### Debug Mode

Enable detailed logging:

```javascript
// In jobs-scraper.js
console.log('Debug mode enabled');
```

## 🎯 Future Enhancements

### Planned Features

1. **Machine Learning**: Job categorization and ranking
2. **Real-time Updates**: WebSocket integration
3. **Advanced Filtering**: Skills, experience, remote work
4. **Job Alerts**: Email notifications for new jobs
5. **Analytics Dashboard**: Detailed metrics and insights
6. **Mobile App**: Native mobile interface
7. **API Rate Optimization**: Intelligent request batching
8. **Data Enrichment**: Company information and reviews

### Integration Opportunities

1. **HR Systems**: Integration with ATS platforms
2. **Social Media**: Cross-platform job sharing
3. **Email Marketing**: Job newsletter integration
4. **CRM Systems**: Lead generation from job seekers

## 📞 Support

For technical support or questions about the jobs scraping system:

1. Check the logs in `server/data/jobs-scheduler.log`
2. Review the admin interface at `jobs-admin.html`
3. Test API endpoints directly
4. Review this documentation

## 📄 License

This system is part of The Daily Holler project. Please ensure compliance with all applicable terms of service and legal requirements when implementing job data collection.

---

**Last Updated**: January 3, 2025  
**Version**: 1.0.0  
**Maintainer**: The Daily Holler Development Team
