# Cloudflare Pages Deployment Guide (Windows Alternative)

Since you're on Windows and experiencing build issues with the local CLI, here's the recommended approach using GitHub integration:

## Option 1: GitHub-Based Deployment (Recommended for Windows)

### Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Prepare for Cloudflare deployment"

# Push to your GitHub repository
git remote add origin https://github.com/VinaySiddha/hiring.git
git push -u origin master
```

### Step 2: Connect to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to "Pages" 
3. Click "Create a project"
4. Select "Connect to Git"
5. Choose your GitHub repository: `VinaySiddha/hiring`
6. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (leave empty)

### Step 3: Environment Variables
Add these in Cloudflare Pages settings:
```
NODE_ENV=production
JWT_SECRET=[your-jwt-secret]
FIREBASE_PROJECT_ID=[your-firebase-project-id]
FIREBASE_PRIVATE_KEY=[your-firebase-private-key]
FIREBASE_CLIENT_EMAIL=[your-firebase-client-email]
GOOGLE_AI_API_KEY=[your-google-ai-api-key]
ADMIN_EMAIL=[your-admin-email]
ADMIN_PASSWORD=[your-admin-password]
```

### Step 4: Deploy
1. Click "Save and Deploy"
2. Cloudflare will automatically build and deploy your application
3. You'll get a `*.pages.dev` URL

## Option 2: Manual Build and Upload

If GitHub integration doesn't work, try this manual approach:

### Step 1: Create a Linux-compatible build script
Create `scripts/build-for-cloudflare.js`:

```javascript
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building for Cloudflare Pages...');

// Run Next.js build
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('Build failed:', error);
    return;
  }
  
  console.log('Build completed successfully!');
  console.log('You can now manually upload the .next directory to Cloudflare Pages');
});
```

### Step 2: Run the build script
```bash
node scripts/build-for-cloudflare.js
```

### Step 3: Manual Upload
1. Create a new Pages project in Cloudflare
2. Choose "Upload assets"
3. Upload the contents of your `.next` directory

## Option 3: Use WSL (Windows Subsystem for Linux)

If you have WSL installed:

```bash
# Open WSL terminal
wsl

# Navigate to your project
cd /mnt/c/Users/vinay/Desktop/mlsc/hiring

# Install dependencies and build
npm install
npm run cf:build

# Deploy
npm run cf:deploy
```

## Domain Configuration

Once deployed, configure your Hostinger domain:

### Step 1: Update Nameservers
1. Login to Hostinger
2. Go to Domain management
3. Change nameservers to Cloudflare's:
   - `aniya.ns.cloudflare.com`
   - `fred.ns.cloudflare.com`
   (You'll get the exact nameservers when you add your domain to Cloudflare)

### Step 2: Add Domain to Cloudflare
1. In Cloudflare dashboard, click "Add a site"
2. Enter your domain name
3. Choose Free plan
4. Copy the provided nameservers

### Step 3: Configure DNS
1. Add CNAME record: `your-domain.com` → `your-project.pages.dev`
2. Add CNAME record: `www` → `your-domain.com`

### Step 4: Configure Custom Domain in Pages
1. Go to your Pages project
2. Navigate to "Custom domains"
3. Add your domain
4. Wait for SSL certificate provisioning

## Troubleshooting

### Common Windows Issues
1. **ENOENT errors**: Use GitHub integration instead of local CLI
2. **Permission errors**: Run terminal as administrator
3. **Symlink errors**: Use manual upload method

### Build Warnings
The build warnings about OpenTelemetry and Handlebars are normal and won't affect your deployment.

### Email Service
Your app currently uses nodemailer which won't work on Cloudflare. Consider:
- Cloudflare Email Workers
- SendGrid
- Resend
- Mailgun

## Alternative: Use Vercel (If Cloudflare doesn't work)

```bash
# Deploy to Vercel directly
npm install -g vercel
vercel

# Then configure your domain in Vercel dashboard
```

## Support

If you encounter issues:
1. Check Cloudflare Pages documentation
2. Use GitHub-based deployment (most reliable on Windows)
3. Consider using WSL for better compatibility
4. Contact Cloudflare support for deployment issues

Your Next.js application is ready for production deployment! The GitHub integration method is the most reliable for Windows users.
