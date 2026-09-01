---
title: 'Architecture & Technology Stack'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '02-architecture-and-tech-stack'
description: 'High-level system architecture, component layers, cloud services, and runtime frameworks.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Architecture & Technology Stack

MLSC SVEC's core web platform (`mlscsvec.com`) and auxiliary systems are built using a modern, scalable, full-stack cloud architecture.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Client[Web Browser / Mobile Client] --> Cloudflare[Cloudflare Edge DNS / CDN / WAF]
    Cloudflare --> NextServer[Next.js App Router Server / Edge Middleware]
    
    NextServer --> ServerActions[Next.js Server Actions & API Routes]
    NextServer --> StaticGen[Turbopack SSG / ISR Caching Layer]

    ServerActions --> FirebaseAdmin[Firebase Admin SDK]
    FirebaseAdmin --> Firestore[Cloud Firestore NoSQL Database]
    
    ServerActions --> Genkit[Google Genkit AI Engine / Gemini API]
    ServerActions --> Razorpay[Razorpay Payment Gateway]
    ServerActions --> Nodemailer[Nodemailer SMTP Service]
    
    NextServer --> SFU[WebRTC SFU Media Server / Redis Cluster]
```

---

## 2. Core Technology Stack Table

```text
┌─────────────────────────┬──────────────────────────────────────────────┐
│ Layer                   │ Technologies & Frameworks                    │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Frontend Framework      │ Next.js 16 (App Router), React 19            │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Language & Styling      │ TypeScript 5.x, Tailwind CSS, Radix UI Prims │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Animations & Motion     │ Framer Motion, Motion One, CSS Keyframes     │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Database & Backend Auth │ Google Cloud Firestore, Firebase Admin SDK   │
├─────────────────────────┼──────────────────────────────────────────────┤
│ AI & LLM Pipelines      │ Google Genkit 1.11, Google AI Gemini 1.5/2.0 │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Payment Processing      │ Razorpay Gateway, Custom MLSC Ledger         │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Real-Time Communication │ Node.js, Socket.io, Mediasoup WebRTC, Redis  │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Edge & DNS Routing      │ Cloudflare DNS, SSL/TLS, Caching Rules       │
└─────────────────────────┴──────────────────────────────────────────────┘
```
