# WorkPulse — Modern Full-Stack Work Management

A premium, futuristic task management workspace built with React, Express, and MySQL.
Glassmorphism UI, drag-and-drop kanban, analytics dashboard, teams, comments, and JWT auth.

---

## Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS (dark/light mode, glassmorphism)
- Framer Motion (page + micro animations)
- React Router v6
- Axios
- Zustand (auth + theme stores)
- `@dnd-kit` (kanban drag & drop)
- Recharts (analytics)
- React Hot Toast (notifications)
- React Icons

**Backend**
- Node.js + Express
- MySQL 8 via `mysql2/promise`
- JWT auth (`jsonwebtoken`)
- `bcryptjs` password hashing
- `multer` file uploads
- `helmet`, `cors`, `express-rate-limit`
- `zod` validation

---

## Folder structure

```
project-2/
├── backend/
│   ├── schema.sql
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/db.js
│       ├── middleware/{auth,error,upload}.js
│       ├── controllers/{auth,task,team,user,comment,attachment,notification,analytics}.controller.js
│       ├── routes/{auth,task,team,user,notification,analytics}.routes.js
│       └── utils/{token,validate,activity}.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/{axios,auth,tasks,teams,users,notifications,analytics}.js
        ├── store/{authStore,themeStore}.js
        ├── components/
        │   ├── common/{ProtectedRoute,ThemeToggle,Skeleton,EmptyState}.jsx
        │   ├── layout/{DashboardLayout,Sidebar,Topbar}.jsx
        │   ├── ui/{Button,Card,Input,Modal,Badge,Avatar}.jsx
        │   └── tasks/{TaskCard,TaskForm,KanbanBoard}.jsx
        ├── pages/{Landing,Login,Register,Dashboard,Tasks,Team,Analytics,Settings,Profile,NotFound}.jsx
        └── utils/{cn,date}.js
```

---

## Local setup

### 1. Prerequisites
- Node.js 18+
- MySQL 8+ running locally (or remote)
- npm / pnpm / yarn

### 2. Database
Open MySQL and run the schema:

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `workpulse` database and all tables.

### 3. Backend

```bash
cd backend
cp .env.example .env       # then edit DB credentials + JWT_SECRET
npm install
npm run dev                # starts http://localhost:5000
```

`.env` keys you must set:

```
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<your password>
DB_NAME=workpulse
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=10
```

Test it: `curl http://localhost:5000/api/health` → `{ "ok": true, ... }`

### 4. Frontend

```bash
cd frontend
cp .env.example .env       # default points at http://localhost:5000/api
npm install
npm run dev                # opens http://localhost:5173
```

Register a new account at `/register`, log in, and you're in.

---

## API routes

All endpoints prefixed with `/api`. Auth required unless noted.

### Auth
| Method | Route               | Description           |
|--------|---------------------|-----------------------|
| POST   | /auth/register      | Create account (public)|
| POST   | /auth/login         | Log in (public)       |
| GET    | /auth/me            | Get current user      |

### Tasks
| Method | Route                              | Description           |
|--------|------------------------------------|-----------------------|
| GET    | /tasks                             | List (filters: `status`, `priority`, `q`, `assigned_to`, `team_id`) |
| POST   | /tasks                             | Create                |
| GET    | /tasks/:id                         | Get one               |
| PATCH  | /tasks/:id                         | Update                |
| DELETE | /tasks/:id                         | Delete                |
| POST   | /tasks/reorder                     | Bulk update positions/status |
| GET    | /tasks/:id/comments                | List comments         |
| POST   | /tasks/:id/comments                | Add comment           |
| DELETE | /tasks/comments/:id                | Delete a comment      |
| GET    | /tasks/:id/attachments             | List attachments      |
| POST   | /tasks/:id/attachments             | Upload (multipart)    |
| DELETE | /tasks/attachments/:id             | Delete an attachment  |

### Teams
| Method | Route                              | Description           |
|--------|------------------------------------|-----------------------|
| GET    | /teams                             | List teams I belong to|
| POST   | /teams                             | Create team           |
| GET    | /teams/:id                         | Get team + members    |
| POST   | /teams/:id/members                 | Invite by email       |
| DELETE | /teams/:id/members/:userId         | Remove member         |

