# Cross-Platform Architecture Blueprint (Web + Mobile)

A comprehensive architectural decision and implementation guide for building a modern web application (optimized for desktop/PC) alongside native mobile applications (iOS & Android) with clean code separation and shared business logic.

## 1. Executive Summary & Recommended Stack

The industry-standard architecture for teams that want independent presentation layers (DOM for PC, Native for Mobile) without duplicating backend logic, validation, and data fetching is the **TypeScript Monorepo (Next.js + Expo)**.

| Platform / Layer | Technology | Key Strengths | 
| ----- | ----- | ----- | 
| **Desktop / Web** | **Next.js (App Router)** | Full browser DOM support, SEO optimization, keyboard accessibility, desktop window layouts. | 
| **Mobile (iOS/Android)** | **Expo (React Native)** | Native UI components, 60–120 FPS gesture handling, direct access to device APIs (camera, notifications, biometrics). | 
| **Shared Logic** | **TypeScript Packages** | Zero-duplication API clients, validation schemas (Zod), and domain models. | 
| **Monorepo Manager** | **Turborepo** (or **pnpm workspaces**) | Caching, parallel compilation, isolated dependencies per app. | 
| **Backend / API** | **Node.js (NestJS or Hono)** | Type-safe backend enforcing strict business rules and RBAC. | 
| **Database** | **PostgreSQL + Prisma ORM** | Relational integrity, easy schema migrations, highly AI-compatible. | 

## 2. Directory Structure (Full Stack)

A modular monorepo structure separating frontend platforms, shared logic, and backend API services.

```
my-cross-platform-app/
├── apps/
│   ├── web/                         # Next.js Web App
│   ├── mobile/                      # Expo Mobile App
│   └── api/                         # Backend API (Node.js/Hono/Nest)
│       ├── src/
│       │   ├── controllers/         # Handles HTTP requests & responses
│       │   ├── services/            # Core business logic (Best Practice)
│       │   └── routes/              # API Endpoints mapping
│
└── packages/                        
    ├── db/                          # Prisma Schema & Database Client
    ├── api-client/                  # Shared TanStack Query / Axios fetches
    ├── types/                       # Shared TypeScript interfaces (Roles, DTOs)
    └── validation/                  # Zod schemas (Login, AddUser, CreateRequest)

```

## 3. Backend & Database Architecture

For a system that is **minimal, best practice, and easy to modify**, use **PostgreSQL** paired with **Prisma ORM**. 

To provide a standard business structure, we include a **"Request/Task"** system. This allows Clients to submit data/orders/tickets, Employees to process them, and Admins to view global metrics.

### Database Schema (Prisma AI Context)

```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  EMPLOYEE
  CLIENT
}

enum RequestStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  CANCELLED
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed via bcrypt/argon2
  name      String
  role      Role     @default(CLIENT)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Business Relations
  clientRequests Request[] @relation("ClientRequests")
  assignedTasks  Request[] @relation("EmployeeAssignments")
}

model Request {
  id          String        @id @default(uuid())
  title       String
  description String?
  status      RequestStatus @default(PENDING)
  
  // The client who created the request
  clientId    String
  client      User          @relation("ClientRequests", fields: [clientId], references: [id])
  
  // The employee processing the request
  employeeId  String?
  employee    User?         @relation("EmployeeAssignments", fields: [employeeId], references: [id])

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  resolvedAt  DateTime?     // Used to calculate resolution time KPIs
}
```

## 4. Application Features & Role-Based Access (RBAC)

The application centers around three distinct user types. UI elements, APIs, and data access are strictly scoped to these roles based on best business practices.

| Role | Permissions & Capabilities | Business Purpose | 
| ----- | ----- | ----- | 
| **ADMIN** | Full CRUD on Users and Requests. Can assign tasks to Employees. | System oversight, performance monitoring, and user provisioning. | 
| **EMPLOYEE** | Can read assigned Requests. Can update Request status (e.g., to RESOLVED). | Operational fulfillment and client support. | 
| **CLIENT** | Can only read/create their own Requests. Cannot assign Employees. | End-user engagement and service requests. | 

## 5. View Blueprints (UI/UX Concepts)

*Note for AI Code Generation: Use Tailwind CSS for all styling. Rely on Lucide-React for icons.*

### 1. Auth: Login View (`/login`)
* **Layout:** Minimalist split screen (Web) or centered card (Mobile).
* **Components:** Email input, Password input, "Sign In" button.
* **Logic:** On success, stores JWT token and redirects to `/dashboard` (which renders based on role).

### 2. Core: Dashboard View (`/dashboard` - DYNAMIC BY ROLE)
* **Layout:** Sidebar navigation (Web) / Bottom Tab navigation (Mobile).

**A. ADMIN Dashboard:**
* **Summary Cards:** Total Active Clients, Unassigned Pending Requests, Average Resolution Time (KPI).
* **Data Chart:** Requests created vs. resolved over the last 30 days.
* **Recent Activity:** A feed of the latest completed requests across the whole company.

**B. EMPLOYEE Dashboard:**
* **Summary Cards:** My Assigned Tasks, My Open Tasks, Tasks Resolved Today.
* **Task Board/List:** A Kanban-style board or priority list of `Requests` where `employeeId === currentUser.id`. Filters for `PENDING` and `IN_PROGRESS`.
* **Action:** Ability to click a task, view details, and change status to `RESOLVED`.

**C. CLIENT Dashboard:**
* **Summary Cards:** My Open Requests, Total Historical Requests.
* **Primary Action:** Large "Create New Request" button (opens a modal/screen to submit title and description).
* **Status Tracking:** A table/list of their submitted requests showing current status (`PENDING` badge in yellow, `IN_PROGRESS` in blue, `RESOLVED` in green).

### 3. Management: User Management View (`/users` - ADMIN ONLY)
* **Layout:** Data table view with pagination and search/filter bar.
* **Components:**
  * **Table:** Columns for Name, Email, Role (styled badge), Status, and Actions (Edit/Delete).
  * **Add User Form:** Fields for Name, Email, Password, Role Dropdown. Uses shared Zod validation.

## 6. Implementation Roadmap

### Phase 1: Database & Backend Foundation
1. Initialize PostgreSQL database.
2. Setup Prisma ORM, push the `User` and `Request` schema, and generate the Prisma Client.
3. Build Node.js API with endpoints: Auth (`/login`), Users (`/users`), and Requests (`/requests`). Enforce RBAC in services.

### Phase 2: Shared Packages & Validation
1. Create `zod` schemas for login, user creation, and request creation.
2. Set up the API client using Axios/TanStack Query in `packages/api-client`.

### Phase 3: Frontend Development (Web then Mobile)
1. Build Web/Mobile Login.
2. Build role-specific Dashboard components using the shared API client.
3. Connect UI components to live data and test Admin/Employee/Client flows.