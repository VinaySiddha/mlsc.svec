---
title: 'Admin & Operations FAQs'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '04-admin-faqs'
description: 'Frequently asked questions regarding administrative permissions, audits, and moderation.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Admin & Operations FAQs

---

### Q: How do I request elevated admin access for a new core volunteer?
**A:** The Domain Lead must submit an access request to the Operations Head and President detailing the volunteer's specific duties. Once approved, the role is updated via `/admin/team`.

---

### Q: Where are admin action logs recorded?
**A:** All administrative state changes (event creation, user role upgrades, bulk emails, payment approvals) are immutably logged to the `audit_logs` collection in Cloud Firestore.

---

### Q: How do we handle inappropriate content or spam in WhatsApp groups?
**A:** Immediately delete the message for everyone, remove the violating phone number, and log the incident to `#admin-incidents` on Discord.
