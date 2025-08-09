const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building for Cloudflare Pages (Windows Compatible)...');

// Step 1: Clean previous builds
if (fs.existsSync('.next')) {
  console.log('🧹 Cleaning previous build...');
  fs.rmSync('.next', { recursive: true, force: true });
}

// Step 2: Run Next.js build
console.log('📦 Building Next.js application...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Build failed:', error);
    return;
  }
  
  console.log('✅ Build completed successfully!');
  console.log('\n📁 Build output is in the .next directory');
  
  // Step 3: Instructions for manual deployment
  console.log('\n🔧 Next steps for deployment:');
  console.log('1. Go to https://dash.cloudflare.com/');
  console.log('2. Navigate to Pages → Create a project');
  console.log('3. Choose "Connect to Git" and select your GitHub repository');
  console.log('4. Or choose "Upload assets" and upload the .next directory');
  console.log('\n🌐 Build settings for Cloudflare Pages:');
  console.log('   Framework: Next.js');
  console.log('   Build command: npm run build');
  console.log('   Output directory: .next');
  console.log('\n🔑 Don\'t forget to set your environment variables in Cloudflare Pages settings!');
});

// Step 4: Check for required files
setTimeout(() => {
  const requiredFiles = [
    'package.json',
    'next.config.ts',
    'wrangler.toml'
  ];
  
  console.log('\n🔍 Checking required files...');
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} found`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });
}, 1000);
