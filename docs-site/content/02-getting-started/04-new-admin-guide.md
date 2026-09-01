---
title: 'New Admin Guide'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '04-new-admin-guide'
description: 'Governance, system privileges, security protocols, and operational compliance for Portal Administrators.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# New Admin Guide

**Portal Administrators** hold the highest operational and technical privileges within MLSC SVEC. With elevated authority comes the imperative for rigorous security, confidentiality, and professional accountability.

---

## 1. Scope of Administrative Privileges

Administrators have access to:
- **Admin Dashboard (`/admin`):** Managing live events, reviewing applications (`/admin/applications`), editing team rosters (`/admin/team`), configuring home carousel assets (`/admin/home-config`), and dispatching bulk notifications (`/admin/notifications`).
- **Financial & Payment Controls (`/admin/payments`):** Verifying registration payments, managing custom payment ledger entries, and downloading audit reports.
- **Production Infrastructure:** Cloudflare DNS controls, Firebase Admin console, GitHub organization permissions, and deployment webhooks.

---

## 2. Mandatory Admin Security Protocols

1. **Enforce Two-Factor Authentication (2FA):** 2FA is strictly mandatory on your personal Google, GitHub, and Cloudflare accounts used for administration.
2. **Principle of Least Privilege:** Never grant super-admin access when domain-level or event-level access suffices.
3. **No Credential Sharing:** Under no circumstances may an admin share their login, session token, or admin URL with non-admin members.
4. **Audit Trail Accountability:** All administrative actions (user status updates, bulk emails, event deletions) are automatically recorded in Firestore audit collections.
5. **Prompt Offboarding:** When an administrator graduates or steps down, their elevated permissions must be revoked within 24 hours as part of the formal handover protocol.