### Users
| Method | Route                | Description          |
|--------|----------------------|----------------------|
| GET    | /users               | List users (for assignees) |
| PATCH  | /users/me            | Update profile       |
| POST   | /users/me/password   | Change password      |

### Notifications
| Method | Route                       | Description        |
|--------|-----------------------------|--------------------|
| GET    | /notifications              | List recent        |
| POST   | /notifications/:id/read     | Mark one read      |
| POST   | /notifications/read-all     | Mark all read      |

### Analytics
| Method | Route                  | Description        |
|--------|------------------------|--------------------|
| GET    | /analytics/overview    | Stats + charts data|

---

## Deployment

### Option A: Single-Service Monorepo Deployment (Recommended)

This method deploys both the frontend and backend as a single service on Railway. The backend will compile the React app and serve it statically, eliminating CORS configuration issues and reducing Railway resource usage.

1. **Deploy to Railway**:
   - Push your code to your GitHub repository.
   - On Railway, click **New Project** → **Deploy from GitHub repo** and select your repository.
   - Do **not** set a Root Directory (leave it as the default `/`). Railway will detect the root `package.json`, install all dependencies, build the frontend, and start the backend.

2. **Provision MySQL Database**:
   - Click **New** → **Database** → **Add MySQL** in your Railway project dashboard.
   - Railway will provision a MySQL service and automatically inject the standard database environment variables (`MYSQLHOST`, `MYSQLPORT`, etc.) into your service.

3. **Configure Environment Variables**:
   - Go to your service's **Variables** tab and set the following:
     - `DB_DRIVER` = `mysql` (Forces the backend to use the MySQL driver instead of the SQLite fallback).
     - `JWT_SECRET` = `<a-secure-random-secret-key>`
     - `NODE_ENV` = `production`
     - The backend will automatically detect the database variables and build the tables on startup. No extra CORS or client URL configurations are needed!

### Option B: Split-Service Deployment (Separate Frontend & Backend)

If you prefer to deploy the backend on Railway and the frontend on Vercel or as a separate Railway service:

1. **Backend Service (Railway)**:
   - Create a service and set its **Root Directory** to `/backend`.
   - Provision a MySQL database in Railway.
   - Set env variables on the backend service:
     - `DB_DRIVER` = `mysql`
     - `JWT_SECRET` = `<a-secure-random-secret-key>`
     - `NODE_ENV` = `production`
     - `CLIENT_URL` = `<your-deployed-frontend-url>` (e.g. `https://your-frontend.vercel.app`)

2. **Frontend Service (Vercel or Railway)**:
   - Import the `frontend/` folder into Vercel or deploy it separately.
   - Set the framework preset to **Vite**.
   - Set the env variable: `VITE_API_URL` = `https://your-backend.up.railway.app/api`.

---

## Production notes

- Set a strong `JWT_SECRET` (at least 32 random chars).
- The API is rate-limited to 300 requests/minute per IP.
- File uploads are written to `backend/uploads/` and served at `/uploads/...`. For serverless/Render hosting, swap `multer` storage for S3 (the rest of the upload path stays the same).
- Passwords are bcrypt-hashed (cost 10).
- All write endpoints require a valid JWT in the `Authorization: Bearer <token>` header.

---

## Final run commands (quick reference)

```bash
# One-time
mysql -u root -p < backend/schema.sql

# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

App is now running at **http://localhost:5173**.

---

## Extending

- **AI features**: There's no AI integration yet. Easiest extension: add `POST /api/ai/suggest-tasks` that takes a goal, calls Claude or OpenAI, and returns structured tasks. The `tasks.create` endpoint already accepts the schema you'd produce.
- **Realtime**: Notifications poll every 30 seconds. Swap to Socket.IO if you want push.
- **Comments/attachments UI**: API endpoints exist; UI wiring on the task detail view is intentionally left minimal — drop it into `TaskForm` or build a dedicated drawer.

---

Built with attention to detail. Have fun shipping.
