# NexusERP Operations Portal

Full-stack Mini ERP and CRM Operations Portal built for wholesale and distribution companies. Deals with customers, inventory tracking, stock movement audit logs, and multi-item sales challans with atomic stock reduction, price snapshots, and streaming PDF invoice generation.

---

## 🔗 Live Submission Links & Status

| Resource | Hosted Platform | URL / Connection |
| :--- | :--- | :--- |
| **GitHub Repository** | GitHub | [nithishdabbara/NexusERP-Operations-Portal](https://github.com/nithishdabbara/NexusERP-Operations-Portal) |
| **Live Frontend App** | Vercel | [https://nexuserp-operations-portal.vercel.app](https://nexuserp-operations-portal.vercel.app) |
| **Live Backend REST API** | Render | [https://nexuserp-backend.onrender.com/api](https://nexuserp-backend.onrender.com/api) |
| **API Health Check** | Render | [https://nexuserp-backend.onrender.com/api/health](https://nexuserp-backend.onrender.com/api/health) |
| **Cloud Database** | Supabase PostgreSQL | `postgresql://postgres.ijnnazbvnufevfyappts:***@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres` |

---

## 🔑 Pre-Seeded Test Login Credentials

Password for all accounts: **`Password123!`**

| Role | Email | Password | Scope & Module Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Password123!` | Full control over all ERP & CRM modules |
| **Sales** | `sales@company.com` | `Password123!` | Customer CRM, Follow-ups, Create/Confirm Sales Challans |
| **Warehouse** | `warehouse@company.com` | `Password123!` | Manage Products, Stock Level Adjustments (IN/OUT), Audit Logs |
| **Accounts** | `accounts@company.com` | `Password123!` | View Challans, Customer Lists, Financial Dashboards |

> 💡 **Header Quick Demo Role Switcher**: The live application header includes a **1-Click Role Switcher** dropdown allowing reviewers to switch between Admin, Sales, Warehouse, and Accounts roles instantly to test RBAC permissions.

---

## 🌟 Core Modules & Architecture Highlights

1. **Role-Based Access Control (RBAC)**:
   - Secured via JWT tokens (`Bearer <token>`) and role guards (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).

2. **Atomic Stock Transaction Engine**:
   - When a Sales Challan is confirmed, stock levels are checked in real-time.
   - If stock is insufficient, returns a clear `HTTP 400 Bad Request` specifying deficient products.
   - Deducts stock atomically inside a Prisma transaction (`$transaction`) and writes `OUT` audit logs to `StockLog`.

3. **Product Price & Details Snapshot**:
   - Line items preserve product snapshot data (`productName`, `productSku`, `unitPrice`) at creation time. Historical sales records remain intact even if product prices or titles change later.

4. **Streaming PDF Invoice Export**:
   - Integrated streaming PDF generator (`pdfkit`) formats professional sales challans/invoices for instant download and printing.

---

## 🏗️ Technical Architecture Diagram

```
+-------------------------------------------------------------+
|               React 18 + Vite UI (Vercel)                   |
| (Dashboard, CRM, Product Inventory, Sales Challans, Auth)   |
+------------------------------+------------------------------+
                               |
                        REST APIs (JSON)
                               |
+------------------------------v------------------------------+
|            Express.js + Node.js API (Render)                |
|   - JWT Authentication & RBAC Role Guards                   |
|   - Zod Schema Validation & Error Handling Middleware       |
|   - Stock Engine: Atomic Prisma Transactions ($transaction)  |
|   - PDFKit Invoice Streaming                                |
+------------------------------+------------------------------+
                               |
                     Prisma ORM Layer
                               |
+------------------------------v------------------------------+
|             Cloud PostgreSQL (Supabase)                    |
| (users, customers, products, stock_logs, challans, items)   |
+-------------------------------------------------------------+
```

---

## 💻 Setup Instructions

### 1. Local Quick Run (Zero-Config)

```bash
# Clone repository
git clone https://github.com/nithishdabbara/NexusERP-Operations-Portal.git
cd NexusERP-Operations-Portal

# 1. Start Backend API (/server)
cd server
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev

# 2. Start Frontend App (/client in new terminal)
cd ../client
npm install
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend Server**: `http://localhost:5000`

---

### 2. Docker Deployment

```bash
docker-compose up --build
```
- Runs multi-container setup: Frontend (Port 3000), Backend (Port 5000), and PostgreSQL (Port 5432).

---

## 📖 API Documentation & Postman Collection

Import [`postman_collection.json`](file:///e:/New%20folder/postman_collection.json) directly into Postman to test all REST endpoints.

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
