---
title: 'Event Execution & Digital Registrations'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '03-event-execution-and-registrations'
description: 'Portal registration system, QR ticketing, payment verification, and on-site check-in.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Event Execution & Digital Registrations

MLSC SVEC utilizes a custom-built digital registration and QR ticketing engine integrated directly into `mlscsvec.com`.

---

## 1. Digital Registration Architecture

```mermaid
sequenceDiagram
    participant User as Student
    participant Web as mlscsvec.com/events
    participant DB as Cloud Firestore
    participant Pay as Razorpay / MLSC Pay
    participant Email as Nodemailer / Notification Engine
    participant Scan as Volunteer QR Scanner

    User->>Web: Clicks Register on Event
    Web->>DB: Checks Seat Capacity & Auth Status
    alt Paid Event
        Web->>Pay: Initiates Payment Gateway Transaction
        Pay-->>Web: Returns Payment Verification Signature
    end
    Web->>DB: Stores Registration & Generates Unique QR Token
    Web->>Email: Dispatches Confirmation with Pass QR Code
    User->>Scan: Presents Pass QR Code at Event Entry
    Scan->>DB: Scans QR & Atomically Marks Attendance
    DB-->>Scan: Displays Verified Green Badge
```

---

## 2. On-Site Check-In Operating Protocol

1. **Scanner Readiness:** Volunteers open the admin scanner tool at `mlscsvec.com/admin/attendance` on mobile devices.
2. **Scan Verification:** The scanner reads the attendee's QR token, queries Firestore in real-time, and confirms:
   - Attendee Name & College Roll Number
   - Valid Payment / Registration Status
   - Has Not Already Been Scanned (Prevents duplicate entry)
3. **Badge Handover:** Attendee is marked `present` and provided their event kit.
