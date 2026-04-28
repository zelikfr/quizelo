# Quizelo

Multiplayer quiz monorepo.

## Stack

- **apps/web** — Next.js 15 (App Router, RSC, next-intl, Tailwind)
- **apps/api** — Fastify 5 + WebSocket runtime for live matches
- **packages/db** — Drizzle ORM + PostgreSQL schema (Auth.js + game tables)
- **packages/auth** — Shared Auth.js v5 config (Google, Apple, Email magic link, Credentials)
- **Postgres 16 + Redis 7** — local via `docker compose`
- **pnpm workspaces** + **Turborepo**

```
quizelo/
├── apps/
│   ├── web/        # Next.js front-end
│   └── api/        # Fastify match runtime
├── packages/
│   ├── db/         # Drizzle schema + migrations
│   └── auth/       # Shared Auth.js config
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## First-time setup

```bash
# 0. Clean up legacy files from the pre-monorepo era (one-time)
rm -rf apps/web/node_modules apps/web/package-lock.json \
       apps/web/.next apps/web/tsconfig.tsbuildinfo \
       apps/web/.prettierrc apps/web/.prettierignore \
       apps/web/skills-lock.json

# 1. Install pnpm (if needed)
npm install -g pnpm@9

# 2. Install all workspaces
pnpm install

# 3. Copy env templates
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp packages/db/.env.example packages/db/.env

# 4. Generate an AUTH_SECRET and put it in every .env above
openssl rand -base64 32

# 5. Boot Postgres + Redis
pnpm docker:up

# 6. Generate + run the first migration
pnpm db:generate
pnpm db:migrate
```

## Daily dev

```bash
# In one terminal
pnpm docker:up

# In another
pnpm dev          # turbo runs web (3000) + api (4000) in parallel
```

| URL | What |
| --- | --- |
| http://localhost:3000 | Next.js front-end |
| http://localhost:4000/health | Fastify healthcheck |
| ws://localhost:4000/ws/match/:matchId | Match runtime |

## Database

```bash
pnpm db:generate    # create new SQL migration from schema diff
pnpm db:migrate     # apply pending migrations
pnpm db:push        # bypass migrations (dev only — pushes schema directly)
pnpm db:studio      # open Drizzle Studio on the local DB
pnpm db:reset       # drop + recreate public schema (DESTRUCTIVE)
```

## Auth

Auth.js v5 lives in `packages/auth` and is consumed by both apps:

- `apps/web`: `import { auth, signIn, signOut } from "@quizelo/auth"`
- `apps/api`: `readSession(req)` decodes the same JWT cookie

Providers wired:

- **Google OAuth** — set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- **Apple OAuth** — set `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET`
- **Email magic link** — Resend, set `AUTH_RESEND_KEY` + `AUTH_EMAIL_FROM`
- **Credentials** — email / password against `users.password_hash` (argon2id)

## Scripts

```bash
pnpm dev           # run everything
pnpm build         # build everything
pnpm typecheck     # tsc across the workspace
pnpm lint          # eslint across the workspace
pnpm format        # prettier write
```
