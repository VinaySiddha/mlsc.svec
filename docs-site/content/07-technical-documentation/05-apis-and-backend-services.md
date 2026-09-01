---
title: 'APIs & Backend Services'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '05-apis-and-backend-services'
description: 'Route handlers, Server Actions, Genkit AI integration, and external payment webhooks.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# APIs & Backend Services

MLSC SVEC uses a hybrid backend architecture consisting of Next.js Server Actions for secure client mutations and REST API Route Handlers (`/api/*`) for webhooks, external integrations, and AI endpoints.

---

## 1. Key API Route Endpoints

```text
┌──────────────────────────────────┬────────┬────────────────────────────────────────┐
│ Endpoint                         │ Method │ Purpose & Security Scope               │
├──────────────────────────────────┼────────┼────────────────────────────────────────┤
│ /api/payment/create-order        │ POST   │ Initiates Razorpay order transaction   │
│ /api/payment/verify              │ POST   │ Verifies payment signature & issues pass│
│ /api/gemini/generate-questions   │ POST   │ Genkit AI prompt flow for daily quizzes│
│ /api/analyze-resume              │ POST   │ AI resume parser and scoring pipeline  │
│ /api/admin/bulk-mail             │ POST   │ Admin authenticated email dispatcher   │
│ /api/admin/export-users          │ GET    │ Admin CSV generator for roll numbers   │
│ /api/github/events               │ GET    │ Fetches live community commit streams  │
│ /api/og                          │ GET    │ Dynamic Edge OpenGraph card generator  │
└──────────────────────────────────┴────────┴────────────────────────────────────────┘
```

---

## 2. Server Action Architecture

All database reads and writes on the web portal utilize authenticated Next.js Server Actions located in `src/app/actions.ts` and domain-specific action modules (e.g. `src/app/home-actions.ts`).

- **Security Boundary:** Runs securely in Node.js server environment; never exposes Firebase Admin credentials to client bundles.
- **Data Revalidation:** Calls Next.js `revalidatePath()` and `revalidateTag()` to dynamically invalidate cached pages when events or announcements update.
