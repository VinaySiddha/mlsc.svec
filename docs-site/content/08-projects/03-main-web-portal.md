---
title: 'Main Web Portal Specification'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '03-main-web-portal'
description: 'Full architecture and technical specification for the flagship mlscsvec.com platform.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Main Web Portal Specification

---

## 1. Overview
The **MLSC SVEC Web Portal** (`mlscsvec.com`) is the central digital hub of the organization, providing public information, member dashboards, event ticketing, interactive study tracks, and administrative controls.

---

## 2. Core Modules & Route Map

- `/`: Landing page featuring dynamic hero slides, ambassador showcase, domain tracks, and testimonials.
- `/study`: Interactive DSA sheet, progress tracking, and leaderboard.
- `/events` & `/events/[id]`: Event discovery, dynamic schedule, and multi-tier ticketing.
- `/apply`: Volunteer recruitment portal with resume upload and domain selection.
- `/admin/*`: Comprehensive portal administration suite.
- `/profile`: Authenticated user dashboard with event tickets and solved problem statistics.

---

## 3. Technology Stack & Packages

- **Framework:** Next.js 16 with React 19 & Turbopack.
- **Database:** Google Cloud Firestore (Admin SDK on Server Actions, Client SDK for auth).
- **Styling & UI:** Tailwind CSS, Radix UI Primitives, Lucide Icons, Tabler Icons.
- **AI Engine:** Google Genkit 1.11 with Gemini models for AI assistant flows.
- **PDF & Certificates:** `jspdf` and `jspdf-autotable` for client/server certificate generation.

---

## 4. Maintenance & Ownership
- **Lead Maintainer:** Full-Stack Web Domain Lead
- **Primary Repository:** `github.com/MLSC-SVEC/mlsc.svec`
- **Deployment Platform:** Edge Node SSR / Cloudflare Workers
