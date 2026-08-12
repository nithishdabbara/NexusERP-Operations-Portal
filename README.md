# NexusERP Operations Portal

A Mini ERP + CRM Operations Portal built for wholesale and distribution companies to manage customers, stock inventory, and sales challans.

---

## 🔗 Live Project Links

- **GitHub Repository**: [https://github.com/nithishdabbara/NexusERP-Operations-Portal](https://github.com/nithishdabbara/NexusERP-Operations-Portal)
- **Live Frontend URL**: [https://nexuserp-operations-portal.vercel.app](https://nexuserp-operations-portal.vercel.app)
- **Live Backend API URL**: [https://nexuserp-backend.onrender.com/api](https://nexuserp-backend.onrender.com/api)
- **Postman API Collection**: [`postman_collection.json`](file:///e:/New%20folder/postman_collection.json) *(Root repository directory)*
- **🎥 Screen Recording Walkthrough**: [Watch Full System Walkthrough Video](YOUR_SCREEN_RECORDING_LINK_HERE)

---

## 🔑 Test Login Credentials

Password for all roles: `Password123!`

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Password123!` | Full access across all ERP & CRM modules |
| **Sales** | `sales@company.com` | `Password123!` | Customer CRM, Follow-ups, Create/Confirm Sales Challans |
| **Warehouse** | `warehouse@company.com` | `Password123!` | Products, Stock Adjustments (IN/OUT), Audit Logs |
| **Accounts** | `accounts@company.com` | `Password123!` | View Challans, Financial Reports, Customer Lists |

---

## 💡 Architecture Decisions

- **Prisma ORM over Sequelize**: Type-safe auto-generated client and declarative schema migrations significantly reduce boilerplate and prevent runtime query errors.
- **Supabase PostgreSQL**: Managed serverless PostgreSQL offering zero-maintenance cloud database hosting with built-in connection pooling.
- **Atomic Database Transactions**: Sales Challan confirmation executes inside a Prisma `$transaction` lock. Stock levels are verified and deducted atomically alongside `OUT` audit log entries — either all operations succeed or all roll back safely.
- **Historical Snapshot Preservation**: Line items store product snapshot data (`productName`, `productSku`, `unitPrice`) at creation time, preserving historical sales figures even if catalog prices or titles change later.

---

## 🚀 Environment & Setup

### Environment Configuration (`server/.env`)

Copy `server/.env.example` to `server/.env` and update your variables:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your_jwt_secret_here"
```

### Local Execution

```bash
# 1. Start Backend API
cd server
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev

# 2. Start Frontend App (in separate terminal)
cd client
npm install
npm run dev
```

- Frontend App: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 🐳 Docker Setup

Run the full stack with a single command:

```bash
docker-compose up --build
```

- **Frontend Container (Nginx)**: `http://localhost:3000`
- **Backend Container (Node.js API)**: `http://localhost:5000`
- **PostgreSQL Container**: `localhost:5432`

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

1. **Email Alerts**: Low stock alerts are highlighted in real-time on the UI dashboard; automated email/SMS reminders can be hooked into stock endpoints.
2. **Draft Challans**: Draft sales orders reserve no inventory until confirmed.
3. **Single Company Scope**: Internal operations portal tailored for wholesale distribution operations.
