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
- **Database**: MongoDB + Mongoose (connection via `MONGODB_URI` secret)
- **Auth**: JWT (jsonwebtoken) + bcrypt (bcryptjs)
- **Validation**: Zod (`zod/v4`)
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
│   └── db/                  # Mongoose models + MongoDB connection
│       └── src/schema/
│           ├── users.ts     # User model (home_admin, super_admin roles)
│           ├── samaj.ts     # Samaj + Leader models
│           └── homes.ts     # Home model with embedded Member subdocs
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

## Database Collections (MongoDB)

- `users` — username, password (bcrypt), role
- `samaj` — samaj_name (single document)
- `leaders` — name, role, mobile, address, order
- `homes` — kutumb_vada_name, kutumb_vada_address, address.{house_no, faliya, village},
  current address (current_house_no, current_area, current_landmark, current_city, current_district, current_pincode),
  embedded `members[]` subdocuments — sr_no, name, dob, occupation, relation, marital_status, mobile, education, qualification

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
# Set MONGODB_URI secret, then start workflows.
# The api-server auto-seeds default users, samaj name, and leaders on first connect
# whenever the collections are empty.
```
