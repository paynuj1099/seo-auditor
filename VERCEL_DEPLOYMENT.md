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
   - Build Command: (default)
   - Output Directory: (auto-detected)

4. **Deploy:**
   - Click "Deploy"
   - First deploy takes 1-2 minutes

### Method 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

## How It Works

### Live Website Previews

The app uses **iframe embeds** to show live website previews:

- ✅ **No browser automation** - No Playwright/Chromium dependencies
- ✅ **Instant previews** - Shows the actual live website
- ✅ **Zero setup** - Works out of the box on Vercel
- ✅ **No storage needed** - No screenshot files to manage
- ✅ **Always current** - Shows real-time website state

### Build Process

Standard Next.js build - no special configuration needed:

```bash
npm install && npm run build
```

### Runtime Behavior

- **Desktop & Mobile previews**: Rendered via iframes in device mockups
- **Serverless-optimized**: Minimal resource usage
- **Fast audits**: No waiting for screenshot capture

## Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

```env
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Important Notes

### Function Timeout
- Free tier: 10 seconds
- Pro tier: 60 seconds (configured in vercel.json)
- Audits typically complete in 5-15 seconds

### Memory Limits
- Audits use minimal memory (~50-100MB)
- No browser automation overhead
- Concurrent audits scale well

### Preview Storage
- Live iframes show real-time website state
- No storage needed for screenshots
- No cleanup required

## Troubleshooting

### "Website preview not loading"

**Cause**: Target website blocks iframe embedding (X-Frame-Options or CSP headers)

**Solutions**:
- This is a limitation of the target website's security policy
- The audit data and recommendations still work perfectly
- Users can click "Visit Site" to view the website directly

### Deployment fails

**Cause**: Build or configuration error
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
