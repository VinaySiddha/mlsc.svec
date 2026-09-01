---
title: 'Hiring Panel & Recruitment SOP'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '07-hiring-panel-and-recruitment-sop'
description: 'Administrative standard operating procedures for panel provisioning, candidate auto-assignment, reviewer dashboard operations, and selection workflows.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Hiring Panel & Recruitment Standard Operating Procedure (SOP)

This standard operating procedure defines the precise administrative responsibilities for Super Admins and Core Member Hiring Panels throughout the recruitment lifecycle.

---

## 1. Governance & Role Definitions

| Role | Authority & Responsibilities | Accessible Routes |
| :--- | :--- | :--- |
| **Super Admin** | Configures recruitment cycles, provisions panel emails, opens/closes hiring portals, sets quotas, and ratifies final selections. | `/admin/hiring-settings`, `/admin/deadline`, `/admin/bulk-update`, `/admin/interview-analytics` |
| **Hiring Panel Lead** | Oversees domain reviewers, monitors review throughput, conducts second-round interviews, and flags edge cases. | `/admin/applications`, `/admin/application/[id]`, `/admin/analytics` |
| **Core Member Reviewer** | Reviews assigned candidate submissions, validates proof of work, enters scores into rubrics, and submits preliminary recommendations. | `/admin/applications`, `/admin/application/[id]` |
| **Applicant / Participant** | Submits application form, receives automated registration confirmations, and tracks status. | `/apply`, `/track`, `/onboard/[token]` |

---

## 2. Phase-by-Phase Operational Workflow

### Phase 1: Pre-Recruitment Panel Provisioning (Super Admin)

```mermaid
graph LR
    A[Super Admin] -->|1. Enter Core Member Email| B[/admin/hiring-settings]
    B -->|2. Assign Domain Track| C[Hiring Panel Role Granted]
    C -->|3. Enable Hiring Toggle| D[Portal Open for Applications]
```

1. **Access Authorization:** Super Admins must navigate to `/admin/hiring-settings` and register the official email address of each Core Member participating as a reviewer.
2. **Domain Allocation:** Every panel member must be linked to at least one domain track (`genai`, `cloud`, `web`, `design`, `events`, `pr`).
3. **Capacity & Chapter Settings:**
   - Define active Chapter string (e.g., `Chapter-3`).
   - Define maximum application threshold (prevents server overload).
   - Set firm application deadline (`/admin/deadline`).
4. **Portal Activation:** Toggle `isHiringOpen` to `true`.

---

### Phase 2: Application Submission & Automated Triggers

When a student submits the application form at `/apply`:

1. **Data Integrity Checks:**
   - Verifies that `isHiringOpen` is active.
   - Validates that the current timestamp is before the configured deadline.
   - Ensures no duplicate application exists for the student's email or roll number in the active chapter.
2. **Reference ID Generation:**
   - Generates a formatted tracking ID (`MLSC-<TIMESTAMP>-<RANDOM>`, e.g., `MLSC-489102-ZX7B`).
3. **Automated Participant Confirmation Email:**
   - The system immediately dispatches a branded confirmation email to the candidate's email address confirming receipt and containing their unique Reference ID.
4. **Round-Robin Panel Assignment:**
   - The system queries active panel members assigned to the candidate's applied domain.
   - The candidate is assigned to the reviewer with the lowest active load (`assignedTo: reviewer.uid`).
   - The assigned Core Member receives an automated email notification alerting them of the new candidate.

---

### Phase 3: Reviewer Operations (Core Member Panel)

Core Members must complete candidate evaluations within **48 hours** of assignment:

1. **Log in:** Access `/login` with authorized institutional credentials.
2. **Access Assigned Queue:** Navigate to `/admin/applications` and filter by **"Assigned to Me"**.
3. **Application Inspection:** Open candidate detail view (`/admin/application/[id]`):
   - Review submitted projects, GitHub profile, and Figma/design links.
   - Inspect AI-extracted resume summary for key achievements.
4. **Evaluation & Scorecard Submission:** Fill out all 7 scoring dimensions (1 to 5 scale):
   - *Technical Skills*
   - *Communication*
   - *Problem Solving*
   - *Team Fit*
   - *Leadership*
   - *Growth Mindset*
   - *Confidence*
5. **Preliminary Decision:** Select candidate status:
   - `Shortlisted for Interview`
   - `Hold`
   - `Rejected`

---

### Phase 4: Council Review & Offer Issuance

1. **Analytics Review:** Super Admins and Domain Leads inspect distribution charts at `/admin/interview-analytics`.
2. **Bulk Status Updates:** Admins use `/admin/bulk-update` to transition candidates from `Shortlisted` to `Selected`.
3. **Onboarding Dispatch:**
   - Selected candidates receive automated email invitations containing a secure, single-use onboarding token (`/onboard/[token]`).
   - Candidates complete digital profile onboarding, sign the ethical charter, and receive Discord / GitHub invitations.

---

## 3. SLA & Performance Benchmarks

- **Application Confirmation Email:** Dispatched within `< 5 seconds` of form submission.
- **Panel Assignment:** Instantaneous upon submission.
- **Panel Review SLA:** Must be evaluated within `48 hours` of assignment.
- **Status Communication:** Candidates receive status updates within `7 days` of cycle closing.
