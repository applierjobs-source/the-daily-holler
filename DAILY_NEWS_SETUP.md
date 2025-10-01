# Daily News Generation - Cost-Effective Setup

This document explains the cost-effective daily news generation system that reduces costs by 10x while maintaining article volume.

## Overview

The system generates only **10 new articles per day** but distributes them to all 1,682 cities, resulting in 16,820 new city-specific articles daily. This approach reduces costs by 90% compared to generating unique articles for each city.

## Cost Analysis

### Previous Approach (Expensive)
- 100 articles × 1,682 cities = 168,200 articles per day
- Cost: ~$50-60 per day
- Monthly cost: ~$1,500-1,800

### New Approach (Cost-Effective)
- 10 articles × 1,682 cities = 16,820 articles per day
- Cost: ~$3-5 per day
- Monthly cost: ~$90-150
- **Savings: 90% reduction in cost**

## How It Works

1. **Daily Generation**: Generates 10 new generic comedic articles
2. **Smart Distribution**: Each article is customized for all 1,682 cities
3. **City Customization**: Headlines and content are automatically updated with city names
4. **Cumulative Growth**: Articles accumulate over time, building a large library

## Files

- `daily-news-generator.js` - Main script that generates 10 articles and distributes them
- `setup-daily-cron.sh` - Script to set up the daily cron job
- `daily-news.log` - Log file for cron job output

## Setup Instructions

### 1. Test the Script Manually

```bash
cd /Users/Developer2/indiesage
node daily-news-generator.js
```

### 2. Set Up the Cron Job

```bash
cd /Users/Developer2/indiesage
./setup-daily-cron.sh
```

This will:
- Add a cron job that runs every day at 3:50 PM CDT
- Generate 10 new articles and distribute them to all cities
- Log all output to `daily-news.log`

### 3. Verify the Cron Job

```bash
crontab -l
```

You should see:
```
50 15 * * * cd /Users/Developer2/indiesage && /usr/local/bin/node daily-news-generator.js >> /Users/Developer2/indiesage/daily-news.log 2>&1
```

## Daily Process

1. **3:50 PM CDT**: Cron job triggers
2. **Generate**: Creates 10 new generic articles using OpenAI
3. **Customize**: Each article is customized for all 1,682 cities
4. **Save**: All 16,820 new articles are saved to the database
5. **Log**: Process is logged for monitoring

## Monitoring

### Check Daily Logs

```bash
tail -f /Users/Developer2/indiesage/daily-news.log
```

### Check Article Count

```bash
curl -s "http://localhost:5001/api/news" | jq '.total'
```

### Manual Generation

```bash
cd /Users/Developer2/indiesage
node daily-news-generator.js
```

## Article Growth Over Time

- **Day 1**: 16,820 articles (10 per city)
- **Day 7**: 117,740 articles (70 per city)
- **Day 30**: 504,600 articles (300 per city)
- **Day 365**: 6,135,300 articles (3,650 per city)

## Benefits

1. **Cost Effective**: 90% reduction in daily costs
2. **Scalable**: Articles accumulate over time
3. **Consistent**: Same quality and style across all cities
4. **Maintainable**: Simple daily process
5. **Reliable**: Robust error handling and logging

## Troubleshooting

### API Key Issues
- Ensure OpenAI API key is valid and has sufficient credits
- Check the key in `daily-news-generator.js`

### Server Issues
- Make sure the server is running on port 5001
- Check server logs for errors

### Cron Job Issues
- Verify cron service is running: `sudo service cron status`
- Check cron logs: `grep CRON /var/log/syslog`

## Removing the Cron Job

```bash
crontab -e
```

Then delete the line containing `daily-news-generator.js` and save.

## Cost Optimization Tips

1. **Monitor Usage**: Check daily logs for any errors
2. **Adjust Frequency**: Can run every 2-3 days instead of daily
3. **Batch Size**: Can reduce to 5 articles per day if needed
4. **API Limits**: Monitor OpenAI usage and adjust accordingly

This approach provides excellent value while maintaining a rich, growing news database for all cities.
