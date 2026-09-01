---
title: 'Organizational Structure'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '03-organizational-structure'
description: 'Hierarchy, governance tiers, domains, and reporting structure of MLSC SVEC.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Organizational Structure

MLSC SVEC operates under a tiered, decentralized structure that balances strategic administrative oversight with rapid domain execution.

---

## 1. Governance Hierarchy Diagram

```mermaid
graph TD
    FA[Faculty Advisor / HOD CSE] --> AMB[Lead Ambassador / President]
    AMB --> VP[Vice President / Operations Lead]
    
    VP --> ADM[Administrative Council]
    VP --> TECH[Technical Division Lead]
    VP --> DESIGN[Design & Media Lead]
    VP --> MKTG[Marketing & PR Lead]
    VP --> EVT[Event Management Lead]

    ADM --> ADM_MEMBERS[Portal Admins & Audit Leads]
    
    TECH --> D_AI[Domain Lead: Generative AI & ML]
    TECH --> D_CLOUD[Domain Lead: Cloud & DevOps]
    TECH --> D_WEB[Domain Lead: Full-Stack Web & App]
    TECH --> D_OS[Domain Lead: Open Source & DSA]
    
    DESIGN --> D_UI[UI/UX Designers & Illustrators]
    DESIGN --> D_VID[Video Editors & Motion Graphics]

    MKTG --> M_SOC[Social Media Managers]
    MKTG --> M_CONT[Technical Writers & Content Strategists]

    EVT --> E_LOG[Logistics & Venue Coordinators]
    EVT --> E_TICK[Ticketing & Helpdesk Leads]

    D_AI --> VOLS[Core Volunteers & Student Developers]
    D_CLOUD --> VOLS
    D_WEB --> VOLS
    D_OS --> VOLS
    D_UI --> VOLS
    E_LOG --> VOLS

    VOLS --> GENERAL[General Registered Club Members]
```

---

## 2. Tier Breakdown & Responsibilities

### Tier 1: Faculty Advisory & Executive Leadership
- **Faculty Advisor:** Provides institutional liaison with college administration, approves academic venue allocations, and validates official certifications.
- **Lead Ambassador (President):** Serves as the official Microsoft Learn Student Ambassador lead, steers organizational vision, coordinates with Microsoft global program managers, and chairs the executive council.
- **Vice President / Head of Operations:** Manages day-to-day cross-team synchronization, oversees resource allocation, tracks OKR progress, and resolves escalations.

### Tier 2: Domain Leads (Division Heads)
- **Technical Lead:** Architects club platforms, leads the engineering team, maintains Git repositories, enforces code standards, and reviews pull requests.
- **Design & Media Lead:** Manages visual branding, UI/UX design systems, poster generation, promotional video assets, and stage backdrops.
- **Marketing & Outreach Lead:** Drives social media campaigns (LinkedIn, Instagram, X), writes technical blogs, oversees community announcements, and manages sponsorship outreach.
- **Event Management Lead:** Formulates event proposals, oversees physical venue logistics, manages audio/visual requirements, and supervises on-site registration desks.

### Tier 3: Core Volunteers & Developers
- Active contributors who build software features, write test suites, moderate communication servers, conduct live peer study sessions, and staff live event operations.

### Tier 4: General Members
- Enrolled students who utilize the Study Hub, participate in hackathons, complete learning sheets, earn certificates, and attend technical bootcamps.
