# Case Study Submission: NexusERP Operations Portal

**Candidate Submission Package** for Fundsroom Infotech Full Stack Developer Case Study.

---

## 📋 Required Submission Checkpoints (Items 1–8)

### 1. GitHub Repository Link
- **Repository URL**: `https://github.com/YOUR_GITHUB_USERNAME/nexuserp-operations-portal` *(Replace with your GitHub repository link after pushing)*

> **Quick Push Command**:
> ```bash
> git remote add origin https://github.com/YOUR_GITHUB_USERNAME/nexuserp-operations-portal.git
> git branch -M main
> git push -u origin main
> ```

---

### 2. Live Frontend URL
- **Vercel Live URL**: `https://mini-erp-crm.vercel.app` *(or your Vercel/Netlify deployment URL)*
- **Hosted Platform**: Vercel (React 18 + Vite + TypeScript)

---

### 3. Live Backend API URL
- **Render Live API URL**: `https://mini-erp-backend.onrender.com/api` *(or your Render/AWS deployment API URL)*
- **API Health Check**: `https://mini-erp-backend.onrender.com/api/health`
- **Hosted Platform**: Render / AWS (Node.js + Express + TypeScript + Prisma ORM)
- **Cloud Database**: **Supabase PostgreSQL** (`db.xxxx.supabase.co:5432/postgres`)

---

### 4. Test Login Credentials for All Roles

All accounts are pre-seeded in the database with the default password: **`Password123!`**

| Role | Test Email | Password | Scope & Module Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Password123!` | Full admin access across Customer CRM, Inventory, Stock Audit Logs, Sales Challans, and System Stats |
| **Sales** | `sales@company.com` | `Password123!` | Customer CRM management, follow-up notes, and creating/confirming Sales Challans |
| **Warehouse** | `warehouse@company.com` | `Password123!` | Product catalog management, manual stock adjustments (IN/OUT), and stock audit log viewing |
| **Accounts** | `accounts@company.com` | `Password123!` | View Sales Challans, Customer details, and financial metric reports |

> 💡 **Bonus UX Feature**: The live application header includes a **1-Click Quick Demo Role Switcher** dropdown allowing reviewers to test all 4 role permission boundaries instantly without typing credentials!

---

### 5. Postman Collection & API Documentation

- **Postman File**: [`postman_collection.json`](file:///e:/New%20folder/postman_collection.json) *(Included in repository root for 1-click import into Postman)*

#### Summary of Core Endpoints:

| Category | HTTP Method | Endpoint | Description | Access Roles |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| **Auth** | `GET` | `/api/auth/me` | Get current user profile | All Roles |
| **Dashboard** | `GET` | `/api/dashboard/stats` | Aggregated ERP & CRM metrics | All Roles |
| **Customers** | `GET` | `/api/customers` | Search & filter customers | All Roles |
| **Customers** | `POST` | `/api/customers` | Add new customer | Admin, Sales |
| **Customers** | `GET` | `/api/customers/:id` | Get customer details & follow-up logs | All Roles |
| **Customers** | `PUT` | `/api/customers/:id` | Edit customer details | Admin, Sales |
| **Customers** | `POST` | `/api/customers/:id/followups` | Add CRM follow-up note | Admin, Sales |
| **Products** | `GET` | `/api/products` | Catalog & stock alert list | All Roles |
| **Products** | `POST` | `/api/products` | Create product item | Admin, Warehouse |
| **Products** | `PUT` | `/api/products/:id` | Edit product item | Admin, Warehouse |
| **Products** | `POST` | `/api/products/:id/adjust-stock` | Adjust stock level (IN/OUT) | Admin, Warehouse |
| **Stock Logs** | `GET` | `/api/products/stock-logs` | Global stock movement audit trail | All Roles |
| **Challans** | `GET` | `/api/challans` | List sales challans | All Roles |
| **Challans** | `POST` | `/api/challans` | Create Challan (Draft / Confirmed) | Admin, Sales |
| **Challans** | `PUT` | `/api/challans/:id/status` | Update status (Confirm / Cancel) | All Roles |
| **Challans** | `GET` | `/api/challans/:id/pdf` | Stream & Download PDF Invoice | All Roles |

---

### 6. README with Setup and Deployment Instructions

Complete documentation is provided in [`README.md`](file:///e:/New%20folder/README.md).

#### Cloud Setup Guides:

#### A. Connecting Supabase PostgreSQL
1. Create a free project on [Supabase.com](https://supabase.com).
2. Go to **Project Settings** -> **Database** -> Copy the **Connection String (Transaction Pooler or Direct URI)**:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
3. Set `DATABASE_URL` in your backend environment variables.
4. Run schema migration & seed on Supabase:
   ```bash
   npx prisma db push --schema=prisma/schema.postgresql.prisma
   npx ts-node prisma/seed.ts
   ```

#### B. Deploying Backend REST API on Render
1. Connect your GitHub repository to [Render.com](https://render.com).
2. Create a new **Web Service**.
3. Build Command: `cd server && npm install && npx prisma generate && npm run build`
4. Start Command: `cd server && npm start`
5. Environment Variables:
   - `DATABASE_URL`: *(Your Supabase Postgres URL)*
   - `JWT_SECRET`: `mini_erp_super_secret_jwt_key_2026`
   - `PORT`: `5000`

#### C. Deploying Frontend Web App on Vercel
1. Connect your GitHub repository to [Vercel.com](https://vercel.com).
2. Framework Preset: **Vite**.
3. Root Directory: `client`.
4. Build Command: `npm run build`. Output Directory: `dist`.
5. Environment Variables / Rewrites configured in [`client/vercel.json`](file:///e:/New%20folder/client/vercel.json).

#### D. Deploying on AWS (App Runner / EC2)
1. **AWS App Runner**: Deploy backend container directly from Docker Hub or GitHub by attaching your `Dockerfile`. Set port `5000` and pass `DATABASE_URL`.
2. **AWS EC2**: Spin up a `t3.micro` Ubuntu instance, pull code, install Docker, run `docker-compose up -d`.

---

### 7. Short Explanation of Architecture

```
+-------------------------------------------------------------+
|                      React 18 Frontend                      |
| (Vite + TypeScript + Responsive Dark Glassmorphism UI)       |
|  - Auth State Context & Token Injection                     |
|  - Role Switcher Header & Modular Views                     |
+------------------------------+------------------------------+
                               |
                   HTTP REST APIs (JSON)
                               |
