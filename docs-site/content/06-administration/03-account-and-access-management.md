---
title: 'Account & Access Management'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '03-account-and-access-management'
description: 'Authentication rules, role-based access control (RBAC), 2FA enforcement, and access revocation.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Account & Access Management

MLSC SVEC enforces strict Role-Based Access Control (RBAC) across all code repositories, cloud consoles, databases, and administrative portals.

---

## 1. Access Tier Definitions

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ROLE-BASED ACCESS TIERS                         │
├───────────────┬────────────────────────────────────────────────────────┤
│ Tier Level    │ Permissions & Scopes Granted                           │
├───────────────┼────────────────────────────────────────────────────────┤
│ Super Admin   │ Firebase Owner, Cloudflare Super Admin, GitHub Owner,  │
│ (President/Lead) Full read/write/delete across all database collections│
├───────────────┼────────────────────────────────────────────────────────┤
│ Portal Admin  │ `/admin` portal access, event creation, ticket triage, │
│ (Ops / Leads) application review, user role assignment                │
├───────────────┼────────────────────────────────────────────────────────┤
│ Event Manager │ Attendance QR scanning, check-in logging, ticket view  │
├───────────────┼────────────────────────────────────────────────────────┤
│ Contributor   │ GitHub repository collaborator, issue triage, branch PR│
├───────────────┼────────────────────────────────────────────────────────┤
│ Member        │ Public portal access, study tracking, event tickets    │
└───────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Security Requirements & Offboarding

- **Mandatory 2FA:** Two-factor authentication via Authenticator Apps (Google Authenticator, Microsoft Authenticator) or security hardware keys is mandatory for all administrators.
- **No Shared Passwords:** Individual named accounts must be used for all systems; generic shared admin logins are prohibited.
- **Immediate Offboarding:** When a lead or administrator vacates their role, their permissions on GitHub, Cloudflare, Firebase, and `/admin` must be revoked within 24 hours.
