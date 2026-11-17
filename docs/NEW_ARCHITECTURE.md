# New Low-Cost Architecture Guide (Zero Firebase & Zero AWS)

This architecture runs **24/7 in the cloud at $0 cost**, without requiring your laptop to stay on, and **leaves all existing Firebase code completely untouched**.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │             Vercel (Hobby)             │
                      │         24/7 Next.js SSR Hosting       │
                      │         (Deploys from GitHub, $0)      │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│     PostgreSQL Database         │             │      Heavy Object Storage       │
│    (Supabase or Neon Free)      │             │         (Cloudflare R2)         │
│  • Pure SQL queries (No ORM)    │             │  • 10 GB Free Storage           │
│  • Tables created via SQL DDL   │             │  • $0 Egress/Bandwidth Fees     │
│  • Free 500 MB hosted DB        │             │  • S3-Compatible API            │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

---

## 1. How Tables are Managed and Created (Without ORM)

All database tables are defined in a clean, pure SQL script: [scripts/schema.sql](file:///home/vinaysiddha/mlsc.svec/scripts/schema.sql).

### To Create the Tables:
1. Create a free account at [Supabase](https://supabase.com) or [Neon](https://neon.tech) (No credit card required).
2. Open the **SQL Editor** in the Supabase or Neon dashboard.
3. Paste the contents of [scripts/schema.sql](file:///home/vinaysiddha/mlsc.svec/scripts/schema.sql) and click **Run**.
4. All tables (`applications`, `events`, `team_members`, `home_gallery`, etc.) will be created immediately with proper indexes and constraints.

### To View or Edit Data:
- Open the visual **Table Editor** in your Supabase dashboard to inspect, filter, edit, or delete records directly in your browser (just like an Excel spreadsheet or Firebase Console).

---

## 2. How the Code Queries the DB (Without ORM)

Instead of an ORM, queries use **`postgres.js`**, a lightweight and fast pure SQL client using tagged template literals:

- **Client connection:** [src/lib/new-db/client.ts](file:///home/vinaysiddha/mlsc.svec/src/lib/new-db/client.ts)
- **Application Repository:** [src/lib/new-db/application-repo.ts](file:///home/vinaysiddha/mlsc.svec/src/lib/new-db/application-repo.ts)
- **Event Repository:** [src/lib/new-db/event-repo.ts](file:///home/vinaysiddha/mlsc.svec/src/lib/new-db/event-repo.ts)
- **Team Repository:** [src/lib/new-db/team-repo.ts](file:///home/vinaysiddha/mlsc.svec/src/lib/new-db/team-repo.ts)
- **Home Repository:** [src/lib/new-db/home-repo.ts](file:///home/vinaysiddha/mlsc.svec/src/lib/new-db/home-repo.ts)

**Example Query (Pure SQL):**
```ts
import { sql } from '@/lib/new-db/client';

// Reading
const applicants = await sql`SELECT * FROM applications WHERE status = 'pending'`;

// Writing
await sql`
  INSERT INTO applications (name, email)
  VALUES (${data.name}, ${data.email})
`;
```

---

## 3. Heavy Storage (Cloudflare R2)

Firebase Storage and AWS S3 have aggressive billing and egress fees. Cloudflare R2 provides:
- **10 GB storage free**
- **$0 egress fees** (bandwidth is completely free)
- Standard S3-compatible API

### Files Created:
- **Storage Client:** [src/lib/new-storage/storage.ts](file:///home/vinaysiddha/mlsc.svec/src/lib/new-storage/storage.ts)
- **Upload API Endpoint:** [src/app/api/storage/upload/route.ts](file:///home/vinaysiddha/mlsc.svec/src/app/api/storage/upload/route.ts)

*Note: If R2 credentials are not set, it automatically falls back to saving files in `public/uploads/` so you can test locally without signing up for anything.*

---

## 4. 24/7 Hosting on Vercel ($0)

Since your personal laptop will not be online 24/7:
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"** → select your repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase/Neon connection string.
   - `JWT_SECRET`: Random secret string for admin auth.
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (from Cloudflare R2).
   - `GMAIL_USER`, `GMAIL_APP_PASSWORD` (for email notifications).
   - `GOOGLE_API_KEY` (free tier Gemini key for AI flows).
4. Click **Deploy**. Vercel will host and run your Next.js SSR app 24/7.
