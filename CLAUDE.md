# MLSC Hub (mlsc.svec)

Next.js 14 App Router portal for MLSC SVEC: public site, hiring (`/apply`, `/admin`), events, team, and community. Firebase Firestore + Storage; Genkit for AI/email flows.

## Commands

```bash
npm install
npm run dev          # Next.js dev (default :3000)
npm run build
npm run start
npm run lint
npm run typecheck
npm run genkit:dev   # Genkit flows — run in a second terminal when testing AI/email
```

Docker (VM deploy): `docker-compose up --build -d` — see `README.md` and `nginx.conf`.

## Architecture

```
src/
  app/
    actions.ts           # Primary server actions (~2400 lines): applications, admin login, events, team
    home-actions.ts      # Public homepage reads
    community-actions.ts # Community posts/moderation
    admin/               # JWT-protected (middleware)
    api/auth, api/image  # Only REST routes; most logic is server actions
  components/          # Feature UI + components/ui (shadcn/Radix)
  lib/                 # firebase.ts, firebase-admin.ts, auth-context, roles, email
  ai/flows/            # Genkit flows (emails, evaluate-candidate, summarize-resume)
  middleware.ts        # Session JWT for /admin
```

## Auth (two systems — do not conflate)

| Surface | Route | Mechanism |
|---------|-------|-----------|
| Admin / interview panels | `/login` → `/admin/*` | `loginAction` sets httpOnly `session` JWT (`jose`). Middleware verifies and sets `X-User-Role`, `X-User-Username`, `X-Panel-Domain` on request headers. |
| Community / profiles | `/auth/login`, `/community/*` | Firebase Auth (Google) via `src/lib/auth-context.tsx`. |

Panel JWT payload: `role: 'panel'`, `domain` in `gen_ai` | `ds_ml` | `azure` | `web_app`. Admin: `role: 'admin'`.

Community RBAC (Firestore user docs): `src/lib/roles.ts` — `PERMISSIONS`, `hasPermission`. Admin pages may read `headers().get('X-User-Role')` (middleware JWT role, not `roles.ts`).

**Do not add plaintext passwords to `actions.ts`.** Use env or a secure store; rotate any credentials ever committed.

## Firebase

- **Client:** `src/lib/firebase.ts` — `db`, `storage`, lazy `auth` (Proxy avoids build-time auth init).
- **Admin:** `src/lib/firebase-admin.ts` — Firebase Admin uses Application Default Credentials.

**Never commit:** `key.json`, `service-account.json`, `.env*`. `.gitignore` already ignores `service-account.json`; add `key.json` if used locally.

**Collections (common):** `applications`, `panels`, `events`, `events/{id}/registrations`, `teamMembers`, `teamCategories`, `users`, `home_hero`, `home_gallery`, `home_chapters`, `home_ambassadors`.

Admin home managers (`src/components/admin/home/*`) use client `onSnapshot` + `orderBy("createdAt", "desc")` — requires Firestore indexes and rules.

## Environment

Local: `.env.local`. Production / App Hosting: Google Secret Manager — see `docs/PERMISSIONS_TROUBLESHOOTING.md`.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | Client SDK |
| `JWT_SECRET` | Admin session |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional local ADC fallback for Firebase Admin |
| `GOOGLE_API_KEY` | Genkit / Gemini |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Nodemailer (AI flows + `lib/email.ts`) |
| `JSEARCH_API_KEY` | Jobs page |

`loginAction` checks all five server secrets above before issuing a session — local admin login fails if any are missing.

## Conventions

- Imports: `@/` → `src/`
- Forms: `react-hook-form` + `zod`; toasts: `@/hooks/use-toast`
- New hiring/admin mutations: extend `actions.ts` or split by domain (e.g. `home-actions.ts` pattern) if the file grows further
- Rich text (community): TipTap + DOMPurify in `components/community/`

## Gotchas

- `middleware` matcher: only `/admin/:path*` and `/login`.
- Firebase `auth` must not be eagerly imported at module scope in new client files — use the exported proxy from `firebase.ts`.
- Firestore rules are not in-repo; test admin client writes against your Firebase console rules.
- Package name in `package.json` is `nextn`; README clone path may say `hiring`.
