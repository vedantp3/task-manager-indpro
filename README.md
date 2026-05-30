# 🗂️ TaskFlow — Full-Stack Task Manager

A clean, production-grade task manager with JWT authentication and a three-stage kanban pipeline (**Todo → In Progress → Done**). Built as a full-stack application with a React frontend and a Node.js/Express REST API backed by PostgreSQL.

---

## 🌐 Live URLs

| Service   | URL |
|-----------|-----|
| Frontend  | *https://task-manager-indpro.vercel.app/* |
| Backend   | *https://task-manager-indpro.onrender.com* |

---

## ✨ Features

- **JWT Authentication** — Register and login with secure bcrypt-hashed passwords
- **Three-stage kanban board** — Todo, In Progress, Done columns
- **Full CRUD** — Create, read, update, delete tasks; change stages via edit modal
- **User isolation** — Each user's tasks are strictly private
- **Responsive** — Three-column grid on desktop, single-column stacked on mobile (≤640px)
- **Optimistic UX** — Loading skeletons, submit spinners, inline delete confirmation, global error toast

---

## 🖼️ Screenshots

> *(Add screenshots after deployment — `docs/screenshot-dashboard.png`, `docs/screenshot-login.png`)*

---

## 🛠️ Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React 19 + Vite, Tailwind CSS v4, React Router v6, Axios, Zustand |
| Backend    | Node.js, Express, jsonwebtoken, bcryptjs, pg (node-postgres), Helmet |
| Database   | PostgreSQL on Supabase (free tier) |
| Deploy FE  | Vercel |
| Deploy BE  | Render |

---

## 🗄️ Database Migration

Run the following SQL in the **Supabase SQL Editor** (Dashboard → SQL Editor → New Query):

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(120)  NOT NULL,
  description TEXT,
  stage       VARCHAR(20)   NOT NULL DEFAULT 'todo'
                            CHECK (stage IN ('todo', 'in_progress', 'done')),
  created_at  TIMESTAMPTZ   DEFAULT now(),
  updated_at  TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

The full migration file is also available at [`database/migration.sql`](./database/migration.sql).

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js ≥ 18
- A Supabase project with the migration run (see above)

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/taskflow.git
cd taskflow
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env   # fill in your values (see table below)
npm install
npm run dev            # starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env   # fill in your values
npm install
npm run dev            # starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable        | Description |
|-----------------|-------------|
| `DATABASE_URL`  | Supabase PostgreSQL connection URI (Settings → Database → Connection String → URI) |
| `JWT_SECRET`    | Random secret ≥ 32 chars for signing JWTs. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN`| Token lifetime, e.g. `7d` |
| `PORT`          | Port the server listens on, e.g. `5000` |
| `CLIENT_ORIGIN` | Allowed CORS origin — your Vercel URL in production, `http://localhost:5173` locally |

### Frontend (`frontend/.env`)

| Variable       | Description |
|----------------|-------------|
| `VITE_API_URL` | Backend base URL — your Render URL in production, `http://localhost:5000` locally |

---

## ☁️ Deployment

### 1. Database — Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Run the migration SQL in the SQL Editor
3. Copy the connection string: **Settings → Database → Connection String (URI)**

### 2. Backend — Render
1. Push this repo to GitHub
2. Create a new **Web Service** at [render.com](https://render.com), connect the repo
3. Set **Root Directory** to `backend`
4. Build command: `npm install`  |  Start command: `node server.js`
5. Add all backend environment variables in **Render → Environment**
6. Deploy — note your `https://your-app.onrender.com` URL

### 3. Frontend — Vercel
1. Import the repo at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`, Framework to **Vite**
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy — note your `https://your-app.vercel.app` URL
5. **Update** `CLIENT_ORIGIN` in Render to match the Vercel URL and redeploy

---

## 📐 API Reference

### Auth — `/api/auth`

| Method | Path        | Auth | Description |
|--------|-------------|------|-------------|
| POST   | `/register` | ❌   | Register new user, returns JWT |
| POST   | `/login`    | ❌   | Login, returns JWT |
| GET    | `/me`       | ✅   | Validate token, return current user |

### Tasks — `/api/tasks` *(all protected)*

| Method | Path   | Description |
|--------|--------|-------------|
| GET    | `/`    | Get all tasks for current user |
| POST   | `/`    | Create a task |
| PUT    | `/:id` | Update a task (partial) |
| DELETE | `/:id` | Delete a task |

All responses follow `{ data, error, message }` envelope.

---

## 💡 Assumptions

- No email verification is implemented — users can register with any email format
- Tokens expire after 7 days; no refresh token rotation (single JWT per spec)
- All tasks belong to a single user — no sharing or collaboration
- All user tasks are fetched in one call — no pagination
- Password reset is out of scope

## ⚖️ Tradeoffs

- **Zustand over Redux** — The project scope (two stores, simple state) doesn't justify Redux's boilerplate. Zustand is lighter and simpler.
- **Monorepo** — Keeping frontend and backend in one repo simplifies version control and makes cross-referencing code easier, at the cost of slightly more complex deployment configuration.
- **Supabase free tier** — Project will pause after 1 week of inactivity on the free plan; suitable for demonstration purposes.
- **No ORM** — Raw `pg` queries give full control and avoid abstraction overhead for this project size.

## 🏗️ Technical Decisions

- **React + Vite** — Fastest dev experience for React; native ESM, instant HMR
- **Tailwind CSS v4** — Utility-first, zero-config with the new Vite plugin
- **Supabase** — Managed PostgreSQL with a generous free tier and a clean dashboard for running migrations
- **Render** — Simple Node.js deployment from GitHub, free tier suitable for demo
- **Vercel** — Zero-config Vite deployment, automatic preview URLs

## 🤖 AI Tool Disclosure

This project was built with assistance from **Antigravity (Google DeepMind)**, an AI coding assistant. The backend is fully implemented as required: real PostgreSQL queries via `pg`, bcrypt password hashing, JWT middleware, ownership verification on every task mutation, and proper CORS/Helmet security configuration. No mock data or in-memory storage is used — all data is persisted in PostgreSQL.
