# WorkNest — Workplace Operations & Employee Management Platform

WorkNest is a modern, enterprise-grade workplace operations and human resources management platform built on the **MERN** stack (MongoDB, Express.js, React 18, Node.js). Designed for reliability, accessibility, and high performance, WorkNest streamlines organizational workflows, employee lifecycles, attendance tracking, leave requests, internal announcements, document vaults, operational analytics, and productivity workflows with fine-grained Role-Based Access Control (RBAC).

---

## 1. Problem Statement

Modern organizations frequently suffer from fragmented operational tooling:
- Attendance tracking, leave management, and task delegation often live in disconnected spreadsheets or single-purpose apps.
- Internal documents and company announcements lack centralized role-scoped distribution and expiration lifecycles.
- Managers lack real-time visibility into team capacity, active leaves, and project bottlenecks.
- Developers and IT teams face security risks when credentials, mass-assignment vulnerabilities, and file traversal risks are not rigorously guarded at the API layer.

**WorkNest solves this** by delivering a unified, secure, and accessible single-page application and RESTful backend where employees, managers, and administrators collaborate efficiently within a role-tailored environment.

---

## 2. Key Features

- **Role-Based Workspaces**: Scoped interfaces and capabilities tailored for Employees, Department Managers, and Organization Administrators.
- **Attendance Management**: Daily one-click check-in/check-out, late threshold detection, working hour tracking, and monthly summary KPIs.
- **Leave Operations**: Leave applications, working-day calculations, quota balance tracking, and manager approval/rejection workflows with instant status notifications.
- **Task Delegation & Tracking**: Scoped task queues, priority levels, deadline management, and status state machines (`TODO` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`).
- **Secure Document Vault**: Cryptographically opaque file storage, MIME type validation, file size enforcement, and path-traversal-proof binary downloads.
- **Company Announcements**: Organization-wide broadcasts and department-targeted announcements with automated expiration handling.
- **Real-Time In-App Notifications**: Unread counters, user preference filters, 10-second spam deduplication, and mark-as-read workflows.
- **Audit Logging & Activity Feed**: Non-repudiation audit trails for sensitive changes, sanitizing credentials and tokens.
- **Analytics & Operational Reports**: Role-scoped metrics, visual charts, and CSV/JSON data export with CSV formula injection mitigation.
- **AI-Assisted Productivity**: Backend-only synthesis for task breakdowns, leave request drafting, document summarization, and workload recommendations.
- **User Profile & Security**: Password policy enforcement, self-service contact updates, notification preferences, and Light/Dark/System theme switching.

---

## 3. Role-Based Access Control (RBAC)

WorkNest enforces role authorization on both backend API middleware and frontend client route guards:

| Role | Operational Scope & Permissions | Enrollment |
| :--- | :--- | :--- |
| **`EMPLOYEE`** | Self-service portal: Daily attendance check-in/out, personal attendance logs, leave balance review & application submission, personal assigned tasks, document downloads (organization & own department), company announcements, notification center, personal profile & password management. | Default for public registration |
| **`MANAGER`** | Department leadership: Real-time team attendance monitoring, leave application review & approval/rejection for managed department staff, department task creation/reassignment & workload oversight, department-targeted announcements, and team analytics. | Assigned by Administrator |
| **`ADMIN`** | Enterprise-wide administration: Full staff provisioning & account lifecycle management, department hierarchy configuration, document vault upload/archival, organization-wide announcements, comprehensive operational audit logs, and organization analytics. | Seeded / Organization Owner |

---

## 4. Technology Stack

### Frontend
- **Core**: React 18 (SPA) with Vite build tooling
- **Routing**: React Router DOM v6 with route-level code splitting (`React.lazy` & `Suspense`)
- **Styling**: Tailwind CSS with custom semantic design system tokens
- **HTTP Client**: Axios with configured interceptors, credentials support, and HttpOnly cookie transmission
- **Icons**: Lucide React
- **Theme**: Persistent Light, Dark, and System Default theme modes

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM (with automatic fallback to in-memory MongoDB for zero-config local development)
- **Authentication**: JSON Web Tokens (JWT) delivered via secure `HttpOnly` cookies + bcryptjs password hashing
- **Security Middleware**: Helmet headers, custom sliding-window rate limiters, NoSQL injection sanitization, CORS origin controls
- **File Handling**: Multer with strict MIME validation, cryptographic random file keys, and local upload storage

---

## 5. Architecture Overview & Project Structure

```
WorkNest/
├── backend/
│   ├── src/
│   │   ├── config/              # Database connection (db.js) & environment variables (env.js)
│   │   ├── constants/           # Business rules, roles, quotas, file types, statuses
│   │   ├── controllers/         # HTTP request orchestrators (auth, employee, task, leave, etc.)
│   │   ├── middleware/          # authMiddleware, roleMiddleware, rateLimiter, mongoSanitizer, errorHandler
│   │   ├── models/              # Mongoose schemas (User, Department, Attendance, Leave, Task, Document, etc.)
│   │   ├── routes/              # Express API route modules
│   │   ├── scripts/             # Automated test runners (testPhase10-15.js) & database seeder (seedUsers.js)
│   │   ├── services/            # Core business logic & database queries
│   │   └── utils/               # Token helpers, response formatters, CSV sanitizers
│   ├── server.js                # Server bootstrap entrypoint
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI primitives, App Shell, navigation, modals, and module components
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── hooks/               # Custom React hooks (useAuth, useTheme, etc.)
│   │   ├── layouts/             # AppLayout with responsive sidebar & topbar
│   │   ├── pages/               # Route page components (Dashboard, Employees, Tasks, Leave, AI, etc.)
│   │   ├── routes/              # AppRoutes, ProtectedRoute, PublicOnlyRoute
│   │   ├── services/            # Axios API service clients
│   │   ├── utils/               # Formatters, date helpers, validation utilities
│   │   └── constants/           # Frontend constants & API endpoint definitions
│   ├── vite.config.js           # Vite bundle configuration with vendor chunk splitting
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── deployment.md            # Complete production deployment & hosting guide
│   └── phase-15-audit.md        # Comprehensive security, accessibility, and QA audit
├── .gitignore
└── README.md
```

---

## 6. Authentication & Security Architecture

- **HttpOnly Cookie Authentication**: JWT access tokens are set in `HttpOnly`, `SameSite`, `Secure` cookies (`worknest_token`), shielding tokens from XSS theft.
- **No Insecure Fallback**: In production mode (`NODE_ENV=production`), the backend strictly refuses to start if `JWT_SECRET` is missing or set to default placeholders.
- **Sliding-Window Rate Limiting**: Built-in in-memory rate limiters protect authentication (`/api/auth/login`, `/api/auth/register`), password changes (`/api/profile/change-password`), and AI assistance endpoints (`/api/ai/*`).
- **NoSQL Query Injection Defense**: Custom middleware recursively removes all dangerous `$` and `.` operators from request bodies, URL params, and query strings.
- **Mass-Assignment Guardrails**: Profile updates strictly whitelist modifiable fields (`firstName`, `lastName`, `phone`, `location`), blocking self-promotion of `role`, `department`, or `employeeId`.
- **CSV Injection Prevention**: All exported CSV reports sanitize cell formulas starting with `=`, `+`, `-`, `@`, `\t`, or `\r` via single-quote escaping (CWE-1236).
- **Zero Client-Side Secret Leakage**: AI provider keys, JWT secrets, and database credentials remain strictly on the backend and never enter Vite bundles.

---

## 7. Core Modules Overview

### 1. Employees & Provisioning (`/api/employees`)
- Full directory listing with server-side pagination, search by name/email/ID, and department/role filtering.
- Administrator employee creation with automatic employee ID generation and secure initial credentials.
- Account deactivation protection preventing the lockout of the last active administrator.

### 2. Departments & Hierarchy (`/api/departments`)
- Department catalog with uppercase code validation and manager assignments.
- Real-time employee headcount aggregation and leader association.
- Deletion safeguards preventing deactivation of departments with active staff.

### 3. Attendance Management (`/api/attendance`)
- Daily check-in and check-out with automatic worked hours computation.
- Enforces single daily check-in and automatically flags late arrivals (past 09:30 AM).
- Blocks check-in on approved leave dates and displays `ON_LEAVE` status.

### 4. Leave Management (`/api/leaves`)
- Annual leave quota balances (`Casual`, `Sick`, `Annual`, `Unpaid`).
- Prevents overlapping applications and validates sufficient remaining balance.
- Manager/Admin approval and rejection workflow with automatic balance deduction.

### 5. Task Workflows (`/api/tasks`)
- Task creation, delegation, priority rating (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and deadline tracking.
- Strict state progression (`TODO` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`) validated against assignee permissions.

### 6. Document Vault (`/api/documents`)
- Multi-format file uploads (PDF, Word, Excel, PowerPoint, Images, Text) up to 10 MB.
- Path traversal protection and opaque storage keys preventing direct filesystem access.
- Role-scoped repository with automatic expiration suppression for general staff.

### 7. Company Announcements (`/api/announcements`)
- Enterprise broadcasts (`ORGANIZATION`) and department-scoped bulletins (`DEPARTMENT`).
- Publication lifecycle (`DRAFT` &rarr; `PUBLISHED` &rarr; `ARCHIVED`) with automatic expiration.

### 8. In-App Notifications (`/api/notifications`)
- Scoped notification inbox with real-time unread badge counter.
- Automated triggers for task assignments, leave status updates, document uploads, and announcements.
- Granular user preference toggles allowing individual staff to customize notification categories.

### 9. Activity & Audit Trail (`/api/activities`)
- Centralized audit trail recording operational events, actor metadata, and timestamps.
- RBAC scoping: Employees see personal events, Managers see team events, Admins see organization-wide logs.

### 10. Workplace Analytics & Insights (`/api/analytics`)
- Executive KPIs: Workforce count, attendance rates, pending leaves, and active task pipelines.
- Historical trend analysis with customizable date ranges (`from` / `to`).

### 11. Operational Reports & Data Export (`/api/reports`)
- Generates structured JSON or CSV data exports for Attendance, Leaves, Tasks, Employees, and Departments.
- Sanitized against CSV injection vulnerabilities.

### 12. AI Assistance Layer (`/api/ai`)
- Optional productivity features: Task breakdown synthesis, professional leave request drafting, document plain-text summarization, and workload recommendations.
- Works with Google Gemini or deterministic local mock synthesis when no API key is provided.

### 13. Profile & Account Settings (`/api/profile`)
- Self-service profile contact updates.
- Password change with bcrypt verification and session cookie refresh.
- In-app notification category preference controls and theme customization.

---

## 8. API Overview

| Module | Route Prefix | Primary Endpoints | Access |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth` | `/login`, `/register`, `/me`, `/logout` | Public / Authenticated |
| **Employees** | `/api/employees` | `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/status` | Admin, Manager |
| **Departments** | `/api/departments`| `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/status` | Admin, Manager |
| **Attendance** | `/api/attendance` | `/check-in`, `/check-out`, `/today`, `/my`, `/my/summary`, `GET /` | All (Scoped) |
| **Leave** | `/api/leaves` | `POST /`, `/my`, `/my/balance`, `/manage`, `/:id/approve`, `/:id/reject` | All (Scoped) |
| **Tasks** | `/api/tasks` | `POST /`, `GET /`, `/my`, `/:id`, `PATCH /:id`, `PATCH /:id/status` | All (Scoped) |
| **Documents** | `/api/documents` | `POST /`, `GET /`, `/:id`, `/:id/download`, `/:id/archive` | All (Scoped) |
| **Announcements**| `/api/announcements`| `POST /`, `GET /`, `/:id`, `/:id/publish`, `/:id/archive` | All (Scoped) |
| **Notifications**| `/api/notifications`| `GET /`, `/unread-count`, `/:id/read`, `/read-all` | Authenticated |
| **Activities** | `/api/activities` | `GET /` | All (Scoped) |
| **Analytics** | `/api/analytics` | `/overview`, `/attendance`, `/leave`, `/tasks`, `/employees`, `/departments` | All (Scoped) |
| **Reports** | `/api/reports` | `GET /:type` (`attendance`, `leave`, `tasks`, `employees`, `departments`) | All (Scoped) |
| **AI** | `/api/ai` | `/status`, `/tasks/:id/summary`, `/leave/draft`, `/documents/:id/summary`, `/productivity/insight` | All (Scoped) |
| **Profile** | `/api/profile` | `GET /`, `PATCH /`, `POST /change-password`, `GET /preferences`, `PATCH /preferences` | Authenticated |
| **Health** | `/api/health` | `GET /` | Public |

---

## 9. Local Development & Setup

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **npm** (or yarn / pnpm)
- **MongoDB**: Optional local MongoDB daemon (if not running, WorkNest automatically launches an embedded in-memory MongoDB database)

### 1. Clone the repository
```bash
git clone https://github.com/charumanchandani/WorkNest.git
cd WorkNest
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
The backend API initializes on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```
The frontend Vite development server initializes on `http://localhost:5173`.

### 4. Development Seed Accounts
When using development mode or the in-memory database, the database is automatically seeded with test accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@worknest.io` | `Password123!` |
| **Manager** | `manager@worknest.io` | `Password123!` |
| **Employee** | `employee@worknest.io` | `Password123!` |

You can also manually reseed at any time:
```bash
cd backend && npm run seed
```

---

## 10. Testing & Quality Commands

WorkNest includes standalone automated regression test suites for all major phases, as well as linting and build validation commands:

```bash
# Backend Quality Checks & Regressions
cd backend
npm run lint                     # ESLint verification
node src/scripts/testPhase15.js  # Phase 15: Testing, Security & QA (31 tests)
node src/scripts/testPhase14.js  # Phase 14: Profile & Settings (23 tests)
node src/scripts/testPhase13.js  # Phase 13: AI Assistance Layer (14 tests)
node src/scripts/testPhase12.js  # Phase 12: Analytics & Reports (28 tests)
node src/scripts/testPhase11.js  # Phase 11: Notifications & Activity (21 tests)
node src/scripts/testPhase10.js  # Phase 10: Documents & Announcements (19 tests)

# Frontend Quality Checks & Production Build
cd ../frontend
npm run lint                     # ESLint verification
npm run build                    # Compiles optimized production bundle into dist/
npm run preview                  # Previews production bundle locally
```

---

## 11. Deployment Guidance & Production Considerations

For step-by-step production deployment instructions, refer to [`docs/deployment.md`](docs/deployment.md).

### Summary of Production Considerations:
1. **Frontend Hosting**: Static hosting on Vercel, Netlify, or Cloudflare Pages with single-page application rewrite rules enabled.
2. **Backend Hosting**: Container/Node.js hosting on Render, Railway, Fly.io, or AWS EC2.
3. **Database**: MongoDB Atlas replica set with TLS encryption.
4. **File Storage**: Local uploads (`backend/uploads/`) are fully self-contained for VPS / single-server deployments. For ephemeral container hosts (e.g. Render free tier), configure S3/Cloudinary object storage to retain uploaded documents across restarts.
5. **Cookie Security**: Ensure `NODE_ENV=production`, `CLIENT_URL` matches the deployed frontend domain with HTTPS, and `JWT_SECRET` is set to a cryptographically strong 64+ character random string.

---

## 12. License

This project is licensed under the MIT License.
