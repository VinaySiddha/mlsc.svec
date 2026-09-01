---
title: 'Technical Infrastructure Handover'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '03-technical-handover'
description: 'Transferring GitHub organization ownership, cloud accounts, domain DNS, and server keys.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Technical Infrastructure Handover

The Technical Lead handover is a critical operational event. Failure to transfer infrastructure properly can result in locked domains, billing disruptions, or application downtime.

---

## 1. Infrastructure Transfer Matrix

```text
┌────────────────────────────┬─────────────────────────────┬───────────────────────────────┐
│ Infrastructure Component   │ Outgoing Lead Action        │ Incoming Lead Verification    │
├────────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ GitHub Organization        │ Promote incoming lead to    │ Verify Owner privileges, 2FA, │
│ (`github.com/MLSC-SVEC`)   │ Organization Owner          │ and repository access.        │
├────────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ Cloudflare DNS & CDN       │ Add incoming lead as Super  │ Verify DNS records for        │
│ (`mlscsvec.com`)           │ Administrator on account    │ mlscsvec.com and SSL rules.   │
├────────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ Google Cloud / Firebase    │ Add incoming lead as IAM    │ Confirm access to Firestore   │
│ Project Console            │ Project Owner               │ and service account keys.     │
├────────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ WebRTC SFU Server Node     │ Provision SSH keys for      │ Test SSH login, PM2 status,   │
│ (`meet.mlscsvec.com`)      │ incoming DevOps lead        │ and Redis cluster health.     │
└────────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

---

## 2. Technical Handover Verification Test

Before signing off:
1. Incoming lead creates a test PR, runs CI, and merges to `Dev`.
2. Incoming lead triggers a manual staging deployment and verifies cache invalidation.
3. Incoming lead queries Firestore and verifies audit logs.
