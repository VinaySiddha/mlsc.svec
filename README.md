# MLSC Hub - Full Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Key Technologies](#key-technologies)
4. [Directory Structure](#directory-structure)
5. [Application Flow](#application-flow)
6. [Frontend (Next.js)](#frontend-nextjs)
7. [Backend & API](#backend--api)
8. [AI Integrations](#ai-integrations)
9. [Authentication & Middleware](#authentication--middleware)
10. [Kubernetes & Docker](#kubernetes--docker)
11. [Nginx Reverse Proxy](#nginx-reverse-proxy)
12. [Styling & UI](#styling--ui)
13. [Utilities & Hooks](#utilities--hooks)
14. [Configuration Files](#configuration-files)
15. [How to Run Locally](#how-to-run-locally)
16. [Deployment](#deployment)
17. [Interactive Images & Icons](#interactive-images--icons)

---

## 1. Project Overview

MLSC Hub is a full-stack web application designed as a hiring portal for the Machine Learning Student Club. It enables secure authentication (JWT-based, with Firebase integration), role listings, application submission, and administrative review, with a modern UI and AI-powered features (Google Genkit, Gemini). The app uses Next.js server actions and middleware for backend logic, and supports scalable deployment via Docker and Kubernetes.

## 2. Architecture

- **Frontend:** Next.js (React, TypeScript)
- **Backend:** Next.js API routes, server actions, and AI flows
- **AI:** Google Genkit, Google Gemini, Zod for schema validation
- **Authentication:** JWT-based, with Firebase integration
- **Infrastructure:** Docker, Kubernetes (Kustomize), Nginx reverse proxy

## 3. Key Technologies

- **Next.js**: React framework for SSR/SSG
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Firebase**: Authentication & data storage
- **Genkit/GoogleAI**: AI-powered resume evaluation and summarization
- **Docker/Kubernetes**: Containerization and orchestration
- **Nginx**: Load balancing and reverse proxy

## 4. Directory Structure

```
hiring/
  apphosting.yaml           # App hosting config
  components.json           # UI component config
  Dockerfile                # Next.js app Docker build
  next.config.ts            # Next.js config
  postcss.config.mjs        # PostCSS config for Tailwind
  README.md                 # Project readme
  tailwind.config.ts        # Tailwind CSS config
  tsconfig.json             # TypeScript config
  bridge/                   # Kubernetes manifests (base/overlays)
  docs/                     # Documentation
  public/                   # Static assets
  src/                      # Source code (frontend, backend, AI, utils)
```

## 5. Application Flow

- **User** visits the portal, views available roles, and submits an application.
- **Authentication** is handled via JWT middleware (with Firebase for user data).
- **Admin** can log in, view, filter, and review applications. Admin authentication is enforced via JWT and middleware.
- **AI** services summarize resumes and evaluate candidates using Google Genkit and Gemini models.
- **Nginx** load balances requests to multiple Next.js app instances (Kubernetes or Docker Compose).

## 6. Frontend (Next.js)

- **Pages:**
  - `/` (Home): Main landing page.
  - `/login`: User/admin login page.
  - `/status`: Check application status.
  - `/admin`: Admin dashboard (protected).
  - `/admin/application/[id]`: Detailed application review.
- **Components:**
  - `application-form.tsx`: User application form with file upload and validation.
  - `applications-table.tsx`: Admin table for viewing applications.
  - `admin-filters.tsx`: Filtering UI for admin dashboard.
  - `status-check-form.tsx`: Form to check application status by reference ID.
  - `logout-button.tsx`: Handles user logout and redirects.
  - `ui/`: Reusable UI primitives (accordion, alert, button, card, etc.) built on top of Radix UI and Tailwind.
- **Styling:**
  - Tailwind CSS is used for all styling, with custom themes in `globals.css`.

## 7. Backend & API

- **API Routes:**
  - `/api/auth/route.ts`: Placeholder for legacy auth, now handled via JWT and `/login`.
- **Server Actions:**
  - `actions.ts`: Handles application submission, fetching, and admin actions (all backend logic is in server actions).
- **Middleware:**
  - `middleware.ts`: Protects admin routes, verifies JWT tokens, manages session cookies, and injects user info into headers for server components.

## 8. AI Integrations

- **Genkit & GoogleAI:**
  - `genkit.ts`: Configures Genkit with Google Gemini for AI tasks.
  - `flows/summarize-resume.ts`: Summarizes uploaded resumes.
  - `flows/evaluate-candidate.ts`: Evaluates candidate suitability.
  - `flows/send-confirmation-email.ts`: Sends confirmation emails to applicants.

## 9. Authentication & Middleware

- **JWT Authentication:**
  - Middleware checks for valid JWT in cookies for protected routes (`/admin`).
  - `/login` page issues JWT on successful login.
- **Firebase:**
  - Used for storing application data and (optionally) authentication.

## 10. Kubernetes & Docker

- **Dockerfile:**
  - Multi-stage build for Next.js app, installs dependencies, builds, and exposes port 3000 for production.
- **docker-compose.yml:**
  - (If present) Defines multiple Next.js app instances and an Nginx reverse proxy.
- **Kubernetes Manifests:**
  - `bridge/base/`: Base deployments and services for Next.js apps and Nginx.
  - `bridge/overlays/desktop/`: Desktop-specific overlays and patches (e.g., LoadBalancer services).
  - `nginx.conf-persistentVolumeClaim.yaml`: Persistent volume for Nginx config.

## 11. Nginx Reverse Proxy

- **nginx.conf:**
  - Defines an upstream cluster of multiple Next.js app instances.
  - Proxies all requests to the cluster, including static assets.
  - Handles WebSocket upgrades and sets necessary headers.

## 12. Styling & UI

- **Tailwind CSS:**
  - Configured in `tailwind.config.ts` and `globals.css`.
  - Custom color themes and utility classes for light/dark mode.
- **Shadcn/UI:**
  - Component library for consistent UI primitives (in `components/ui/`).
- **PostCSS:**
  - Used for processing Tailwind CSS.
- **Interactive Images & Icons:**
  - The app uses interactive icons (Lucide, custom SVGs) and images (e.g., club logo) throughout the UI.
  - Icons and images are made interactive using Next.js's `Image` component, Tailwind CSS hover/active/focus states, and event handlers (e.g., `onClick`).
  - Tooltips, animations, and transitions are used for better user experience (see `components/ui/` and usage of Radix UI primitives).
  - To add your own interactive images or icons, use the `Image` component for optimized images and Lucide/React components for SVG icons. Enhance interactivity with Tailwind classes like `hover:scale-110`, `transition`, and event handlers.

## 13. Utilities & Hooks

- **`lib/utils.ts`:**
  - Utility function `cn` for merging class names (clsx + tailwind-merge).
- **`hooks/use-toast.ts`:**
  - Custom hook for toast notifications (used throughout the UI).
- **`hooks/use-mobile.tsx`:**
  - Detects mobile viewport for responsive UI (used for mobile-friendly layouts).

## 14. Configuration Files

- **`package.json` / `package-lock.json`:**
  - Project dependencies and scripts (see scripts for dev, build, start, lint, typecheck, genkit:dev, etc.).
    **`tsconfig.json`:**
  - TypeScript compiler options (strict, paths, JSX, etc.).
    **`next.config.ts`:**
  - Next.js configuration (TypeScript, ESLint, image domains, etc.).
    **`components.json`:**
  - Shadcn/UI component config and aliases.
    **`postcss.config.mjs`:**
  - PostCSS plugins (Tailwind).

## 15. How to Run Locally

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start development server:**
   ```sh
   npm run dev
   ```
3. **Run Genkit AI dev server (optional, for AI features):**
   ```sh
   npm run genkit:dev
   ```
4. **With Docker Compose (if using multi-service setup):**
   ```sh
   docker-compose up --build
   ```

## 16. Deployment

- **Kubernetes:**
  - Use manifests in `bridge/` for deploying to a cluster (see overlays for LoadBalancer services).
  - Nginx load balances traffic to multiple Next.js pods.
- **Docker:**
  - Build and run containers using Docker Compose or Kubernetes.
- **Persistent Volumes:**
  - Nginx config is mounted as a persistent volume for dynamic updates.

---

# File-by-File Documentation

## Top-Level Files

- **apphosting.yaml**: Configuration for app hosting (cloud or local, details depend on provider).
- **components.json**: UI component system config (shadcn/ui), including aliases and Tailwind settings.
- **docker-compose.yml**: Defines services for three Next.js app instances and Nginx reverse proxy.
- **Dockerfile**: Builds the Next.js app for production in a Node.js Alpine container.
- **next.config.ts**: Next.js config (TypeScript, ESLint, image domains).
- **nginx.conf**: Nginx config for load balancing and proxying requests to Next.js apps.
- **postcss.config.mjs**: PostCSS config for Tailwind CSS processing.
- **README.md**: Project overview and instructions (this file).
- **tailwind.config.ts**: Tailwind CSS configuration (theme, plugins, etc.).
- **tsconfig.json**: TypeScript compiler options.

## `bridge/` (Kubernetes Manifests)

- **base/**: Base deployments and services for Next.js apps and Nginx.
- **overlays/desktop/**: Desktop-specific overlays and patches for Kubernetes resources.

## `docs/`

- **blueprint.md**: High-level feature list and goals for the app.

## `public/`

- **logo.png**: Club logo used in the UI.

## `src/` (Source Code)

### `ai/`

- **dev.ts**: Entry point for Genkit AI flows (summarize resume, evaluate candidate, send confirmation email).
- **genkit.ts**: Configures Genkit with Google Gemini model and API key.
- **flows/**: Contains AI-powered flows for resume summarization, candidate evaluation, and email sending.

### `app/`

- **actions.ts**: Server actions for submitting and fetching applications, admin actions.
- **globals.css**: Global styles using Tailwind CSS.
- **layout.tsx**: Root layout for the app, sets up metadata and global styles.
- **page.tsx**: Home page component.
- **admin/**: Admin dashboard and application review pages.
- **api/auth/route.ts**: Placeholder for legacy auth route.
- **login/page.tsx**: Login page with form validation.
- **status/page.tsx**: Status check page for applicants.

### `components/`

- **application-form.tsx**: User application form with validation and file upload.
- **applications-table.tsx**: Admin table for viewing and managing applications.
- **admin-filters.tsx**: Filtering UI for admin dashboard.
- **status-check-form.tsx**: Form to check application status by reference ID.
- **logout-button.tsx**: Handles user logout and redirects.
- **ui/**: Reusable UI primitives (accordion, alert, button, card, etc.) built on top of Radix UI and Tailwind.

### `hooks/`

- **use-mobile.tsx**: Detects mobile viewport for responsive UI.
- **use-toast.ts**: Custom hook for toast notifications.

### `lib/`

- **firebase.ts**: Firebase configuration and exports.
- **utils.ts**: Utility function for merging class names (clsx + tailwind-merge).

---

# How the App Works (Summary)

1. **User** visits the portal, views available roles, and submits an application via a form.
2. **Authentication** is handled via JWT middleware (with Firebase for data storage) for secure access to admin routes.
3. **Admin** logs in, reviews, and filters applications using the admin dashboard (protected by middleware).
4. **AI** services (Genkit, Gemini) summarize resumes and evaluate candidates for admin review.
5. **Nginx** load balances requests to multiple Next.js app instances for scalability.
6. **Kubernetes** orchestrates containers and services for production deployment.

---

For further details, see the inline comments and documentation in each file. For any specific file or feature, refer to the relevant section above or ask for a deep dive into that part.
