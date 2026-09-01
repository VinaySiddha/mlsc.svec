---
title: 'Git & GitHub Workflow'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '04-git-and-github-workflow'
description: 'Branching strategy, pull request rules, conventional commits, and CI checks.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# Git & GitHub Workflow

MLSC SVEC enforces a structured Git branching model to maintain code quality, avoid regressions, and enable concurrent development.

---

## 1. Branching Strategy

```text
main (Production) ◄────── (Vetted Staging Merge) ────── Dev (Active Integration)
                                                           ▲
                                                           │ (PR Review & CI Pass)
                                            feature/study-hub-sync
                                            fix/payment-race-condition
                                            docs/update-handover-sop
```

- **`main`:** Production-ready code. Directly deployed to production edge servers. Protected branch requiring 2 lead approvals.
- **`Dev`:** Active development branch. All feature branches merge here after passing CI checks.
- **`feature/*` / `fix/*` / `docs/*`:** Short-lived branches created from `Dev` for specific issues or deliverables.

---

## 2. Conventional Commit Standards

All commits must follow the Conventional Commits specification:
- `feat: add dynamic ambassador carousel on homepage`
- `fix: resolve race condition in Razorpay webhook verification`
- `docs: add WebRTC meeting server architecture spec`
- `refactor: optimize Firestore batch query on study leaderboard`
- `chore: bump Next.js and Tailwind dependencies`

---

## 3. Pull Request (PR) Checklist

Before submitting a PR to `Dev`:
- [ ] Branch is up to date with the latest `Dev`.
- [ ] Local build (`npm run build`) completes with zero TypeScript or JSX errors.
- [ ] Associated GitHub issue is linked (`Closes #42`).
- [ ] Visual UI changes include before/after screenshots or GIFs.
- [ ] Documentation on `docs.mlscsvec.com` has been updated if architecture or APIs changed.
