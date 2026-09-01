---
title: 'Technical FAQs'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '10-technical-faqs'
description: 'Frequently asked questions regarding developer setup, API rate limits, and server operations.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Technical FAQs

---

### Q: Why do we use Next.js App Router and Server Actions instead of a separate Express backend?
**A:** Next.js App Router and Server Actions unify frontend and backend in a single type-safe TypeScript repository. This eliminates API boilerplate, ensures direct Firestore Admin security boundaries, and dramatically speeds up development iterations for student engineering teams.

---

### Q: How do we handle Firebase Admin credentials without leaking private keys?
**A:** Private keys are stored strictly in environment variables (`FIREBASE_PRIVATE_KEY`) in local `.env.local` files (which are gitignored) and injected via encrypted cloud deployment environment secret stores in production.

---

### Q: How is the Study Hub leaderboard points system calculated?
**A:** Points are calculated dynamically based on problem difficulty tags (Easy: 10 pts, Medium: 20 pts, Hard: 40 pts) and updated atomically in Firestore using batch transactions to prevent concurrency conflicts.

---

### Q: Where do I report a newly discovered security bug?
**A:** Report security vulnerabilities directly to the Technical Lead and President via `security@mlscsvec.com`. Do not post security exploits in public Discord channels or GitHub issues.
