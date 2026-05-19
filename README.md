# WorkPulse — Modern Full-Stack Work Management Workspace

WorkPulse is a premium, futuristic task management workspace designed with a sleek glassmorphic user interface. It features a drag-and-drop Kanban board, real-time analytics dashboard, team collaboration space, task comments, file attachments, and custom activity logging.

The project is structured as a full-stack monorepo featuring a React frontend and an Express backend, supporting automatic database initialization.

---

## Technical Stack

### Frontend
- **React 18 + Vite** (Fast build and Hot Module Replacement)
- **Tailwind CSS** (Modern styling with support for dark/light mode and glassmorphism)
- **Framer Motion** (Smooth transitions and interactive micro-animations)
- **Zustand** (Lightweight state management for authentication and theme settings)
- **React Router v6** (Client-side routing)
- **Axios** (API requests with automatic token insertion)
- **@dnd-kit** (Robust and accessible drag-and-drop Kanban interface)
- **Recharts** (Interactive charts and productivity metrics)
- **React Hot Toast** (Polished UI notifications)

### Backend
- **Node.js + Express** (High-performance API server)
- **MySQL Integration** (Connects natively using mysql2 pool connection)
- **JWT Authentication** (`jsonwebtoken` + `bcryptjs` password hashing)
- **Multer** (File upload middleware for task attachments)
- **Security & Optimization**:
  - `helmet` (Secure HTTP headers)
  - `cors` (Cross-Origin Resource Sharing)
  - `express-rate-limit` (DDoS and API abuse prevention)
  - `zod` (Robust schema-based request validation)

---

## Folder Structure

```text
├── backend/                  # REST API Server
│   ├── src/
│   │   ├── server.js         # Entry point (boots server & initializes database)
│   │   ├── app.js            # Express app configuration & middleware pipeline
│   │   ├── config/           # Config files (db connection pool)
│   │   ├── controllers/      # Route controllers (business logic)
│   │   ├── db/               # Database initialization & schemas
│   │   ├── middleware/       # JWT auth, uploads, and error handler middlewares
│   │   ├── routes/           # REST endpoints
│   │   └── utils/            # Activity logging & helper utilities
│   ├── schema.sql            # MySQL production database schema
│   └── package.json
│
├── frontend/                 # React Client
│   ├── src/
│   │   ├── api/              # Axios API clients
│   │   ├── components/       # Reusable UI & layout components
│   │   ├── pages/            # React views (Landing, Dashboard, Settings, etc.)
│   │   ├── store/            # Zustand global stores
│   │   └── main.jsx          # React app entry point
│   ├── vite.config.js        # Vite config with api proxying
│   └── package.json
│
├── package.json              # Monorepo orchestration configuration
└── README.md
```

---

## Production Deployment Guide

### Option A: Monorepo Single-Service Deployment (Recommended)
This approach builds and deploys both the frontend and backend under a single Railway web service. The backend serves the compiled frontend static files, avoiding CORS configuration issues and reducing service costs.

1. **Deploy to Railway**:
   - Push your code to your GitHub repository.
   - On Railway, click **New Project** $\rightarrow$ **Deploy from GitHub repo** and select your repository.
   - Leave the **Root Directory** as `/` (default). Railway will detect the root `package.json`, install all dependencies, build the frontend, and boot up the server.

2. **Provision MySQL Database**:
   - Inside your Railway project dashboard, click **New** $\rightarrow$ **Database** $\rightarrow$ **Add MySQL**.
   - Railway will automatically link the database and inject connection variables into your service.

3. **Configure Environment Variables**:
   - Under your Railway service's **Variables** tab, set:
     - `DB_DRIVER` = `mysql` (Instructs the server to use the MySQL driver).
     - `JWT_SECRET` = `your_strong_production_jwt_secret`
     - `NODE_ENV` = `production`
   - On startup, the backend will auto-detect the database credentials and run `schema.sql` to initialize the database tables automatically.

### Option B: Split-Service Deployment
If you prefer to deploy the backend and frontend separately:

1. **Backend Service**:
   - Deploy your repository with the **Root Directory** set to `/backend`.
   - Set the environment variables:
     - `DB_DRIVER` = `mysql`
     - `JWT_SECRET` = `your_strong_production_jwt_secret`
     - `NODE_ENV` = `production`
     - `CLIENT_URL` = `https://your-frontend.vercel.app` (Your frontend URL to configure CORS).

2. **Frontend Service (Vercel / Netlify / Railway)**:
   - Import the `frontend/` directory.
   - Set the framework preset to **Vite**.
   - Add the environment variable: `VITE_API_URL` = `https://your-backend.up.railway.app/api`.