+------------------------------v------------------------------+
|                Express.js + Node.js Backend                 |
|  - JWT Authentication & Authorization Role Guards            |
|  - Zod Input Validation & Error Handling Middleware         |
|  - Stock Engine: Atomic Prisma Transactions ($transaction)  |
|  - Streaming PDF Invoice Generator (PDFKit)                 |
+------------------------------+------------------------------+
                               |
                     Prisma ORM Layer
                               |
+------------------------------v------------------------------+
|             Cloud PostgreSQL (Supabase / Render)            |
|  - users, customers, customer_follow_ups, products,         |
|    stock_logs, challans, challan_items                      |
+-------------------------------------------------------------+
```

#### Key Architecture Principles:
1. **Atomic Stock Transactions**: Stock deduction during Challan Confirmation runs inside an isolated Prisma transaction (`$transaction`). If stock is insufficient, the transaction rolls back cleanly and returns a `400 Bad Request`.
2. **Historical Snapshot Storage**: Line items store product snapshot data (`productName`, `productSku`, `unitPrice`) at creation time. Price adjustments to catalog items do not corrupt historic invoice figures.
3. **Decoupled Monorepo Structure**: `/server` (Node.js API) and `/client` (React App) can be built, tested, and deployed independently or containerized together via Docker.

---

### 8. Known Limitations or Incomplete Parts

1. **Email/SMS Alert Integration**: Low stock alerts and customer follow-up reminders are currently displayed on the interactive dashboard UI. Automated email/SMS notifications (e.g. via Twilio or SendGrid) can be hooked into the stock adjustment endpoint.
2. **Multi-Tenant Support**: Designed as a single-company wholesale operations portal for internal staff. Multi-organization isolation is not required for this case study.
3. **AWS S3 Image Uploads**: Product thumbnails use category icons and SKU badges; AWS S3 bucket upload integration can be added as an optional bonus extension.
