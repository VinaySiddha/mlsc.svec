---
title: 'Project Portfolio Overview'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '01-project-portfolio-overview'
description: 'High-level inventory of active production software systems maintained by MLSC SVEC.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Project Portfolio Overview

MLSC SVEC designs, ships, and maintains a diverse suite of production applications serving thousands of students across campus.

---

## 1. Active Production Systems

```text
┌────────────────────────────┬────────────────────────────┬──────────────────────────────┐
│ System Name                │ Purpose & Core Capability  │ Production Hostname          │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ 1. MLSC SVEC Main Portal   │ Flagship community portal, │ https://mlscsvec.com         │
│                            │ ticketing, admin console   │                              │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ 2. Study Hub & SDE Tracker │ Interactive DSA roadmap,   │ https://mlscsvec.com/study   │
│                            │ leaderboard, daily streaks │                              │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ 3. MLSC Docs (Outstatic)   │ Single Source of Truth     │ https://docs.mlscsvec.com    │
│                            │ official knowledge base    │                              │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ 4. WebRTC Meeting SFU      │ 500-peer low-latency video │ https://meet.mlscsvec.com    │
│                            │ conferencing infrastructure│                              │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ 5. Kiri AI Assistant       │ Genkit-powered multimodal  │ Integrated in web portal     │
│                            │ intelligence & navigation  │                              │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ 6. Cryptographic Certs API │ Tamper-proof certificate   │ https://mlscsvec.com/id/[id] │
│                            │ generation & verification  │                              │
└────────────────────────────┴────────────────────────────┴──────────────────────────────┘
```

---

## 2. Project Lifecycle & Ownership

Every active project must have:
- An assigned **Project Maintainer (Lead)** responsible for pull request reviews.
- A comprehensive specification following the **Standard Technical Project Template** located on `docs.mlscsvec.com`.
- Continuous automated builds and uptime health monitoring.
