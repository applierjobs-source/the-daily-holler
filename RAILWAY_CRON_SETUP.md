# Railway Cron Job Setup - Daily Article Generation

This guide will help you set up a Railway cron job to generate 1,690 articles (one for each city) every 24 hours.

## What This Does

- **Generates**: 1,690 unique satirical articles (one per city)
- **Schedule**: Every 24 hours at 9:25 PM UTC (4:25 PM CDT)
- **Cost**: ~$0.56 per day (very affordable!)
- **Duration**: ~4-5 hours to complete all articles
- **Runs independently**: You can close your laptop

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
   - **Name**: `daily-articles`
   - **Schedule**: `25 21 * * *` (9:25 PM UTC / 4:25 PM CDT daily)
   - **Command**: `node run-daily-generation.js`
   - **Working Directory**: `/` (root of your project)

### 3. Set Environment Variables

Make sure these are set in Railway:
- `OPENAI_API_KEY` - Your OpenAI API key
- `NODE_ENV` - Set to `production`

### 4. Monitor the Cron Job

- **Railway Dashboard**: Check the cron job logs
- **Expected Duration**: 4-5 hours for all 1,690 articles
- **Progress Updates**: Every 25 articles (shows percentage complete)

## How It Works

### Daily Process (4:25 PM CDT / 9:25 PM UTC)
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

- **4:25 PM CDT**: Cron job starts
- **4:25-8:25 PM CDT**: Generates all 1,690 articles
- **8:25 PM CDT**: Process complete
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
