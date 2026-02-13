# Hastha: Mudra & Breath

## Overview

Hastha is a mindfulness web application focused on mudra (hand gesture) practice, breath work, and journaling. It provides a mobile-first interface where users can browse a library of mudras, create custom mudras, practice guided breathing exercises, and maintain an audio journal of their practice sessions.

The app follows a full-stack TypeScript architecture with a React frontend and Express backend, backed by a PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **Styling**: Tailwind CSS v4 with CSS variables for theming, using a warm paper-like color palette with sage green accents
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Hand Detection**: MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) for browser-based hand landmark detection, used in Studio to generate stylized mudra illustrations from photos
- **Animations**: Framer Motion (used in BreathPacer component, BurnRitual component)
- **Typography**: Cormorant Garamond (serif, headings) + Plus Jakarta Sans (sans, body)
- **Build Tool**: Vite

The frontend is organized as a mobile-first SPA with a fixed header showing "Hastha" and a bottom tab navigation bar. Pages include Home, Library, Studio (create mudra), Breathe (breath pacer), Journal, and MudraDetail.

Path aliases:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets` → `attached_assets/`

### Backend
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript, executed via `tsx`
- **API Style**: RESTful JSON API under `/api/` prefix
- **Development**: Vite dev server middleware for HMR in development; static file serving in production

### API Routes
- `GET /api/mudras` — List all mudras
- `GET /api/mudras/:id` — Get single mudra
- `POST /api/mudras` — Create a mudra (validated with Zod via drizzle-zod)
- `DELETE /api/mudras/:id` — Delete a mudra
- `GET /api/journal` — List all journal entries (newest first)
- `POST /api/journal` — Create a journal entry
- `DELETE /api/journal/:id` — Delete a journal entry

### Database
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Schema** (in `shared/schema.ts`):
  - `mudras` table: id (UUID), name, sanskritName, description, benefits (text array), instructions (text array), image, category, isBuiltIn, createdAt
  - `journal_entries` table: id (UUID), title, audioUrl, duration, mood, createdAt
- **Migrations**: Use `drizzle-kit push` (`npm run db:push`) to sync schema to database
- **Connection**: `pg.Pool` with `drizzle-orm/node-postgres`

### Shared Code
The `shared/` directory contains the database schema and Zod validation schemas, shared between frontend and backend. Insert schemas omit auto-generated fields (id, createdAt, isBuiltIn).

### Build Process
- **Development**: `npm run dev` runs the Express server with Vite middleware for HMR
- **Production Build**: `npm run build` runs a custom build script (`script/build.ts`) that:
  1. Builds the client with Vite (output to `dist/public/`)
  2. Bundles the server with esbuild (output to `dist/index.cjs`), externalizing most deps except an allowlist
- **Production Start**: `npm run start` runs `node dist/index.cjs`

### Key Design Decisions
- **Mobile-first layout**: Max width constrained to `max-w-md` (448px), centered on larger screens
- **No authentication**: Currently no user auth system; all data is shared/global
- **Audio journal**: Records audio in-browser via MediaRecorder API but currently only saves metadata (title, duration) to the database, not the audio blob itself
- **Breath pacer**: 4-4-4 breathing pattern (inhale/hold/exhale) with animated circle using Framer Motion

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Connection string must be provided via `DATABASE_URL` environment variable. Used for storing mudras and journal entries.

### Key NPM Packages
- `express` v5 — HTTP server
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `pg` — PostgreSQL client
- `zod` + `drizzle-zod` + `zod-validation-error` — Schema validation
- `@tanstack/react-query` — Client-side data fetching/caching
- `wouter` — Client-side routing
- `framer-motion` — Animations (breath pacer)
- `react-day-picker` — Calendar component
- `vaul` — Drawer component
- `recharts` — Chart component (available but not actively used in current pages)

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal` — Runtime error overlay in development
- `@replit/vite-plugin-cartographer` — Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner` — Dev banner (dev only)
- Custom `vite-plugin-meta-images` — Updates OpenGraph meta tags with deployment URL