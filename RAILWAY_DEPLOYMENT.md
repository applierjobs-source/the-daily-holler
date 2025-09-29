# 🚀 Complete Railway Deployment Guide for The Daily Holler

## 📋 Prerequisites Checklist
- [ ] [Railway account](https://railway.app) (free tier available)
- [ ] [GitHub account](https://github.com) with your code
- [ ] Domain name (optional - Railway provides free subdomain)
- [ ] OpenAI API key ready
- [ ] Git installed locally

## 🛠️ Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)
```bash
# Check if git is initialized
ls -la | grep .git

# If no .git folder, initialize:
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository" (green button)
3. Repository name: `the-daily-holler` (or your preferred name)
4. Description: "Satirical news and local humor across America's cities"
5. Set to **Public** (free Railway deployment requires public repo)
6. **DO NOT** initialize with README, .gitignore, or license (you already have files)
7. Click "Create repository"

### 1.3 Push Your Code to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/the-daily-holler.git

# Push your code
git add .
git commit -m "Prepare for Railway deployment"
git branch -M main
git push -u origin main
```

### 1.4 Verify Required Files
Ensure these files exist in your root directory:
- [ ] `railway.json` ✅
- [ ] `Procfile` ✅
- [ ] `package.json` (with production scripts) ✅
- [ ] `server/` directory ✅
- [ ] `client/` directory ✅
- [ ] `server/package.json` ✅
- [ ] `client/package.json` ✅

## 🚀 Step 2: Deploy to Railway

### 2.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Click "Login" in top right
3. Choose "Login with GitHub" (recommended)
4. Authorize Railway to access your GitHub account

### 2.2 Create New Project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. You'll see a list of your GitHub repositories
4. Find and click on `the-daily-holler` (or your repo name)
5. Click **"Deploy Now"**

### 2.3 Wait for Initial Build
- Railway will automatically:
  - Detect Node.js project
  - Install dependencies (`npm install`)
  - Build React app (`npm run build`)
  - Start server (`npm run start:prod`)
- **Build time**: 2-5 minutes (first time)
- Watch the build logs in real-time

### 2.4 Configure Environment Variables
1. In your Railway project dashboard
2. Click on your service (usually named after your repo)
3. Go to **"Variables"** tab
4. Click **"New Variable"** and add:

```bash
# Required Variables
OPENAI_API_KEY = sk-proj-your-actual-api-key-here
NODE_ENV = production

# Optional (for custom domain later)
CORS_ORIGIN = https://your-app-name.railway.app
```

**Important**: Replace `your-actual-api-key-here` with your real OpenAI API key!

### 2.5 Verify Build Settings
Railway auto-detects settings, but verify:
- **Build Command**: `npm run build` ✅
- **Start Command**: `npm run start:prod` ✅
- **Root Directory**: `/` ✅
- **Node Version**: 18.x or 20.x ✅

### 2.6 Test Your Deployment
1. Railway provides a URL like: `https://your-app-name.railway.app`
2. Visit this URL in your browser
3. You should see your React app loading
4. Test the health check: `https://your-app-name.railway.app/api/health`

## 🌐 Step 3: Domain Configuration

### 3.1 Railway Subdomain (Free - Recommended for Testing)
Railway automatically provides: `https://your-app-name.railway.app`

**Advantages:**
- ✅ No configuration needed
- ✅ HTTPS automatically enabled
- ✅ Free SSL certificate
- ✅ Instant availability

**To use Railway subdomain:**
1. Your app is already live at the Railway URL
2. Update CORS_ORIGIN in Railway variables to your Railway URL
3. Share this URL with users

### 3.2 Custom Domain Setup (Optional)

#### Option A: Buy Domain Through Railway
1. In Railway dashboard → Your Project → Settings
2. Click **"Domains"** tab
3. Click **"Custom Domain"**
4. Enter your desired domain (e.g., `thedailyholler.com`)
5. Railway will show you available domains to purchase
6. Complete purchase through Railway
7. Domain automatically configured

#### Option B: Use Your Existing Domain
1. **In Railway Dashboard:**
   - Go to Settings → Domains
   - Click "Custom Domain"
   - Enter your domain (e.g., `thedailyholler.com`)
   - Railway will provide DNS instructions

2. **In Your Domain Provider (GoDaddy, Namecheap, etc.):**
   ```
   Type: CNAME
   Name: www
   Value: your-app-name.railway.app
   
   Type: CNAME  
   Name: @ (or root)
   Value: your-app-name.railway.app
   ```

3. **Wait for DNS Propagation:**
   - Usually takes 5-60 minutes
   - Can take up to 24 hours
   - Check with: `nslookup your-domain.com`

4. **Update Environment Variables:**
   - In Railway → Variables
   - Update `CORS_ORIGIN` to `https://your-domain.com`

### 3.3 Domain Verification
Test your domain setup:
```bash
# Test Railway subdomain
curl https://your-app-name.railway.app/api/health

# Test custom domain (after DNS propagation)
curl https://your-domain.com/api/health
```

## Step 4: Production Checklist

### 4.1 Environment Variables
- [ ] `OPENAI_API_KEY` set
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` set to your domain
- [ ] `PORT` (Railway sets automatically)

### 4.2 Build Process
- [ ] React app builds successfully
- [ ] Server starts without errors
- [ ] Health check endpoint works: `/api/health`
- [ ] API endpoints accessible

### 4.3 Testing
- [ ] Visit your Railway URL
- [ ] Test API endpoints
- [ ] Verify articles load
- [ ] Check mobile responsiveness

## Step 5: Monitoring & Maintenance

### 5.1 Railway Dashboard
- Monitor logs in real-time
- Check resource usage
- View deployment history
- Set up alerts

### 5.2 Performance Optimization
- Railway auto-scales based on traffic
- Free tier: 512MB RAM, 1GB storage
- Upgrade for more resources if needed

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### ❌ Build Fails
**Symptoms:** Build process stops with errors in Railway logs

**Solutions:**
```bash
# 1. Check Railway build logs for specific errors
# 2. Common fixes:

# Fix dependency issues
npm install --legacy-peer-deps

# Update outdated packages
npm update

# Clear npm cache
npm cache clean --force

# Check Node.js version compatibility
# Railway supports Node 18.x and 20.x
```

**Debug Steps:**
1. Go to Railway dashboard → Your project → Deployments
2. Click on failed deployment
3. Check build logs for specific error messages
4. Fix the issue locally and push to GitHub

#### ❌ CORS Errors
**Symptoms:** Browser shows CORS errors, API calls fail

**Solutions:**
```bash
# Update CORS_ORIGIN in Railway variables
CORS_ORIGIN=https://your-actual-domain.com

# For development testing:
CORS_ORIGIN=https://your-app-name.railway.app
```

**Debug Steps:**
1. Check browser console for CORS errors
2. Verify CORS_ORIGIN matches your actual domain
3. Test API directly: `curl https://your-app.railway.app/api/health`

#### ❌ Memory Issues (Out of Memory)
**Symptoms:** App crashes with "JavaScript heap out of memory"

**Solutions:**
```bash
# Railway free tier has 512MB RAM limit
# Solutions:

# 1. Optimize your app (recommended)
# - Reduce articles.json size
# - Implement pagination
# - Use streaming for large files

# 2. Upgrade Railway plan
# - Hobby plan: $5/month, 1GB RAM
# - Pro plan: $20/month, 8GB RAM

# 3. Increase Node.js memory limit
# Already set to 8GB in package.json
```

#### ❌ API Not Working
**Symptoms:** Frontend loads but no data, API calls fail

**Debug Steps:**
```bash
# 1. Test health endpoint
curl https://your-app.railway.app/api/health

# 2. Test specific API endpoints
curl https://your-app.railway.app/api/news/today
curl https://your-app.railway.app/api/cities

# 3. Check Railway logs
# Go to Railway dashboard → Your project → Deployments → View logs
```

**Common Fixes:**
- Verify environment variables are set
- Check if server is running (look for "Server running on port" in logs)
- Ensure data files exist in Railway

#### ❌ App Not Loading
**Symptoms:** Browser shows blank page or loading forever

**Debug Steps:**
1. Check browser console for errors
2. Verify Railway deployment is successful
3. Test health endpoint: `https://your-app.railway.app/api/health`
4. Check if React build was successful

**Common Fixes:**
```bash
# 1. Rebuild React app
npm run build

# 2. Check if build folder exists
ls -la client/build

# 3. Verify static file serving in server/index.js
```

#### ❌ Environment Variables Not Working
**Symptoms:** App runs but API calls fail, missing data

**Debug Steps:**
1. Check Railway variables are set correctly
2. Verify variable names match exactly (case-sensitive)
3. Check server logs for environment variable errors

**Common Issues:**
- Variable name typos: `OPENAI_API_KEY` not `OPENAI_APIKEY`
- Missing quotes around values
- Variables not saved in Railway dashboard

#### ❌ Domain Not Working
**Symptoms:** Custom domain shows error or doesn't load

**Debug Steps:**
```bash
# 1. Check DNS propagation
nslookup your-domain.com

# 2. Test Railway subdomain first
curl https://your-app-name.railway.app/api/health

# 3. Verify CNAME records
dig your-domain.com CNAME
```

**Common Fixes:**
- Wait for DNS propagation (up to 24 hours)
- Verify CNAME points to correct Railway URL
- Check domain provider settings
- Update CORS_ORIGIN to match domain

### 🆘 Getting Help

#### Railway Support
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status Page](https://status.railway.app)

#### Debug Commands
```bash
# Test your app locally first
npm run build
npm run start:prod

# Check if all files are committed
git status

# Verify environment variables
echo $OPENAI_API_KEY

# Test API endpoints
curl http://localhost:5001/api/health
```

## Cost Estimation

### Railway Free Tier
- **Deployments**: Unlimited
- **Bandwidth**: 100GB/month
- **Build minutes**: 500/month
- **Sleep**: Apps sleep after 5 minutes of inactivity

### Paid Plans
- **Hobby**: $5/month
- **Pro**: $20/month
- **Team**: $99/month

## Security Considerations

1. **Environment Variables**: Never commit API keys
2. **CORS**: Set specific origins, not wildcards
3. **HTTPS**: Railway provides free SSL certificates
4. **Rate Limiting**: Consider adding for production

## Next Steps After Deployment

1. **Set up monitoring** (Railway provides basic monitoring)
2. **Configure backups** (Railway has built-in backups)
3. **Set up CI/CD** (Railway auto-deploys on git push)
4. **Add analytics** (Google Analytics, etc.)
5. **SEO optimization** (meta tags, sitemap)

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [GitHub Issues](https://github.com/your-repo/issues)

---

## ⚡ Quick Start Checklist

### Before You Begin
- [ ] OpenAI API key ready
- [ ] GitHub account created
- [ ] Code pushed to GitHub repository
- [ ] Railway account created

### Deployment Steps (15 minutes)
- [ ] Deploy from GitHub to Railway
- [ ] Set environment variables in Railway
- [ ] Test Railway subdomain
- [ ] Verify app is working
- [ ] (Optional) Set up custom domain

### After Deployment
- [ ] Test all functionality
- [ ] Share your app URL
- [ ] Monitor Railway dashboard
- [ ] Set up monitoring/alerts

### Common Issues to Watch For
- [ ] Build failures (check logs)
- [ ] CORS errors (check CORS_ORIGIN)
- [ ] Memory issues (upgrade plan if needed)
- [ ] API not working (check environment variables)

---

## 🎉 Success!

**Your app will be live at**: `https://your-app-name.railway.app`
**Custom domain**: `https://your-domain.com` (after DNS setup)

### Next Steps
1. **Test thoroughly** - Make sure all features work
2. **Share your app** - Send the URL to friends/users
3. **Monitor performance** - Use Railway dashboard
4. **Consider upgrades** - If you need more resources
5. **Add analytics** - Google Analytics, etc.
6. **SEO optimization** - Meta tags, sitemap

### Need Help?
- Check the troubleshooting section above
- Visit [Railway Discord](https://discord.gg/railway)
- Read [Railway Docs](https://docs.railway.app)

**Happy deploying! 🚀**
