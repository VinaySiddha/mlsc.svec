---
title: 'Domains, DNS & Cloud Infrastructure'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '08-domains-dns-and-infrastructure'
description: 'Domain records, DNS routing, Cloudflare nameservers, and cloud server provisioning.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Domains, DNS & Cloud Infrastructure

All domain names, subdomains, and DNS routing for MLSC SVEC are managed through Cloudflare.

---

## 1. Domain & Subdomain Mapping

```text
┌─────────────────────────┬────────┬─────────────────────────────┬───────────┐
│ Hostname                │ Type   │ Target Destination          │ Proxy     │
├─────────────────────────┼────────┼─────────────────────────────┼───────────┤
│ mlscsvec.com            │ CNAME  │ Production Web Application  │ Proxied   │
│ www.mlscsvec.com        │ CNAME  │ mlscsvec.com (Redirect 301) │ Proxied   │
│ docs.mlscsvec.com       │ CNAME  │ Outstatic Documentation Hub │ Proxied   │
│ meet.mlscsvec.com       │ A      │ WebRTC SFU Server Cluster   │ DNS Only  │
│ api.mlscsvec.com        │ CNAME  │ Backend Microservice Gateway│ Proxied   │
└─────────────────────────┴────────┴─────────────────────────────┴───────────┘
```

---

## 2. Infrastructure Inventory

- **DNS & CDN:** Cloudflare Enterprise tier (via student developer program).
- **Primary Database:** Google Cloud Firestore (Multi-region `asia-south1`).
- **AI Inference:** Google Cloud Vertex AI / Google AI Studio Gemini Pro.
- **Media SFU Nodes:** Dedicated Ubuntu 24.04 LTS instances running Mediasoup C++ worker threads and Redis pub/sub backplanes.
- **Transactional SMTP:** Nodemailer with Google Workspace / SMTP relay.
