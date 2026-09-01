# 📚 MLSC SVEC Documentation Platform (`docs-site`)

> **Single Source of Truth Knowledge Base for MLSC SVEC**  
> Primary Subdomain: **`https://docs.mlscsvec.com`**

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd docs-site
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The documentation portal will start at **`http://localhost:3001`**.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🌐 Deploying to Subdomain (`docs.mlscsvec.com`)

### Option A: Vercel (Recommended)
1. In Vercel, click **Add New Project** and select the `mlsc.svec` repository.
2. Under **Root Directory**, select `docs-site`.
3. Under **Domain Settings**, add custom domain: `docs.mlscsvec.com`.
4. Configure DNS CNAME record:
   - **Type:** `CNAME`
   - **Name:** `docs`
   - **Value:** `cname.vercel-dns.com`

---

### Option B: Cloudflare Pages
1. Build command: `npm run build`
2. Output directory: `.next`
3. Custom Domains: Add `docs.mlscsvec.com`

---

### Option C: Standalone Node / Docker
```bash
cd docs-site
npm run build
PORT=3000 npm run start
```

---

## 📁 Content Structure

All documentation articles live inside `content/` organized across 11 standard operating divisions:

```
docs-site/content/
├── 01-introduction/
├── 02-getting-started/
├── 03-membership/
├── 04-teams-and-roles/
├── 05-events/
├── 06-administration/
├── 07-technical-documentation/
├── 08-projects/
├── 09-guidelines-and-policies/
├── 10-faqs/
└── 11-handover-and-continuity/
```

To add a new article:
1. Place a `.md` file inside the appropriate category folder.
2. Include standard frontmatter:
```markdown
---
title: "Article Title"
description: "Brief overview of the article"
publishedAt: "2026-09-01"
---
```
3. The platform automatically indexes the article, adds it to the sidebar, generates the Table of Contents, and includes it in `⌘K` global search.
