# WorkNest — Workplace Operations & Employee Management Platform

WorkNest is a modern, modular workplace operations and employee management platform designed to streamline human resources, task tracking, organization management, and team collaboration within enterprise environments.

---

## Overview & Purpose

WorkNest delivers a consolidated operational workspace for organizations to manage employee lifecycles, attendance, leave requests, organizational hierarchies, internal communications, and task workflows with clean role-based access control and high architectural reliability.

---

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with Semantic Design System Tokens
- **HTTP Client**: Axios (with Credentials / HttpOnly Cookie support)
- **Iconography**: Lucide React
- **State & Context**: AuthContext, ThemeContext

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security & Auth**: JSON Web Tokens (JWT via HttpOnly Cookies), bcryptjs password hashing, CORS, Cookie-Parser
- **Configuration**: Dotenv

---

## High-Level Architecture

WorkNest follows a decoupled client-server architecture with clear separation of concerns:

```
WorkNest/
├── frontend/                # Client application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/      # UI components, App Shell, Employees, Departments, Attendance, Leave, Tasks, Documents, Announcements, Notifications, Analytics, Reports
│   │   ├── layouts/         # AppLayout (Sidebar, Topbar, Content Outlet)
│   │   ├── pages/           # LandingPage, LoginPage, RegisterPage, EmployeeDashboard, EmployeesPage, EmployeeDetailPage, DepartmentsPage, DepartmentDetailPage, AttendancePage, AttendanceManagePage, LeavePage, LeaveManagePage, TasksPage, TaskDetailPage, TasksManagePage, DocumentsPage, AnnouncementsPage, NotificationsPage, AnalyticsPage, ReportsPage
│   │   ├── routes/          # AppRoutes, ProtectedRoute, PublicOnlyRoute
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── hooks/           # useAuth, useTheme
│   │   ├── services/        # api, authService, employeeService, departmentService, attendanceService, leaveService, taskService, documentService, announcementService, notificationService, activityService, analyticsService
│   │   ├── utils/           # Helper functions & formatting utilities
│   │   ├── constants/       # App constants and configuration tokens
│   │   └── assets/          # Static assets and icons
│   └── package.json
│
├── backend/                 # API server (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/          # Database connection & environment configuration
│   │   ├── constants/       # attendance, leave, task constants (Timezone: Asia/Kolkata, quotas, priorities, statuses)
│   │   ├── controllers/     # authController, employeeController, departmentController, attendanceController, leaveController, taskController, documentController, announcementController, notificationController, activityController, analyticsController, reportController, healthController
│   │   ├── middleware/      # authMiddleware (protect), roleMiddleware (authorizeRoles), uploadMiddleware, errorHandler
│   │   ├── models/          # User, Department, Attendance, Leave, LeaveBalance, Task, Document, Announcement, Notification, Activity
│   │   ├── routes/          # authRoutes, employeeRoutes, departmentRoutes, attendanceRoutes, leaveRoutes, taskRoutes, documentRoutes, announcementRoutes, notificationRoutes, activityRoutes, analyticsRoutes, reportRoutes, healthRoutes
│   │   ├── scripts/         # seedUsers.js, testPhase12.js
│   │   ├── services/        # employeeService, departmentService, attendanceService, leaveService, taskService, documentService, announcementService, notificationService, activityService, analyticsService
│   │   └── utils/           # token, responseHandler
│   ├── server.js            # Server entrypoint & Express bootstrapping
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Role-Based Access Control (RBAC)

WorkNest enforces role authorization on both backend endpoints and frontend route guards:

| Role | Description | Enrollment / Access |
| :--- | :--- | :--- |
| **`EMPLOYEE`** | Self-service access for personal daily check-in/out, attendance history, monthly summary, leave application, personal leave history, balance review, personal assigned tasks view, task status progression, and profile details. | Default for public registration |
| **`MANAGER`** | Department-level access for team availability monitoring, staff attendance logs, reviewing/approving/rejecting leave applications for managed department staff, assigning & editing department tasks, monitoring team workload, and viewing employee directory. | Organization-assigned / Seeded |
| **`ADMIN`** | Enterprise-level access for full organization attendance, leave, and task oversight, employee provisioning, department management, and policy enforcement. | Organization-assigned / Seeded |

---

## API Endpoints

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Enrolls new user with `EMPLOYEE` role and sets HttpOnly JWT cookie |
| `POST` | `/api/auth/login` | Public | Verifies credentials and sets HttpOnly JWT cookie |
| `GET` | `/api/auth/me` | Private | Returns safe current authenticated user profile (`id`, `name`, `email`, `role`) |
| `POST` | `/api/auth/logout` | Private/Public | Invalidate session and clears `worknest_token` cookie |

### 2. Task Management (`/api/tasks`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks` | Admin, Manager | Create and assign a new workplace task (validates assignee status, department, and deadline) |
| `GET` | `/api/tasks` | Private (All) | Scoped task list with search, priority, status, department, and workload summary metrics |
| `GET` | `/api/tasks/my` | Private (All) | Paginated personal tasks assigned to authenticated employee with summary counts |
| `GET` | `/api/tasks/:id` | Private (Authorized) | Retrieve full task specifications, timeline, and assignment metadata |
| `PATCH` | `/api/tasks/:id` | Admin, Manager | Update task title, description, priority, assignee, or deadline |
| `PATCH` | `/api/tasks/:id/status` | Assignee, Admin, Manager | Progress task status (`TODO` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`) with state transition validation |

### 3. Leave Management (`/api/leaves`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leaves` | Private (All) | Submit a leave request (validates working days, overlaps, and available quotas) |
| `GET` | `/api/leaves/my` | Private (All) | Paginated personal leave requests with status, type, and date range filters |
| `GET` | `/api/leaves/my/balance` | Private (All) | Retrieve annual leave quotas, used days, pending requests, and available balance |
| `GET` | `/api/leaves/:id` | Private (Authorized) | Retrieve full details of a single leave application |
| `PATCH` | `/api/leaves/:id/cancel` | Private (Owner) | Cancel a personal `PENDING` leave request |
| `GET` | `/api/leaves/manage` | Admin, Manager | Scoped leave requests queue for management review with search and department filters |
| `PATCH` | `/api/leaves/:id/approve` | Admin, Manager | Approve a pending leave request and update employee balance atomically |
| `PATCH` | `/api/leaves/:id/reject` | Admin, Manager | Reject a pending leave request with optional review notes |

### 4. Attendance Management (`/api/attendance`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/check-in` | Private (All) | Check in authenticated user for today (enforces daily uniqueness, late threshold 09:30 AM, and approved leave block) |
| `POST` | `/api/attendance/check-out` | Private (All) | Check out authenticated user for today & calculates total working minutes |
| `GET` | `/api/attendance/today` | Private (All) | Retrieve today's check-in/out state, active status, elapsed duration, or `ON_LEAVE` status |
| `GET` | `/api/attendance/my` | Private (All) | Paginated personal attendance history with date range and status filters |
| `GET` | `/api/attendance/my/summary` | Private (All) | Monthly summary KPIs (Present, Late, Half Day, Absent, Worked Hours) |
| `GET` | `/api/attendance` | Admin, Manager | Scoped attendance monitoring list with search, department, and status filters |
| `GET` | `/api/attendance/:id` | Private (Authorized) | Retrieve full attendance record details |

### 5. Employee Management (`/api/employees`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Admin, Manager | List employees with server-side pagination, search, role/status filters, and department filter |
| `GET` | `/api/employees/:id` | Admin, Manager | Retrieve full profile details of a single employee |
| `POST` | `/api/employees` | Admin | Create and provision a new employee account with optional department assignment |
| `PATCH` | `/api/employees/:id` | Admin | Update employee profile information and department |
| `PATCH` | `/api/employees/:id/status` | Admin | Activate or deactivate employee account (with last active admin protection) |

### 6. Departments & Organization Structure (`/api/departments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Admin, Manager | List departments with pagination, search, status filter, and live employee counts |
| `GET` | `/api/departments/:id` | Admin, Manager | Retrieve department details, leadership info, employee count, and assigned staff preview |
| `POST` | `/api/departments` | Admin | Create a new department with unique name, uppercase code, and optional manager |
| `PATCH` | `/api/departments/:id` | Admin | Update department name, code, description, and manager |
| `PATCH` | `/api/departments/:id/status` | Admin | Activate or deactivate department (deactivation blocked if active employees remain) |
| `PATCH` | `/api/departments/:id/manager` | Admin | Assign or remove department manager (requires active Manager or Admin user) |

### 7. Document Vault (`/api/documents`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/documents` | Admin | Upload a new organizational/department document (`multipart/form-data`) with safe storage key |
| `GET` | `/api/documents` | Private (All) | Scoped document repository with search, category, department, and expiration filters |
| `GET` | `/api/documents/:id` | Private (Authorized) | Retrieve document metadata with strict RBAC permission verification |
| `GET` | `/api/documents/:id/download` | Private (Authorized) | Secure binary stream download with auth check, path traversal prevention, and expiration guard |
| `PATCH` | `/api/documents/:id` | Admin | Update document metadata, category, visibility, or expiration date |
| `PATCH` | `/api/documents/:id/archive` | Admin | Archive a document to remove from standard employee listings |

- **Storage & Security**: Clean abstraction layer storing files in `backend/uploads/` (git-ignored) with cryptographic opaque keys. Prevents path traversal and never exposes filesystem paths.
- **Supported File Types**: PDF, Word (`.doc`, `.docx`), Excel (`.xls`, `.xlsx`), PowerPoint (`.ppt`, `.pptx`), Plain Text (`.txt`), Images (`.png`, `.jpg`, `.jpeg`). Maximum file size: 10 MB.
- **Document Access & RBAC**:
  - `EMPLOYEE`: View & download active, non-expired organization documents and own department documents.
  - `MANAGER`: View & download organization documents and documents for managed departments.
  - `ADMIN`: Full repository management (upload, edit, archive, download, view all).

### 8. Company Announcements (`/api/announcements`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/announcements` | Admin, Manager | Create an announcement (Admin: Org/Dept; Manager: managed Department only) |
| `GET` | `/api/announcements` | Private (All) | Paginated announcements feed (Employees: published/non-expired; Managers/Admins: manage queue) |
| `GET` | `/api/announcements/:id` | Private (Authorized) | Retrieve full announcement details with audience and author metadata |
| `PATCH` | `/api/announcements/:id` | Admin, Manager | Update draft announcement content and parameters |
| `PATCH` | `/api/announcements/:id/publish` | Admin, Manager | Transition `DRAFT` &rarr; `PUBLISHED` with server-stamped publication date |
| `PATCH` | `/api/announcements/:id/archive` | Admin, Manager | Transition `DRAFT`/`PUBLISHED` &rarr; `ARCHIVED` |

- **Targeting & Delivery**:
  - `ORGANIZATION`: Broadcasts to all active company staff.
  - `DEPARTMENT`: Targeted specifically to active members of the selected department.
- **Workflow & Expiration**: Structured state machine (`DRAFT` &rarr; `PUBLISHED` &rarr; `ARCHIVED`). Plain text content only (no HTML injection). Expired announcements automatically disappear from staff feeds without background cron jobs.

### 9. In-App Notifications (`/api/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Private (All) | Paginated notifications feed strictly scoped to authenticated user with unread and type filters |
| `GET` | `/api/notifications/unread-count` | Private (All) | Live unread notification counter for badge displays and polling |
| `PATCH` | `/api/notifications/:id/read` | Private (Owner) | Mark a specific notification as read with server timestamp |
| `PATCH` | `/api/notifications/read-all` | Private (All) | Mark all pending notifications for current user as read |

- **Notification Triggers**:
  - **Leave**: Leave submitted (&rarr; department manager), Leave approved/rejected (&rarr; employee), Leave cancelled (&rarr; department manager).
  - **Tasks**: Task assigned/reassigned (&rarr; assignee), Task completed/updated (&rarr; assigner).
  - **Documents**: Document uploaded (&rarr; eligible organization or department members).
  - **Announcements**: Announcement published (&rarr; targeted staff or department members).
- **Deduplication**: 10-second deduplication threshold prevents spamming identical notifications.

### 10. Operational Activity & Audit Trail (`/api/activities`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activities` | Private (All) | Paginated audit feed with entity type, action, actor, and date filters |

- **RBAC Scoping**:
  - `EMPLOYEE`: Strictly view personal operational activity and targeted workflow events.
  - `MANAGER`: View team activities across managed departments in addition to personal logs.
  - `ADMIN`: Organization-wide comprehensive audit and operational timeline.
- **Security & Privacy**: Automatically strips passwords, tokens, full document payloads, and sensitive credentials from activity logs.

### 11. Workplace Analytics & Insights (`/api/analytics`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/overview` | Private (All) | Role-scoped executive overview KPIs (workforce, today's attendance, pending leaves, task pipeline, activity count) |
| `GET` | `/api/analytics/attendance` | Private (All) | Attendance metrics, total/average hours, rate, and daily trend time-series |
| `GET` | `/api/analytics/leave` | Private (All) | Leave requests, approved working days, category distribution, and department usage |
| `GET` | `/api/analytics/tasks` | Private (All) | Task turnaround timings, priority breakdown, completion rate, and department workloads |
| `GET` | `/api/analytics/employees` | Admin, Manager | Staff distribution, active/inactive headcount, role allocation, and recent joinings |
| `GET` | `/api/analytics/departments` | Admin, Manager | Departmental workload, completion rates, today's attendance rate, and approved leave usage |

- **Date Filtering**: Supports `from` and `to` date query parameters (defaults to the current calendar month).
- **RBAC Scoping**:
  - `EMPLOYEE`: Personal attendance, leave, task metrics, and personal activity counts only.
  - `MANAGER`: Scoped strictly to managed team members and assigned departments.
  - `ADMIN`: Full enterprise-wide organizational analytics.

### 12. Operational Reports & Data Export (`/api/reports`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/:type` | Private (All) | Generate verified operational reports in JSON or CSV format |

- **Supported Report Types**:
  1. `attendance`: Daily clock-in/out stamps, worked hours, and status classifications.
  2. `leave`: Approved and pending leave requests, total days, reasons, and review notes.
  3. `tasks`: Assignment rosters, priority ratings, due dates, overdue statuses, and completion timestamps.
  4. `employees`: Staff directory, job titles, department assignments, and hire dates (Admin & Manager only).
  5. `departments`: Headcounts, leadership, task completion rates, and attendance rates (Admin & Manager only).
- **Parameters**: `from`, `to`, `department`, `status`, `format` (`json` or `csv`).
- **CSV Security**: Sanitizes leading formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with single-quote escaping to prevent CSV spreadsheet injection (CWE-1236). Excludes all sensitive authentication credentials and tokens.

---

## Getting Started

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **npm** or **yarn** / **pnpm**
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection URI

---

### Installation & Setup

#### 1. Clone the repository
```bash
git clone https://github.com/charumanchandani/WorkNest.git
cd WorkNest
```

#### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Configure your environment variables in `backend/.env`.

Start the backend development server:
```bash
npm run dev
# or for production:
npm start
```
By default, the backend API will run on `http://localhost:5000`.

##### Seed Development Test Accounts (Optional):
```bash
npm run seed
```
Creates default development accounts & standard departments:
- **Admin**: `admin@worknest.io` / `Password123!`
- **Manager**: `manager@worknest.io` / `Password123!`
- **Employee**: `employee@worknest.io` / `Password123!`

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```
Configure `VITE_API_BASE_URL` in `frontend/.env` if running on a custom port/domain.

Start the frontend development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend (`backend/.env.example`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/worknest
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env.example`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Quality & Build Scripts

### Frontend
- `npm run dev`: Starts the local Vite development server
- `npm run build`: Compiles production bundle
- `npm run lint`: Runs ESLint checks
- `npm run preview`: Locally previews production build

### Backend
- `npm run dev`: Runs the server with Nodemon auto-reloading
- `npm run seed`: Seeds development test accounts and standard departments
- `npm start`: Runs the server in production mode
- `npm run lint`: Runs ESLint / code style checks

---

## License

This project is licensed under the MIT License.
