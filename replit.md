# Samaj Family Directory System

## Overview

A full-stack web application for managing a Samaj (community) family directory with full Gujarati UI, role-based authentication, and community leadership management.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Wouter routing, TanStack Query, Framer Motion)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcrypt (bcryptjs)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **UI Language**: Gujarati (Noto Sans Gujarati font)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/          # Express API server (auth, samaj, homes, leaders)
│   └── samaj-directory/     # React frontend (all Gujarati UI)
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas from OpenAPI
│   └── db/                  # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── users.ts     # Users table (home_admin, super_admin roles)
│           ├── samaj.ts     # Samaj info + Leaders tables
│           └── homes.ts     # Homes + Members tables
├── scripts/                 # Utility scripts
│   └── src/seed-users.ts    # Seeds homeadmin and superadmin users
```

## User Roles & Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Home Admin | `homeadmin` | `home123` | Add homes, add members |
| Super Admin | `superadmin` | `super123` | Edit samaj info, manage leaders |

## Pages

- `/` — Home: Samaj name, Kuldev/Kuldevi images, leaders list
- `/directory` — All homes sorted by village → faliya, with member tables
- `/login` — Gujarati login form, role-based redirect
- `/home` — Protected (home_admin): Add home + multiple members dynamically
- `/admin` — Protected (super_admin): Edit samaj name, CRUD leaders, reorder

## Database Tables

- `users` — username, password (bcrypt), role
- `samaj` — samaj_name
- `leaders` — name, role, mobile, address, order
- `homes` — kutumb_vada_name, kutumb_vada_address, house_no, faliya, village
- `members` — home_id (FK), sr_no, name, dob, occupation, relation, marital_status, mobile

## API Routes

All under `/api`:
- `POST /auth/login` — JWT login
- `GET /auth/me` — Current user
- `GET/PUT /samaj` — Samaj info
- `GET/POST /samaj/leaders` — Leaders
- `PUT/DELETE /samaj/leaders/:id` — Edit/delete leader
- `POST /samaj/leaders/:id/move` — Reorder leader (up/down)
- `GET/POST /homes` — Directory listing / create home
- `POST /homes/:id/members` — Add member to home

## Running

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/scripts run seed-users
# Start workflows
```

## Seeding

```bash
pnpm --filter @workspace/scripts run seed-users
```
