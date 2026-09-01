---
title: 'Development Setup & Local Workflow'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '03-development-setup'
description: 'Prerequisites, repository cloning, environment configuration, and local debugging workflows.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Development Setup & Local Workflow

Follow this guide to configure your local development environment and run the MLSC SVEC web platform.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js:** v20.x or v22.x LTS ([nodejs.org](https://nodejs.org))
- **Package Manager:** npm (v10+) or pnpm
- **Git:** Latest version configured with your GitHub credentials
- **Code Editor:** VS Code with TypeScript, Tailwind CSS IntelliSense, and ESLint extensions

---

## 2. Installation & Running Locally

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/MLSC-SVEC/mlsc.svec.git
   cd mlsc.svec
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment template to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Populate the required keys (obtain development sandbox credentials from the Technical Lead):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Verify Types and Build:**
   ```bash
   npm run typecheck
   npm run build
   ```
