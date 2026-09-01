---
title: 'Data Privacy & Compliance'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '05-data-privacy-and-compliance'
description: 'Handling Personally Identifiable Information (PII), student records, and compliance requirements.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Data Privacy & Compliance

MLSC SVEC respects the privacy rights of all students, participants, and faculty. Protecting Personally Identifiable Information (PII) is a fundamental administrative duty.

---

## 1. Classification of Member Data

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          DATA CLASSIFICATION                           │
├───────────────┬───────────────────────────────┬────────────────────────┤
│ Level         │ Data Types Included           │ Access Controls        │
├───────────────┼───────────────────────────────┼────────────────────────┤
│ Public        │ Name, branch, public GitHub,  │ Accessible to verified │
│               │ earned certificates, rank     │ logged-in users        │
├───────────────┼───────────────────────────────┼────────────────────────┤
│ Restricted    │ Email address, phone number,  │ Restricted to Core     │
│               │ roll number, attendance logs  │ Portal Administrators  │
├───────────────┼───────────────────────────────┼────────────────────────┤
│ Confidential  │ Payment transaction details,  │ Restricted to Super    │
│               │ interview feedback, audit logs│ Admins & Lead Council  │
└───────────────┴───────────────────────────────┴────────────────────────┘
```

---

## 2. Privacy Guidelines

- **No Data Selling or Sharing:** Student data is never sold, leased, or provided to commercial third parties, recruiters, or external agencies without explicit, informed student consent.
- **Export Controls:** Bulk user exports (`/api/admin/export-users`) must only be triggered for legitimate reporting to the college management or issuing certificates.
- **Secure Storage:** All sensitive environment variables, service accounts, and API tokens are encrypted in production secret stores and never checked into source control.
