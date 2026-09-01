---
title: 'Technical & Development FAQs'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '05-technical-faqs'
description: 'Frequently asked questions regarding web architecture, local setup, and repository triage.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Technical & Development FAQs

---

### Q: How do I submit a bug fix or feature for the MLSC SVEC website?
**A:** 
1. Fork the `MLSC-SVEC/mlsc.svec` repository.
2. Create a branch from `Dev`: `git checkout -b feature/my-cool-feature`.
3. Implement your changes, test locally (`npm run build`).
4. Submit a Pull Request targeting the `Dev` branch.

---

### Q: Why do we use Cloud Firestore over PostgreSQL/MongoDB?
**A:** Firestore provides native real-time subscriptions, zero-maintenance serverless scalability, seamless Firebase Admin SDK integration, and rapid sub-second query latency for concurrent students without managing database servers.

---

### Q: What is Kiri and how does it work?
**A:** Kiri is the official MLSC SVEC AI assistant. It is powered by Google Genkit and the Gemini 1.5/2.0 API, configured with custom tools and club knowledge bases to assist students with navigation, roadmap guidance, and technical concepts.
