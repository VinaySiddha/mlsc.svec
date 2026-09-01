---
title: 'Monitoring, Logging & Troubleshooting'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '09-monitoring-and-troubleshooting'
description: 'Telemetry, error diagnosis, OpenTelemetry/Jaeger tracing, and common fix playbooks.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Monitoring, Logging & Troubleshooting

MLSC SVEC integrates automated telemetry, distributed tracing, and structured error reporting to detect and resolve technical anomalies rapidly.

---

## 1. Observability Stack

- **Application Performance & Tracing:** OpenTelemetry exporter paired with Jaeger (`@opentelemetry/exporter-jaeger`).
- **Web Analytics:** Google Analytics 4 measuring page interactions, registration conversion funnels, and Study Hub problem completions.
- **Error Triage Portal:** Real-time bug reporting and error logging accessible at `mlscsvec.com/admin/operations/errors`.

---

## 2. Common Troubleshooting Playbooks

```text
┌──────────────────────────────┬──────────────────────────────┬───────────────────────────────┐
│ Symptom                      │ Probable Root Cause          │ Resolution Playbook           │
├──────────────────────────────┼──────────────────────────────┼───────────────────────────────┤
│ Build fails with Turbopack   │ Missing environment variable │ Verify .env.local has all keys│
│ or TypeScript errors         │ or type mismatch in ServerAct│ Run `npm run typecheck` locally│
├──────────────────────────────┼──────────────────────────────┼───────────────────────────────┤
│ Firestore "Permission Denied"│ Missing Firebase Admin auth  │ Ensure action runs server-side│
│ on client write              │ or expired security token    │ Check Firestore Security Rules│
├──────────────────────────────┼──────────────────────────────┼───────────────────────────────┤
│ Razorpay payment completes   │ Webhook signature mismatch or│ Manually verify in /admin/pay │
│ but ticket not marked active │ network drop during redirect │ Re-trigger verify action      │
├──────────────────────────────┼──────────────────────────────┼───────────────────────────────┤
│ WebRTC meeting video lag or  │ Port 40000-49999 UDP blocked │ Open firewall UDP range       │
│ black screen on student wifi │ by college network firewall  │ Enable TURN server fallback   │
└──────────────────────────────┴──────────────────────────────┴───────────────────────────────┘
```
