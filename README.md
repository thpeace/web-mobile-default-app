# Cross-Platform Architecture Suite (Web + Mobile)

A production-ready implementation of the **Cross-Platform Architecture Blueprint** uniting a desktop-optimized Web application (Next.js App Router) and native Mobile application (Expo React Native) with shared business logic, type definitions, and validation schemas in a TypeScript Monorepo powered by Turborepo & pnpm.

---

## 🏗️ Architecture & Technology Stack

| Platform / Layer | Technology | Key Highlights |
| :--- | :--- | :--- |
| **Desktop / Web** | **Next.js 14 (App Router) + Tailwind CSS** | Full browser DOM support, desktop sidebar layout, high-density data tables, Lucide-React icons. |
| **Mobile** | **Expo 52 (React Native)** | Centered card auth, mobile card feeds, bottom navigation bar, cross-platform gestures. |
| **Backend / API** | **Node.js (Express + TypeScript)** | Strict Layered Architecture: Controllers, Services, Routes, and RBAC middlewares. |
| **Database** | **PostgreSQL + Prisma ORM** | Relational data model with auto-migrated schema and high-fidelity local fallback. |
| **Shared Packages** | **TypeScript Monorepo Workspaces** | `@app/types`, `@app/validation` (Zod), `@app/db` (Prisma), `@app/api-client` (Axios). |
| **Monorepo Engine**| **Turborepo + pnpm** | Cached incremental builds, parallel execution, isolated workspace dependencies. |

---

## 📁 Repository Structure

```
.
├── apps/
│   ├── web/                          # Next.js 14 App Router Desktop Web App
│   │   ├── src/app/
│   │   │   ├── login/                # Minimalist split screen login
│   │   │   ├── dashboard/            # Dynamic Role Dashboard (Admin/Employee/Client)
│   │   │   └── users/                # Admin-only user management data table
│   │   └── src/components/           # Role dashboards, badges, and sidebar
│   │
│   ├── mobile/                       # Expo (React Native) Mobile App
│   │   ├── App.tsx                   # Centered login, bottom tabs, mobile role screens
│   │   └── metro.config.js           # Monorepo-aware Metro configuration
│   │
│   └── api/                          # Node.js API Service
│       └── src/
│           ├── controllers/          # HTTP request & response handlers
│           ├── services/             # Core business logic & RBAC enforcement
│           ├── routes/               # API endpoints (/auth, /users, /requests, /stats)
│           └── middlewares/          # JWT auth, Role guards, and Zod validator
│
├── packages/
│   ├── types/                        # Shared TypeScript interfaces & DTOs
│   ├── validation/                   # Shared Zod schemas (Login, AddUser, CreateRequest)
│   ├── db/                           # Prisma Schema, client, and seed scripts
│   └── api-client/                   # Shared typed Axios client for Web & Mobile
│
├── .gitlab-ci.yml                 # GitLab CI/CD Pipeline (Build Web & Package Mobile)
├── docker-compose.yml                # PostgreSQL container service definition
├── turbo.json                        # Turborepo task pipeline
└── pnpm-workspace.yaml               # Monorepo workspace configuration
```

---

## 👥 Role-Based Access Control (RBAC) & Features

| Role | Business Purpose | Permissions & Capabilities |
| :--- | :--- | :--- |
| **ADMIN** | System oversight & provisioning | Full CRUD on Users (`/users`), assign requests to employees, inspect global throughput KPIs and 30-day activity trend. |
| **EMPLOYEE** | Operational fulfillment & support | Access assigned tasks queue, filter by status, change task status (`IN_PROGRESS`, `RESOLVED` with resolution timestamp). |
| **CLIENT** | End-user engagement | Submit new service requests via modal, track real-time resolution badges (`PENDING`, `IN_PROGRESS`, `RESOLVED`). |

---

## 🔑 Pre-Seeded Demo Accounts

All pre-seeded accounts share the default password: **`password123`**

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `password123` | System Administrator (Alex Admin) |
| **EMPLOYEE** | `employee@example.com` | `password123` | Lead Support Engineer (Emma Employee) |
| **EMPLOYEE** | `john.tech@example.com` | `password123` | Support Technician (John Technician) |
| **CLIENT** | `client@example.com` | `password123` | Enterprise Client (Charlie Client) |
| **CLIENT** | `acme.corp@example.com` | `password123` | Corporate Client (Acme Corp Ltd) |

*(Both Web and Mobile login screens include 1-click demo fast-fill buttons for instant testing without typing).*

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start PostgreSQL Database (Optional / Recommended)
```bash
docker compose up -d
```
*(Note: If Docker is not currently running, the API server automatically operates in high-fidelity in-memory mode pre-seeded with sample entities so you can develop immediately).*

### 3. Generate Prisma Database Client & Seed Data
```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 4. Run All Services Simultaneously
```bash
pnpm dev
```
Turborepo will concurrently launch:
- **API Server:** `http://localhost:4000/api`
- **Web App:** `http://localhost:3000`
- **Mobile Metro Bundler:** Expo development server

### 5. Run Services Individually
```bash
# Run API server only
pnpm dev:api

# Run Next.js Web app only
pnpm dev:web

# Run Expo Mobile app only
pnpm dev:mobile
```

---

## 🧪 Verification & Build
To verify the entire monorepo builds and typechecks cleanly across all apps and packages:
```bash
pnpm build
```

---

## 🦊 GitLab CI/CD Pipeline & Application Packaging

The repository includes a comprehensive, multi-stage [`.gitlab-ci.yml`](.gitlab-ci.yml) pipeline designed for pnpm monorepos:

### Pipeline Stages
1. **`setup:dependencies`**: Caches pnpm store, approves build scripts, runs `prisma generate`, and compiles shared packages (`@app/types`, `@app/validation`, `@app/db`, `@app/api-client`).
2. **`validate:typecheck`**: Enforces strict TypeScript verification across all apps and packages in parallel via Turborepo.
3. **`build:web`**: Builds the production-optimized Next.js desktop web app and exports artifacts (`apps/web/.next`) with `expose_as: "Web Application Build"`.
4. **`package:mobile`**: Packages the Expo/React Native mobile application into native Hermes bytecode (Android & iOS), web companion bundles, and generates a downloadable `mobile-app-package.zip` with `expose_as: "Mobile Application Package"`. Also uploads to the GitLab Generic Package Registry.
5. **`build:api`**: Compiles the Node.js Express API service into `apps/api/dist`.

### Packaging Commands
```bash
# Package mobile app locally (generates Hermes bytecode + assets)
pnpm package:mobile

# Archive into mobile-app-package.zip
node scripts/archive-mobile.js

# Build Web app
pnpm build:web
```

---

## 📄 License
MIT License.
