# WorkNest — Production Deployment Guide

This guide details the complete deployment workflow for **WorkNest** (MERN platform), covering frontend hosting, backend service setup, MongoDB Atlas integration, security configurations, and production best practices.

---

## 1. Architectural Overview

```
                        ┌─────────────────────────────────┐
                        │      Client Web Browser         │
                        └───────────────┬─────────────────┘
                                        │ HTTPS (SameSite Cookie)
                ┌───────────────────────┴───────────────────────┐
                ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     Frontend (Vercel)         │               │     Backend API (Render)      │
│  - React 18 + Vite SPA        │               │  - Node.js + Express          │
│  - Static Asset CDN           │               │  - Security & Rate Limiting   │
│  - Tailwind CSS Styling       │               │  - Helmet + JWT HttpOnly      │
└───────────────────────────────┘               └───────────────┬───────────────┘
                                                                │
                                                ┌───────────────┴───────────────┐
                                                ▼                               ▼
                                ┌───────────────────────────────┐ ┌───────────────────────────┐
                                │     MongoDB Atlas Database    │ │   Optional Object Storage │
                                │  - Replica Set Cluster        │ │  - S3 / Cloudinary        │
                                │  - TLS Encrypted Connection   │ │  - Ephemeral FS Fallback  │
                                └───────────────────────────────┘ └───────────────────────────┘
```

---

## 2. Database Setup: MongoDB Atlas

1. **Create an Atlas Cluster**:
   - Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a free (M0) or dedicated production cluster.
   - Select your preferred region (choose a region close to your backend hosting).

2. **Configure Database Access**:
   - Navigate to **Database Access** &rarr; **Add New Database User**.
   - Select **Password Authentication**, create a secure username/password (e.g. `worknest_app`).
   - Grant `readWriteAnyDatabase` or scoped read/write permissions to the `worknest` database.

3. **Configure Network Access**:
   - Navigate to **Network Access** &rarr; **Add IP Address**.
   - For serverless/container platforms (e.g. Render, Railway), allow access from anywhere (`0.0.0.0/0`) or configure specific egress IP ranges.

4. **Retrieve Connection String**:
   - Go to **Database** &rarr; **Connect** &rarr; **Drivers** (Node.js).
   - Copy the SRV connection URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/worknest?retryWrites=true&w=majority
     ```

---

## 3. Backend Deployment (Render / Railway / Fly.io)

### Recommended: Render Web Service

1. **Create New Web Service**:
   - Connect your GitHub repository (`frontend` branch or production deployment tag).
   - Set **Root Directory**: `backend`.
   - Set **Runtime**: `Node`.
   - Set **Build Command**: `npm install`.
   - Set **Start Command**: `npm start`.

2. **Environment Variables**:
   Configure the following environment variables in your hosting provider's dashboard:

   | Variable | Value / Description | Sensitive? |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | No |
   | `PORT` | `5000` (or leave default assigned by host) | No |
   | `MONGODB_URI` | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/worknest?retryWrites=true&w=majority` | **YES** |
   | `JWT_SECRET` | Generate a 64+ char random hexadecimal string (`openssl rand -hex 32`) | **YES** |
   | `JWT_EXPIRES_IN` | `7d` | No |
   | `CLIENT_URL` | `https://worknest.vercel.app` (Exact frontend domain with protocol, NO trailing slash) | No |
   | `AI_ENABLED` | `false` (or `true` if AI provider key is configured) | No |
   | `AI_PROVIDER` | `mock` (or `gemini`) | No |
   | `AI_API_KEY` | *(Optional)* Google Gemini API Key | **YES** |
   | `AI_MODEL` | `gemini-1.5-flash` | No |

3. **Initial Data Seeding**:
   - If deploying to a fresh database, run the seed script via SSH console or a one-off job:
     ```bash
     npm run seed
     ```
   - This creates initial administrative, managerial, and employee test accounts and standard departments.

---

## 4. Frontend Deployment (Vercel / Netlify)

### Recommended: Vercel

1. **Import Project**:
   - Import your GitHub repository to Vercel.
   - Set **Framework Preset**: `Vite`.
   - Set **Root Directory**: `frontend`.
   - Set **Build Command**: `npm run build`.
   - Set **Output Directory**: `dist`.
   - Set **Install Command**: `npm install`.

2. **Environment Variables**:
   Set the client-side API base URL:

   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://worknest-api.onrender.com/api` | Points to your backend API `/api` root |

