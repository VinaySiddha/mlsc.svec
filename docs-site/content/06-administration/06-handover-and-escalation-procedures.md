---
title: 'Admin Handover & Escalation Procedures'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '06-handover-and-escalation-procedures'
description: 'Incident escalation matrix, emergency response, and annual administrative succession protocols.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Admin Handover & Escalation Procedures

Clear escalation protocols ensure swift resolution for technical outages, safety concerns, and leadership transitions.

---

## 1. Incident Escalation Matrix

```text
┌───────────┬─────────────────────────────────┬───────────────────────────┐
│ Severity  │ Incident Type                   │ Immediate Action Protocol │
├───────────┼─────────────────────────────────┼───────────────────────────┤
│ Level 1   │ Production Website Downtime /   │ On-call Tech Lead alerts  │
│ (Critical)│ Security Breach / Payment Fail  │ President; roll back PR.  │
├───────────┼─────────────────────────────────┼───────────────────────────┤
│ Level 2   │ Code of Conduct Violation /     │ Remove offending messages;│
│ (High)    │ Severe Harassment / Lab Incident│ escalate to Ops Lead & FA.│
├───────────┼─────────────────────────────────┼───────────────────────────┤
│ Level 3   │ Minor UI Bug / User Ticket /    │ Assign to volunteer lead; │
│ (Medium)  │ Certificate Typo                │ resolve within 24 hours.  │
└───────────┴─────────────────────────────────┴───────────────────────────┘
```

---

## 2. Annual Administrative Handover Process

1. **Succession Selection:** In May of each academic year, outgoing leads interview and nominate incoming successors.
2. **Access Transition:** Outgoing administrators guide incoming leads through all portals (`/admin`, Firebase, Cloudflare, GitHub).
3. **Institutional Audit:** Complete verification of `docs.mlscsvec.com` to ensure all active services, scripts, and endpoints are accurately documented.
4. **Credential Rotation:** Passwords, API secrets, and webhook tokens are regenerated and stored in the club's primary vault.
