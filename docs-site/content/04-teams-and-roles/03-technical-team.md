---
title: 'Technical Team Structure'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '03-technical-team'
description: 'Architecture domains, developer tracks, engineering leads, and codebase responsibilities.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Technical Team Structure

The Technical Division is responsible for architecting, writing, testing, deploying, and maintaining all software infrastructure across MLSC SVEC.

---

## 1. Technical Domain Breakdown

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        TECHNICAL DOMAINS                               │
├────────────────────┬───────────────────────────────────────────────────┤
│ Domain             │ Key Technical Stacks & Deliverables               │
├────────────────────┼───────────────────────────────────────────────────┤
│ 1. Full-Stack Web  │ Next.js App Router, React 19, TypeScript, Tailwind│
│    & App Systems   │ Server Actions, Cloud Firestore, REST APIs        │
├────────────────────┼───────────────────────────────────────────────────┤
│ 2. Cloud & DevOps  │ Cloudflare Workers, Edge Middleware, Docker, CI/CD│
│                    │ DNS, Redis clusters, SSL/TLS, Uptime Monitoring   │
├────────────────────┼───────────────────────────────────────────────────┤
│ 3. Generative AI   │ Google Genkit, Gemini 1.5/2.0 API, Vector DBs,    │
│    & Data Science  │ Kiri AI Assistant bot, Prompt evaluation pipelines│
├────────────────────┼───────────────────────────────────────────────────┤
│ 4. Distributed &   │ Node.js, Socket.io, Mediasoup / WebRTC SFU, Redis │
│    Real-Time Media │ 500-Peer Video Conference Cluster, Sub-100ms sync │
├────────────────────┼───────────────────────────────────────────────────┤
│ 5. Open Source &   │ Striver SDE sheet sync, problem curation, GitHub  │
│    Competitive DSA │ issue triage, Hacktoberfest repo maintenance      │
└────────────────────┴───────────────────────────────────────────────────┘
```

---

## 2. Engineering Lead & Contributor Roles

- **Technical Lead:** Sets coding standards, manages repository access, approves PRs to `Dev` and `main`, conducts architectural reviews.
- **Frontend Engineers:** Build accessible, high-performance UI components using Tailwind CSS and Radix UI primitives.
- **Backend & Cloud Engineers:** Design Firestore data models, enforce security rules, build transactional payment endpoints, and manage edge caching.
- **AI/ML Engineers:** Train and fine-tune AI agents, integrate Genkit flows, and build automated resume-screening and quiz-generation tools.
