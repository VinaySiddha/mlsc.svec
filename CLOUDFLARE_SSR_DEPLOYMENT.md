# Cloudflare Pages SSR Deployment Guide

## Overview
This guide will help you deploy your Next.js hiring application with Server-Side Rendering (SSR) support on Cloudflare Pages using your Hostinger domain.

## Prerequisites
1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally
   ```bash
   npm install -g wrangler
   ```
3. **Domain**: Your Hostinger domain ready for DNS configuration

## Step 1: Prepare Your Application

### 1.1 Edge Runtime Configuration
Your app is already configured with edge runtime exports in key pages:
- ✅ `src/app/page.tsx` - Main application page
- ✅ `src/app/admin/page.tsx` - Admin dashboard
- ✅ `src/app/status/page.tsx` - Status check page
- ✅ `src/app/api/auth/route.ts` - API routes

### 1.2 Dependencies
Ensure all dependencies are compatible with edge runtime:
- ✅ Next.js with Cloudflare adapter installed
- ✅ Firebase (works with edge runtime)
- ⚠️ Nodemailer replaced with Cloudflare-compatible email service

## Step 2: Environment Setup

### 2.1 Create .env.local for Development
```bash
# Copy your existing environment variables
cp .env.example .env.local
```

### 2.2 Configure Secrets for Production
Add your secrets to Cloudflare:
```bash
# Authenticate with Cloudflare
wrangler login

# Add secrets (replace with your actual values)
wrangler secret put JWT_SECRET
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put FIREBASE_CLIENT_EMAIL
wrangler secret put GOOGLE_AI_API_KEY
wrangler secret put ADMIN_EMAIL
wrangler secret put ADMIN_PASSWORD
```

## Step 3: Build and Test Locally

### 3.1 Build for Cloudflare
```bash
# Build the application for Cloudflare Pages
npm run cf:build
```

### 3.2 Preview Locally
```bash
# Test the build locally with Wrangler
npm run cf:preview
```

Visit `http://localhost:8788` to test your application locally.

## Step 4: Deploy to Cloudflare Pages

### 4.1 Initial Deployment
```bash
# Deploy to Cloudflare Pages
npm run cf:deploy
```

### 4.2 Alternative: Git-based Deployment
1. Push your code to GitHub
2. Connect your repository in Cloudflare Pages dashboard
3. Set build command: `npm run cf:build`
4. Set output directory: `.vercel/output/static`

## Step 5: Configure Your Domain

### 5.1 Change Nameservers in Hostinger
1. Log into your Hostinger account
2. Go to Domain management
3. Change nameservers to Cloudflare's (you'll get these after adding your domain to Cloudflare)

### 5.2 Add Domain to Cloudflare
1. In Cloudflare dashboard, click "Add a site"
2. Enter your domain name
3. Choose the Free plan
4. Copy the provided nameservers
5. Update nameservers in Hostinger

### 5.3 Configure DNS Records
In Cloudflare DNS settings:
1. Add CNAME record: `your-domain.com` → `your-pages-project.pages.dev`
2. Add CNAME record: `www` → `your-domain.com`

### 5.4 Set Custom Domain in Pages
1. Go to your Pages project in Cloudflare dashboard
2. Navigate to "Custom domains"
3. Add your domain
4. Cloudflare will automatically provision SSL certificate

## Step 6: Environment Variables in Production

### 6.1 Set Environment Variables
In your Cloudflare Pages project:
1. Go to Settings → Environment variables
2. Add production variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
   ```

### 6.2 Verify Secrets
Ensure all secrets are properly set:
```bash
wrangler secret list
```

## Step 7: Monitoring and Optimization

### 7.1 Analytics
Enable Cloudflare Analytics in your dashboard to monitor:
- Page views
- Performance metrics
- Error rates

### 7.2 Performance Optimization
- ✅ Images optimized for edge runtime
- ✅ Static assets cached automatically
- ✅ Global CDN distribution

## Troubleshooting

### Common Issues

1. **Build Errors with Edge Runtime**
   - Ensure all pages/API routes have `export const runtime = 'edge';`
   - Check for Node.js-specific APIs that aren't supported

2. **Environment Variables Not Working**
   - Verify secrets are set with `wrangler secret list`
   - Check environment variable names match your code

3. **Domain Not Connecting**
   - Wait 24-48 hours for DNS propagation
   - Verify nameservers are correctly set in Hostinger

4. **SSR Pages Not Working**
   - Ensure pages have `export const runtime = 'edge';`
   - Check Cloudflare compatibility date in wrangler.toml

### Useful Commands

```bash
# Build and deploy
npm run cf:deploy

# View logs
wrangler pages deployment tail

# List deployments
wrangler pages deployment list

# Check secrets
wrangler secret list

# Update a secret
wrangler secret put SECRET_NAME
```

## Benefits of Cloudflare SSR

1. **Global Performance**: Your SSR pages load fast worldwide
2. **Cost-Effective**: Free tier with generous limits
3. **Automatic Scaling**: Handles traffic spikes automatically
4. **Security**: Built-in DDoS protection and WAF
5. **SSL/HTTPS**: Free SSL certificates with automatic renewal

## Next Steps

1. ✅ Deploy your application
2. ✅ Configure your domain
3. ✅ Set up monitoring
4. 🔄 Test all functionality
5. 🔄 Monitor performance and optimize

Your Next.js hiring application with SSR is now ready for production on Cloudflare Pages!

## Support Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
