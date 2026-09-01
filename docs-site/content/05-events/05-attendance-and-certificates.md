---
title: 'Attendance & Cryptographic Certificates'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '05-attendance-and-certificates'
description: 'Digital attendance tracking, automated certificate issuance, and online verification system.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Attendance & Cryptographic Certificates

MLSC SVEC issues cryptographically verifiable, high-resolution digital certificates for event participants, workshop completers, and hackathon winners.

---

## 1. Automated Certificate Generation Pipeline

```mermaid
graph LR
    ATT[Live Attendance Logged via QR] --> AUDIT[Admin Verifies Attendance Roster]
    AUDIT --> CERT_ENG[Certificate Engine / JSPDF Engine]
    CERT_ENG --> DB[Unique Certificate Token Stored in Firestore]
    DB --> EMAIL[Automated Email Notification with Direct Download Link]
    DB --> PUBLIC_URL[Public Verification at mlscsvec.com/id/[id]]
```

---

## 2. Certificate Security & Verification Rules

1. **Unique Certificate Hash ID:** Every certificate contains an immutable unique identifier (e.g. `MLSC-SVEC-2026-EVT-9842`).
2. **Public Verification Endpoint:** Anyone (recruiters, professors, institutions) can verify authenticity by visiting `https://mlscsvec.com/id/[id]` or scanning the embedded QR code on the certificate.
3. **Zero Tampering:** The certificate details (Name, Roll Number, Event Title, Date, Tier) are fetched dynamically from verified Firestore records.
4. **Eligibility Threshold:** Certificates are only generated for participants with confirmed attendance records (minimum 80% session duration).
