# WorkNest — Workplace Operations & Employee Management Platform

WorkNest is a modern, modular workplace operations and employee management platform designed to streamline human resources, task tracking, organization management, and team collaboration within enterprise environments.

---

## Overview & Purpose

WorkNest delivers a consolidated operational workspace for organizations to manage employee lifecycles, attendance, leave requests, organizational hierarchies, internal communications, and task workflows with clean role-based access control and high architectural reliability.

---

## Technology Stack

### Frontend
- **Framework**: React 18 / 19 with Vite
- **Routing**: React Router DOM (v6 / v7)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Iconography**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security & Auth**: JSON Web Tokens (JWT), bcryptjs, CORS, Helmet
- **Configuration**: Dotenv

---

## High-Level Architecture

WorkNest follows a decoupled client-server architecture with clear separation of concerns:

```
WorkNest/
├── frontend/                # Client application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/      # Shared reusable UI components
│   │   ├── layouts/         # Layout wrappers (public, authenticated, dashboards)
│   │   ├── pages/           # Page view components
│   │   ├── routes/          # Route declarations and guards
│   │   ├── context/         # React Context providers (Auth, Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Centralized API service layer
│   │   ├── utils/           # Helper functions & formatting utilities
│   │   ├── constants/       # App constants and configuration tokens
│   │   └── assets/          # Static assets and icons
│   └── package.json
│
├── backend/                 # API server (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/          # Database connection & environment configuration
│   │   ├── controllers/     # Request handlers & controllers
│   │   ├── middleware/      # Auth, validation & error handling middleware
│   │   ├── models/          # Mongoose schemas & data models
│   │   ├── routes/          # REST API route definitions
│   │   ├── services/        # Business logic layer
│   │   └── utils/           # Utility functions & response formatters
│   ├── server.js            # Server entrypoint & Express bootstrapping
│   └── package.json
│
├── .gitignore
└── README.md
```

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

Health Check:
```bash
curl http://localhost:5000/api/health
```

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
JWT_SECRET=your_jwt_secret_key_here
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
- `npm start`: Runs the server in production mode
- `npm run lint`: Runs ESLint / code style checks

---

## License

This project is licensed under the MIT License.
