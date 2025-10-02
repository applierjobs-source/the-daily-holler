# Railway Cron Job Setup - Daily Article Generation

This guide will help you set up a Railway cron job to generate articles for all cities listed on holler.news/cities every 24 hours.

## What This Does

- **Generates**: Articles for all cities listed on your website (based on API data)
- **Schedule Options**:
  - **Daily**: Every 24 hours at 9:50 PM UTC (4:50 PM CDT)
  - **Continuous**: Every 4 hours (24/7 generation)
  - **Custom**: Any schedule you prefer
- **Cost**: ~$0.56 per day (daily) or ~$2.24 per day (continuous)
- **Duration**: ~2-3 hours to complete all articles
- **Runs independently**: You can close your laptop - it runs on Railway's servers

## Setup Steps

### 1. Deploy to Railway

```bash
# Push your changes to GitHub
git add .
git commit -m "Add Railway cron job for daily article generation"
git push origin main
```

### 2. Configure Railway Cron Service

1. Go to your Railway dashboard
2. Click on your project
3. Click "New" → "Cron Job"
4. Configure:
   - **Name**: `continuous-articles` (or `daily-articles` for daily)
   - **Schedule Options**:
     - **Daily**: `50 21 * * *` (9:50 PM UTC / 4:50 PM CDT daily)
     - **Every 4 Hours**: `0 */4 * * *` (12:00, 4:00, 8:00, 16:00, 20:00 UTC)
     - **Every 6 Hours**: `0 */6 * * *` (12:00, 6:00, 12:00, 18:00 UTC)
     - **Every 8 Hours**: `0 */8 * * *` (12:00, 8:00, 16:00 UTC)
   - **Command**: 
     - **Daily**: `node railway-daily-generation.js`
     - **Continuous**: `node railway-continuous-generation.js`
     - **Minute-by-Minute**: `node railway-minute-generation.js`
   - **Working Directory**: `/` (root of your project)

### 3. Set Environment Variables

Make sure these are set in Railway:
- `OPENAI_API_KEY` - Your OpenAI API key
- `NODE_ENV` - Set to `production`

### 4. Monitor the Cron Job

- **Railway Dashboard**: Check the cron job logs
- **Expected Duration**: 4-5 hours for all 1,690 articles
- **Progress Updates**: Every 25 articles (shows percentage complete)

## Scheduling Options

### 🕐 **Daily Generation** (Recommended for most users)
- **Schedule**: `50 21 * * *` (Once per day at 9:50 PM UTC)
- **Cost**: ~$0.56/day
- **Best for**: Most websites, cost-effective
- **Article freshness**: Articles updated once daily

### 🔄 **Continuous Generation** (24/7)
- **Schedule**: `0 */4 * * *` (Every 4 hours)
- **Cost**: ~$2.24/day
- **Best for**: High-traffic sites, maximum freshness
- **Article freshness**: Articles updated 6 times per day

### ⚡ **High-Frequency Generation**
- **Schedule**: `0 */2 * * *` (Every 2 hours)
- **Cost**: ~$4.48/day
- **Best for**: News sites, maximum content velocity
- **Article freshness**: Articles updated 12 times per day

### 💰 **Budget-Friendly**
- **Schedule**: `0 */8 * * *` (Every 8 hours)
- **Cost**: ~$1.12/day
- **Best for**: Budget-conscious users
- **Article freshness**: Articles updated 3 times per day

### ⏰ **Minute-by-Minute (24/7)**
- **Schedule**: `@reboot` (Run continuously, 1 article per minute)
- **Cost**: ~$2.50/day
- **Best for**: Maximum content velocity, constant updates
- **Article freshness**: 1,440 articles per day (1 every minute)

## Script Types

### 📅 **Daily Generation Script** (`railway-daily-generation.js`)
- **Purpose**: Generates articles for ALL cities every run
- **Use Case**: Daily comprehensive updates
- **Efficiency**: Processes all cities regardless of existing articles
- **Best for**: Daily schedules, comprehensive updates

### 🔄 **Continuous Generation Script** (`railway-continuous-generation.js`)
- **Purpose**: Only generates articles for cities that need them
- **Use Case**: Continuous 24/7 operation
- **Efficiency**: Checks existing articles and only updates cities older than 6 hours
- **Best for**: Frequent schedules (every 2-8 hours), cost optimization

### ⏰ **Minute-by-Minute Script** (`railway-minute-generation.js`)
- **Purpose**: Generates exactly 1 article per minute, cycling through all cities
- **Use Case**: Maximum content velocity, 24/7 continuous publishing
- **Efficiency**: Cycles through cities systematically, ensuring even coverage
- **Best for**: High-traffic sites, maximum freshness, constant content updates

## How It Works

### Daily Process (4:50 PM CDT / 9:50 PM UTC)
1. **Check existing articles** for today
2. **Generate missing articles** (if any)
3. **Process all 1,690 cities** with optimized rate limiting
4. **Save progress** every 25 articles
5. **Complete in ~4-5 hours

### Rate Limiting
- **Speed**: ~6.7 articles per second
- **OpenAI Limit**: 500 requests per minute (we use ~400)
- **Safety margin**: Well within limits

### Cost Breakdown
- **Per article**: ~$0.00033
- **Daily cost**: ~$0.56
- **Monthly cost**: ~$17

## Monitoring

### Check Cron Job Status
1. Railway Dashboard → Your Project → Cron Jobs
2. Click on "daily-articles"
3. View logs and status

### Manual Trigger (Testing)
```bash
# Test locally
node run-daily-generation.js

# Or trigger via Railway CLI
railway run node run-daily-generation.js
```

### Check Article Count
```bash
# Via API (replace with your Railway URL)
curl https://your-app.railway.app/api/news | jq '.total'
```

## Troubleshooting

### Common Issues

1. **Cron job not starting**
   - Check environment variables are set
   - Verify the command path is correct
   - Check Railway logs for errors

2. **Articles not generating**
   - Verify OpenAI API key is valid
   - Check API usage limits
   - Review error logs

3. **Process taking too long**
   - Normal: 4-5 hours for 1,690 articles
   - Check if rate limiting is working
   - Monitor OpenAI API response times

### Logs to Check
- Railway cron job logs
- Application logs
- OpenAI API usage dashboard

## Expected Timeline

- **4:50 PM CDT**: Cron job starts
- **4:50-8:50 PM CDT**: Generates all 1,690 articles
- **8:50 PM CDT**: Process complete
- **Next day**: Repeats automatically

## Benefits

✅ **Fully automated** - No manual intervention needed
✅ **Cost effective** - Only $0.56 per day
✅ **Scalable** - Handles all 1,690 cities
✅ **Reliable** - Runs on Railway's infrastructure
✅ **Independent** - Works even when your laptop is closed

## Next Steps

1. Deploy the changes to Railway
2. Set up the cron job
3. Monitor the first run
4. Enjoy your automated daily article generation!

---

**Note**: The cron job will run independently on Railway's servers, so you can close your laptop and it will continue generating articles.
