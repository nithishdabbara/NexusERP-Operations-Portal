# NexusERP Operations Portal

A Mini ERP + CRM system built for a wholesale/distribution company to manage customers, stock inventory, and sales challans.

---

## 🔗 Project Links

- **GitHub Repository**: [https://github.com/nithishdabbara/NexusERP-Operations-Portal](https://github.com/nithishdabbara/NexusERP-Operations-Portal)
- **Live Frontend URL**: [https://nexus-erp-operations-portal.vercel.app](https://nexus-erp-operations-portal.vercel.app)
- **Live Backend API URL**: [https://nexuserp-backend-ja9d.onrender.com/api](https://nexuserp-backend-ja9d.onrender.com/api)
- **Live Database**: Supabase PostgreSQL (`ijnnazbvnufevfyappts`)

---

## 🔑 Test Login Credentials

Password for all roles: `Password123!`

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Password123!` | Full access across all modules |
| **Sales** | `sales@company.com` | `Password123!` | Customer CRM, Follow-ups, Create/Confirm Challans |
| **Warehouse** | `warehouse@company.com` | `Password123!` | Products, Stock Adjustments (IN/OUT), Audit Logs |
| **Accounts** | `accounts@company.com` | `Password123!` | View Challans, Financial Reports, Customer Lists |

---

## 🏗️ Architecture Explanation

```
[ React 18 Frontend (Vite) ] ──(REST API)──> [ Node.js + Express API ] ──(Prisma)──> [ Supabase PostgreSQL ]
```

- **Frontend**: React 18, TypeScript, Vite, responsive admin UI with role switching.
- **Backend**: Node.js, Express.js, TypeScript, REST APIs with Zod schema validation.
- **Database**: PostgreSQL on Supabase managed via Prisma ORM.
- **Authentication**: JWT token authentication with role-based middleware guards.
- **Business Logic**: Stock deduction on Challan confirmation runs inside atomic database transactions (`$transaction`) to prevent negative inventory. Line items preserve product price snapshots at creation time. PDF invoice streaming via `pdfkit`.

---

## 🚀 Setup & Local Running

### Environment Variables (`server/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://postgres.ijnnazbvnufevfyappts:P5Vqn0ALIGxUcJsG@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="mini_erp_super_secret_jwt_key_2026"
```

### Local Execution

```bash
# 1. Backend Server
cd server
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev

# 2. Frontend App (separate terminal)
cd client
npm install
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

## 🐳 Docker Setup

Run the full stack (Frontend, Backend & PostgreSQL) with a single command:

```bash
docker-compose up --build
```

- **Frontend Container (Nginx)**: `http://localhost:3000`
- **Backend Container (Node.js API)**: `http://localhost:5000`
- **PostgreSQL Container**: `localhost:5432`

---

## ☁️ Vercel & Render Deployment Settings

### Vercel (Frontend Deployment)
- **Root Directory**: `client` *(or leave blank if using root [`vercel.json`](file:///e:/New%20folder/vercel.json))*
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Render (Backend Deployment)
- **Root Directory**: `server`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `DATABASE_URL` = `postgresql://postgres.ijnnazbvnufevfyappts:P5Vqn0ALIGxUcJsG@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`
  - `JWT_SECRET` = `mini_erp_super_secret_jwt_key_2026`
  - `PORT` = `5000`

---

## 📖 Core REST API Endpoints

- `POST /api/auth/login` — Login & issue JWT token
- `GET /api/customers` — Get customers (supports search & type/status filter)
- `POST /api/customers` — Add customer
- `POST /api/customers/:id/followups` — Add CRM follow-up note
- `GET /api/products` — Get product catalog & low stock alerts
- `POST /api/products/:id/adjust-stock` — Manual stock adjustment (IN/OUT)
- `GET /api/products/stock-logs` — Global stock movement audit history
- `GET /api/challans` — List sales challans
- `POST /api/challans` — Create sales challan (Draft or Confirmed with atomic stock deduction)
- `GET /api/challans/:id/pdf` — Stream/download PDF Invoice

---

## 🎯 Known Limitations & Assumptions

1. **Email Alerts**: Low stock alerts are highlighted in real-time on the UI dashboard; email/SMS alerts can be integrated via webhooks.
2. **Draft Challans**: Draft sales challans reserve no inventory until confirmed.
3. **Single Company Scope**: Built specifically as an internal operations portal for a single distribution company.
