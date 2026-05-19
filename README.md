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

### Backend → Railway (Simplified & Automated)

1. **Create a Railway Project**:
   - Push your code to your GitHub repository.
   - On Railway, click **New Project** → **Deploy from GitHub repo** and select your repository.
   - Set the **Root Directory** to `/backend` in the service settings.

2. **Provision MySQL Database**:
   - In your Railway project dashboard, click **New** → **Database** → **Add MySQL**.
   - Railway will provision a MySQL service and automatically inject the standard database environment variables (`MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`) into your project.
   - Since the database configuration has been updated, you **do not need** to manually map or copy these database credentials to `DB_HOST`, `DB_PORT`, etc. They will be detected automatically.

3. **Configure Environment Variables**:
   - Go to your backend service's **Variables** tab and set the following:
     - `DB_DRIVER` = `mysql` (Forces the backend to use the MySQL driver instead of the SQLite fallback).
     - `JWT_SECRET` = `<a-secure-random-secret-key>`
     - `CLIENT_URL` = `<your-deployed-frontend-url>` (e.g. `https://your-frontend.vercel.app` or Railway domain).
     - `NODE_ENV` = `production`

4. **Automatic Schema Bootstrapping**:
   - The backend service automatically checks if the database tables exist on boot. If not, it parses and executes `schema.sql` to initialize the database tables automatically. No manual shell commands or database imports are needed!

### Frontend → Vercel / Railway

1. **Import Project**:
   - Import the `frontend/` folder into Vercel or deploy it as a separate service on Railway.
2. **Framework Preset**:
   - Select **Vite** as the framework preset.
3. **Environment Variables**:
   - Set `VITE_API_URL` to your backend's API endpoint (e.g. `https://your-backend.up.railway.app/api`).
4. **CORS Compatibility**:
   - Ensure `CLIENT_URL` on the backend matches the frontend's deployment URL so CORS is allowed.

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
