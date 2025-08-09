# Cloudflare Workers Deployment Guide

This guide will help you deploy your Next.js hiring application to Cloudflare Workers.

## Prerequisites

1. A Cloudflare account
2. Node.js 18+ installed
3. npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install the required Cloudflare Workers dependencies including:
- `@cloudflare/next-on-pages`
- `wrangler`

### 2. Authentication with Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

### 3. Configure Environment Variables

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Fill in your actual values in `.env.local`

3. Set secrets in Cloudflare Workers:
```bash
# Set JWT secret
npx wrangler secret put JWT_SECRET

# Set Firebase configuration
npx wrangler secret put FIREBASE_API_KEY
npx wrangler secret put FIREBASE_AUTH_DOMAIN
npx wrangler secret put FIREBASE_PROJECT_ID
npx wrangler secret put FIREBASE_STORAGE_BUCKET
npx wrangler secret put FIREBASE_MESSAGING_SENDER_ID
npx wrangler secret put FIREBASE_APP_ID

# Set email configuration (if needed)
npx wrangler secret put EMAIL_HOST
npx wrangler secret put EMAIL_USER
npx wrangler secret put EMAIL_PASS

# Set Google AI API key
npx wrangler secret put GOOGLE_AI_API_KEY
```

### 4. Build and Deploy

#### For Development Preview:
```bash
npm run preview
```

#### For Production Deployment:
```bash
npm run deploy
```

### 5. Custom Domain (Optional)

To use a custom domain:

1. Add your domain to Cloudflare
2. Update `wrangler.toml` to include your domain:
```toml
[env.production.routes]
patterns = ["yourdomain.com/*"]
```
3. Redeploy:
```bash
npm run deploy
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run pages:build` - Build for Cloudflare Workers
- `npm run preview` - Build and preview locally
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run pages:watch` - Build in watch mode

## Important Notes

### 1. Environment Variables
- Sensitive data (API keys, secrets) should be set using `wrangler secret put`
- Public environment variables can be set in `wrangler.toml` under `[vars]`

### 2. Database Considerations
- Your Firebase integration should work seamlessly
- Consider using Cloudflare D1 for SQL databases if needed
- For session storage, consider Cloudflare KV

### 3. Email Services
- Nodemailer may have limitations in Workers environment
- Consider using Cloudflare Email Workers or external email APIs like SendGrid

### 4. File Uploads
- Static file serving works automatically
- For dynamic file uploads, consider Cloudflare R2 storage

### 5. GenKit AI
- Should work in Workers environment
- Monitor usage and consider rate limiting

## Troubleshooting

### Build Issues
- Ensure all dependencies are compatible with Edge Runtime
- Check for Node.js-specific APIs that may need polyfills

### Environment Variables
- Double-check that all secrets are properly set
- Verify variable names match exactly

### Performance
- Monitor Workers usage in Cloudflare dashboard
- Consider caching strategies for frequently accessed data

## Monitoring and Logs

View logs in real-time:
```bash
npx wrangler tail
```

## Support

- Cloudflare Workers Documentation: https://developers.cloudflare.com/workers/
- Next.js on Cloudflare: https://developers.cloudflare.com/pages/framework-guides/nextjs/