3. **Single-Page Application (SPA) Routing Configuration**:
   - Ensure all subroutes (e.g. `/app/employees`, `/app/tasks`) route to `index.html`.
   - WorkNest includes `vercel.json` or Vite client routing rules for seamless SPA rewrites:
     ```json
     {
       "rewrites": [
         { "source": "/(.*)", "destination": "/index.html" }
       ]
     }
     ```

---

## 5. Security & Cookie Considerations

### HTTPS & Cross-Origin Cookies
In production, WorkNest delivers authentication tokens using secure `HttpOnly` cookies (`worknest_token`).

- **Same-Origin vs Cross-Origin**:
  - When backend and frontend are hosted on different domains (e.g. `worknest.vercel.app` & `worknest-api.onrender.com`):
    - `secure: true` (Requires HTTPS on both services)
    - `sameSite: 'none'` (Enables cross-origin cookie delivery)
    - `credentials: true` (Configured in Axios instance and CORS middleware)
- **CORS Configuration**:
  - The backend's `CLIENT_URL` must exactly match the frontend origin (`https://worknest.vercel.app`).
  - No trailing slash in `CLIENT_URL`.

### Security Headers & Rate Limiting
- **Helmet**: Secures HTTP response headers with strict XSS, framing, and referrer controls.
- **NoSQL Injection Sanitizer**: Recursively purges `$` and `.` operators from request bodies, parameters, and query strings.
- **Rate Limiters**: Sliding-window limiters protect sensitive endpoints (`/api/auth/login`, `/api/auth/register`, `/api/profile/change-password`, `/api/ai/*`).

---

## 6. File Storage Considerations & Limitations

- **Current Implementation**:
  - WorkNest encapsulates file uploads in `storageService.js`, saving files to `backend/uploads/` with cryptographic opaque keys and path traversal protection.
- **Ephemeral Host Filesystems**:
  - Platforms like Render, Railway, and Heroku have ephemeral filesystems (files uploaded to disk are lost when containers restart or redeploy).
- **Production Recommendation**:
  - For long-term production deployments with large-scale document management, replace or augment the local `saveFileFromBuffer` / `getFileDownloadPath` methods in `backend/src/services/storageService.js` with S3-compatible cloud storage (AWS S3, Cloudflare R2, Google Cloud Storage, or Cloudinary).
  - For demos, single VPS instances (e.g. DigitalOcean Droplet, AWS EC2), and persistent Docker volume mounts, the current local disk storage is fully self-contained and requires zero third-party cloud accounts.

---

## 7. AI Assistance Configuration

- The AI assistance layer (`/api/ai/*`) is designed to be completely optional.
- If `AI_ENABLED=false` or `AI_PROVIDER=mock`, the system operates using local deterministic mock synthesis.
- To enable live Google Gemini models in production:
  1. Set `AI_ENABLED=true` in backend environment variables.
  2. Set `AI_PROVIDER=gemini`.
  3. Set `AI_API_KEY=<your-gemini-api-key>`.
  4. Set `AI_MODEL=gemini-1.5-flash`.
- **Note**: The AI key is backend-only and never exposed to client browsers or bundled into Vite static assets.

---

## 8. Production Launch Checklist

- [ ] **MongoDB Atlas**: Created cluster, added app user, whitelisted network IP `0.0.0.0/0`.
- [ ] **Backend Environment**:
  - [ ] `NODE_ENV=production`
  - [ ] `JWT_SECRET` generated (64+ random hex characters, no dev fallback)
  - [ ] `MONGODB_URI` points to live Atlas replica set
  - [ ] `CLIENT_URL` matches deployed frontend domain (HTTPS)
- [ ] **Frontend Environment**:
  - [ ] `VITE_API_BASE_URL` points to live backend `/api` URL (HTTPS)
  - [ ] SPA rewrite rules verified on host (Vercel/Netlify)
- [ ] **Verification**:
  - [ ] Health check returns `{"status":"ok"}` at `https://<backend-domain>/api/health`
  - [ ] Initial user login works (`admin@worknest.io`, `manager@worknest.io`, `employee@worknest.io`)
  - [ ] Check-in/out and attendance logging functions correctly
  - [ ] Document vault downloads and uploads function properly
  - [ ] Theme switching persists (Light / Dark / System)
  - [ ] Responsive UI renders cleanly across mobile, tablet, and desktop viewports
