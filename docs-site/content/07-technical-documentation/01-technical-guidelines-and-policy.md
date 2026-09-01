---
title: 'Technical Guidelines & Single Source of Truth Policy'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '01-technical-guidelines-and-policy'
description: 'Fundamental engineering rules, architectural policies, and the Single Source of Truth mandate.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Technical Guidelines & Single Source of Truth Policy

---

## 1. The Single Source of Truth Policy

> **"All official MLSC SVEC technical documentation must be maintained on `docs.mlscsvec.com`. If an architectural system, API endpoint, database schema, or infrastructure workflow is not documented here, it is not considered institutional knowledge."**

Technical information should not permanently reside only in:
- Personal WhatsApp or Telegram chats
- Individual developer laptops or uncommitted branches
- Private Google Drive folders or untracked notes
- Verbal knowledge known only to a graduating lead

Temporary working notes are acceptable during active sprints, but before merging code or completing a feature, the technical specifications must be committed to `docs.mlscsvec.com`.

---

## 2. Core Engineering Principles

1. **Type Safety Across the Stack:** All application code must be written in strict TypeScript. Avoid `any` types wherever possible.
2. **Zero Secrets in Source Control:** Never commit `.env`, `.env.local`, API keys, private certificates, or database credentials. Use `.gitignore` and secret managers.
3. **Component Modularity & Reusability:** Build reusable, accessible UI components using Tailwind CSS and Radix UI primitives.
4. **Resilient Error Handling:** Client and server code must handle network failures, missing records, and invalid inputs gracefully with informative toasts or fallback states.
5. **Continuous Verification:** Every pull request must compile cleanly via `npm run build` and pass typechecking before being merged into `Dev` or `main`.
