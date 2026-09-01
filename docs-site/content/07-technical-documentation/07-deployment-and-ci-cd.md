---
title: 'Deployment & CI/CD Pipelines'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '07-deployment-and-ci-cd'
description: 'Build automation, Cloudflare SSR deployment, edge caching, and release pipelines.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Deployment & CI/CD Pipelines

MLSC SVEC employs continuous integration and automated deployment pipelines to ensure high availability and rapid software delivery.

---

## 1. Deployment Pipeline Architecture

```mermaid
graph LR
    Dev[Developer PR] --> GitHubCI[GitHub Actions CI: Lint & Build]
    GitHubCI --> Review[Core Lead Code Review]
    Review --> Merge[Merge to main]
    Merge --> DeployEdge[Automated Edge Deployment]
    DeployEdge --> Sitemap[Post-Build Sitemap Generator]
    Sitemap --> Live[Live on mlscsvec.com]
```

---

## 2. Production Build Commands

```bash
# Clean Install Dependencies
npm ci

# Validate TypeScript Types
npm run typecheck

# Execute Turbopack Next.js Production Build
npm run build

# Generate Static XML Sitemap (Automated postbuild)
npm run postbuild
```

---

## 3. Cloudflare Edge Rules & Caching

- **Static Assets (`/_next/static/*`, `/images/*`):** Cached aggressively at the Cloudflare Edge with `Cache-Control: public, max-age=31536000, immutable`.
- **Dynamic Server Routes (`/api/*`, `/admin/*`, `/profile/*`):** Bypass edge cache to ensure real-time data freshness and authenticated security.
- **SSL/TLS Encryption:** Full (Strict) mode with automated Let's Encrypt / Cloudflare Universal SSL certificates.
