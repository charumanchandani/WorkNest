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
│   │   ├── components/      # UI components, Landing sections, App Shell & Employees
│   │   ├── layouts/         # AppLayout (Sidebar, Topbar, Content Outlet)
│   │   ├── pages/           # LandingPage, LoginPage, RegisterPage, EmployeeDashboard, EmployeesPage, EmployeeDetailPage
│   │   ├── routes/          # AppRoutes, ProtectedRoute, PublicOnlyRoute
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── hooks/           # useAuth, useTheme
│   │   ├── services/        # apiClient, authService, employeeService
│   │   ├── utils/           # Helper functions & formatting utilities
│   │   ├── constants/       # App constants and configuration tokens
│   │   └── assets/          # Static assets and icons
│   └── package.json
│
├── backend/                 # API server (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/          # Database connection & environment configuration
│   │   ├── controllers/     # authController, employeeController, healthController
│   │   ├── middleware/      # authMiddleware (protect), roleMiddleware (authorizeRoles), errorHandler
│   │   ├── models/          # User (Mongoose schema with employee profile fields)
│   │   ├── routes/          # authRoutes, employeeRoutes, healthRoutes
│   │   ├── scripts/         # seedUsers.js (development test accounts)
│   │   ├── services/        # employeeService
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
| **`EMPLOYEE`** | Self-service access for personal attendance, time-off requests, assigned tasks, and company resources. | Default for public registration |
| **`MANAGER`** | Department-level access for team availability monitoring, leave approval queues, and viewing the employee directory. | Organization-assigned / Seeded |
| **`ADMIN`** | Enterprise-level access for full employee provisioning, role assignment, status toggling, and global workplace policies. | Organization-assigned / Seeded |

---

## API Endpoints

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Enrolls new user with `EMPLOYEE` role and sets HttpOnly JWT cookie |
| `POST` | `/api/auth/login` | Public | Verifies credentials and sets HttpOnly JWT cookie |
| `GET` | `/api/auth/me` | Private | Returns safe current authenticated user profile (`id`, `name`, `email`, `role`) |
| `POST` | `/api/auth/logout` | Private/Public | Invalidate session and clears `worknest_token` cookie |

### 2. Employee Management (`/api/employees`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Admin, Manager | List employees with server-side pagination, search, and role/status filters |
| `GET` | `/api/employees/:id` | Admin, Manager | Retrieve full profile details of a single employee |
| `POST` | `/api/employees` | Admin | Create and provision a new employee account |
| `PATCH` | `/api/employees/:id` | Admin | Update employee profile information |
| `PATCH` | `/api/employees/:id/status` | Admin | Activate or deactivate employee account (with last active admin protection) |

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
Creates default development accounts:
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
- `npm run seed`: Seeds development test accounts
- `npm start`: Runs the server in production mode
- `npm run lint`: Runs ESLint / code style checks

---

## License

This project is licensed under the MIT License.
