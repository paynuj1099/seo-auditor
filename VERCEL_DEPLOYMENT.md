# Vercel Deployment Guide

## Quick Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import in Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Configure (Optional):**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: (uses vercel.json)
   - Output Directory: (auto-detected)

4. **Deploy:**
   - Click "Deploy"
   - Vercel will install Chromium during build (via vercel.json)
   - First deploy takes 2-3 minutes

### Method 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

## How It Works

### Playwright on Vercel

The app uses **`playwright-core`** for browser automation:

- ✅ **Lightweight** - No bundled browsers in the package
- ✅ **Build-time installation** - Chromium installed during Vercel build
- ✅ **Serverless-optimized** - Uses minimal resources

### Build Process

The build command in vercel.json installs Chromium without system dependencies:

```json
{
  "buildCommand": "npx playwright install chromium && npm run build"
}
```

This installs just the Chromium browser binary (not system deps) during the Vercel build.

### Runtime Behavior

- **Development**: Uses locally installed Chromium (run `npx playwright install chromium`)
- **Vercel Production**: Uses Chromium installed during build
- **Serverless Optimized**: Single-process mode, no GPU, minimal memory

## Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

```env
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_MAX_SCREENSHOT_HEIGHT=10000
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Important Notes

### Function Timeout
- Free tier: 10 seconds (screenshots may fail)
- Pro tier: 60 seconds (configured in vercel.json)
- **Recommended**: Upgrade to Pro for reliable screenshots

### Memory Limits
- Chromium uses ~200-300MB per audit
- Vercel serverless functions have 1GB memory limit
- Concurrent audits are limited by this

### Screenshot Storage
- Currently uses `/public/screenshots/` (ephemeral on Vercel)
- **For production**: Migrate to Vercel Blob, AWS S3, or Cloudflare R2
- Screenshots are lost on redeployment

## Troubleshooting

### "Browser initialization failed"

**Cause**: Chromium not installed or timeout during launch

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify `playwright install` ran successfully
3. Increase function timeout (Pro plan required)
4. Check error logs in Vercel Function Logs

### Screenshots timeout

**Cause**: Website takes >60 seconds to load

**Solutions**:
1. Reduce `PLAYWRIGHT_TIMEOUT` to fail faster
2. Make screenshots optional (already handled in UI)
3. Use webhook/background job for long audits

### Out of memory

**Cause**: Too many concurrent browser instances

**Solutions**:
1. Add rate limiting (already implemented)
2. Use dedicated worker service for screenshots
3. Upgrade Vercel plan for more memory

## Performance Optimization

### Cold Starts
- First request after idle: 3-5 seconds
- Subsequent requests: <1 second
- Chromium stays warm between requests

### Speed Tips
1. **Enable caching**: Add `Cache-Control` headers to API routes
2. **Optimize screenshots**: Reduce viewport sizes if needed
3. **Lazy load**: Make screenshots optional or async
4. **CDN**: Use Vercel's Edge Network for static assets

## Alternative Deployments

### Railway / Render

If screenshots are critical and you need more control:

```bash
# Install full Playwright
npm install playwright
npx playwright install chromium --with-deps

# Deploy to Railway
railway up

# Or Render
render deploy
```

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.45.3-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
```

## Production Checklist

- [ ] Push code to GitHub
- [ ] Import project in Vercel
- [ ] Set environment variables
- [ ] Verify build completes successfully  
- [ ] Test audits on production URL
- [ ] Check screenshot generation works
- [ ] Monitor function logs for errors
- [ ] Set up custom domain (optional)
- [ ] Configure rate limiting if needed
- [ ] Plan for screenshot storage migration

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Playwright on Vercel**: https://vercel.com/guides/playwright
- **This Project**: Check README.md for architecture details
