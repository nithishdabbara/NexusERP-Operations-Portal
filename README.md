# Mini ERP + CRM Operations Portal

Full-stack Mini ERP and CRM Operations system built for wholesale and distribution companies. Deals with customers, inventory tracking, stock movement audit logs, and multi-item sales challans with atomic stock reduction and PDF invoice exports.

---

## 🌟 Key Features & Architectural Highlights

1. **Role-Based Access Control (RBAC)**:
   - **`ADMIN`**: Full permissions across all modules.
   - **`SALES`**: Customer CRM creation/updates, follow-ups, and sales challan generation.
   - **`WAREHOUSE`**: Catalog management, manual stock adjustments (IN/OUT), and stock audit logs.
   - **`ACCOUNTS`**: Read-only view of sales challans, customer details, and financial reports.

2. **Atomic Stock Transaction Engine**:
   - Challan confirmation checks stock levels in real time.
   - If stock is insufficient, returns a clear `HTTP 400 Bad Request` specifying deficient products.
   - Reduces stock atomically inside a Prisma transaction (`$transaction`) and writes `OUT` audit logs to `StockLog`.

3. **Product Price & Details Snapshot**:
   - Line items preserve product snapshot data (`productName`, `productSku`, `unitPrice`) at creation time. Historical sales records remain intact even if product prices or titles change later.

4. **PDF Invoice Export**:
   - Integrated streaming PDF generator (`pdfkit`) formats professional sales challans/invoices for printing and download.

5. **Dual Database Engine Support**:
   - Local setup uses zero-config **SQLite** (`dev.db`).
   - Easily scalable to **PostgreSQL** in production or via `docker-compose`.

---

## 🚀 Test Login Credentials

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Password123!` | Full control over all ERP modules |
| **Sales** | `sales@company.com` | `Password123!` | Customer CRM, Follow-ups, Create Sales Challans |
| **Warehouse** | `warehouse@company.com` | `Password123!` | Manage Products, Adjust Stock Levels, View Stock Audit Logs |
| **Accounts** | `accounts@company.com` | `Password123!` | View Challans, Customer CRM, Financial Dashboards |

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18+) & npm

### 1. Backend Setup (`/server`)

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Initialize SQLite database and seed test data
npx prisma db push
npx ts-node prisma/seed.ts

# Run development server
npm run dev
```
> Server runs on `http://localhost:5000`

### 2. Frontend Setup (`/client`)

```bash
# Open new terminal and navigate to client
cd client

# Install dependencies
npm install

# Run frontend Vite dev server
npm run dev
```
> Frontend runs on `http://localhost:3000` (automatically proxies API requests to port 5000)

---

## 🐳 Docker Deployment Setup

Run the entire application stack (Frontend + Backend + PostgreSQL) with a single command:

```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **PostgreSQL DB**: `localhost:5432`

---

## 📖 API Documentation & Postman Collection

Import `postman_collection.json` directly into Postman to test all endpoints.

### Authentication
- `POST /api/auth/login` - Authenticate user & get JWT token
- `GET /api/auth/me` - Get current authenticated user profile

### Customer CRM
- `GET /api/customers` - List customers (Supports pagination, search & type/status filtering)
- `POST /api/customers` - Create customer (Requires `ADMIN` or `SALES` role)
- `GET /api/customers/:id` - Get customer details with follow-up history
- `PUT /api/customers/:id` - Update customer record
- `POST /api/customers/:id/followups` - Add follow-up note

### Products & Inventory
- `GET /api/products` - List products (Supports `lowStock=true` filter)
- `POST /api/products` - Create product catalog item
- `PUT /api/products/:id` - Edit product details
- `POST /api/products/:id/adjust-stock` - Adjust stock level (`IN` / `OUT` with reason)
- `GET /api/products/stock-logs` - View global stock movement audit log history

### Sales Challans
- `GET /api/challans` - List sales challans
- `POST /api/challans` - Create sales challan (`DRAFT` or `CONFIRMED`)
- `GET /api/challans/:id` - Get challan details with snapshot line items
- `PUT /api/challans/:id/status` - Update status (`CONFIRMED` / `CANCELLED`)
- `GET /api/challans/:id/pdf` - Stream PDF Invoice file

---

## 🏗️ Technical Architecture Diagram

```
+-------------------------------------------------------------+
|                     React 18 + Vite UI                      |
| (Dashboard, CRM, Product Inventory, Sales Challans, Auth)   |
+------------------------------+------------------------------+
                               |
                        REST APIs (JSON)
                               |
+------------------------------v------------------------------+
|                Express.js + TypeScript Server               |
|   - JWT Authentication & RBAC Role Guards                   |
|   - Zod Schema Validation & Error Handling Middleware       |
|   - Stock Movement & Atomic Prisma Transactions             |
|   - PDFKit Invoice Streaming                                |
+------------------------------+------------------------------+
                               |
                     Prisma ORM Layer
                               |
+------------------------------v------------------------------+
|            Database (SQLite / PostgreSQL)                  |
| (users, customers, products, stock_logs, challans, items)   |
+-------------------------------------------------------------+
```

---

## 🎯 Assumptions & Known Limitations

1. **Local DB**: Defaults to SQLite (`dev.db`) for effortless 0-config evaluation, but can be switched to PostgreSQL by updating `DATABASE_URL` in `.env`.
2. **Currency**: Pricing and invoice totals are calculated in INR (₹).
3. **Draft Challans**: Draft challans reserve no inventory until manually confirmed by Sales or Admin.
