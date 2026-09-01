---
title: 'Security & Data Privacy Policy'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '05-security-and-data-privacy'
description: 'Handling credentials, secret rotation schedules, data protection, and incident reporting.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Security & Data Privacy Policy

Security is a foundational responsibility for all team members and software maintainers.

---

## 1. Secrets Management Rules

1. **Never Commit Secrets:** Any commit containing API keys, private keys, database passwords, or auth tokens must be immediately rewritten and the leaked secret rotated.
2. **Environment Variable Naming:** Use standardized prefixes:
   - `NEXT_PUBLIC_*` for client-safe constants only (e.g. Firebase project ID).
   - Unprefixed variables for sensitive backend secrets (e.g. `FIREBASE_PRIVATE_KEY`, `RAZORPAY_KEY_SECRET`).
3. **Secret Rotation:** Production API keys and admin session secrets must be rotated every 6 months and immediately following team leadership transitions.

---

## 2. Incident Response Workflow

1. **Discovery:** If a vulnerability or leaked credential is discovered, alert the Technical Lead immediately.
2. **Containment:** Invalidate the compromised token or key in the cloud dashboard within 15 minutes.
3. **Remediation:** Deploy new secrets, audit access logs for suspicious activity, and document findings in the internal post-mortem log.
