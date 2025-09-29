# 🚀 Railway Deployment - Quick Reference

## ⚡ 5-Minute Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### 2. Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click "Deploy Now"

### 3. Set Environment Variables
In Railway dashboard → Variables:
```
OPENAI_API_KEY = sk-proj-your-actual-key-here
NODE_ENV = production
CORS_ORIGIN = https://your-app-name.railway.app
```

### 4. Test Your App
- Visit: `https://your-app-name.railway.app`
- Health check: `https://your-app-name.railway.app/api/health`

## 🔧 Common Fixes

### Build Fails
```bash
# Check Railway logs
# Fix dependencies locally and push
npm install --legacy-peer-deps
git add . && git commit -m "Fix deps" && git push
```

### CORS Errors
```bash
# Update CORS_ORIGIN in Railway variables
CORS_ORIGIN = https://your-actual-domain.com
```

### Memory Issues
- Free tier: 512MB RAM
- Upgrade to Hobby ($5/month) for 1GB RAM
- Or optimize your app

### API Not Working
```bash
# Test endpoints
curl https://your-app.railway.app/api/health
curl https://your-app.railway.app/api/news/today
```

## 🌐 Custom Domain

### Option 1: Railway Subdomain (Free)
- Use: `https://your-app-name.railway.app`
- No setup needed
- Update CORS_ORIGIN to this URL

### Option 2: Custom Domain
1. Railway dashboard → Settings → Domains
2. Add custom domain
3. Set DNS CNAME record:
   ```
   Type: CNAME
   Name: www
   Value: your-app-name.railway.app
   ```
4. Update CORS_ORIGIN to your domain

## 📊 Railway Plans

| Plan | Price | RAM | Storage | Bandwidth |
|------|-------|-----|---------|-----------|
| Free | $0 | 512MB | 1GB | 100GB/month |
| Hobby | $5 | 1GB | 1GB | 100GB/month |
| Pro | $20 | 8GB | 1GB | 1TB/month |

## 🆘 Need Help?

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Check logs**: Railway dashboard → Deployments → View logs

---

**Your app URL**: `https://your-app-name.railway.app`
