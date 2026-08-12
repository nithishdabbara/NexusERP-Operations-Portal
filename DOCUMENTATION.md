# NexusERP Operations Portal — Technical Documentation

**System Title**: NexusERP Operations Portal  
**Target Organization**: Wholesale & Distribution Operations  
**Architecture**: Full-Stack Decoupled Client-Server (React 18 + Node.js REST API + PostgreSQL)

---

## 🔗 Live Application & API URLs

- **GitHub Repository**: [https://github.com/nithishdabbara/NexusERP-Operations-Portal](https://github.com/nithishdabbara/NexusERP-Operations-Portal)
- **Live Frontend App**: [https://nexus-erp-operations-portal.vercel.app](https://nexus-erp-operations-portal.vercel.app)
- **Live Backend REST API**: [https://nexuserp-backend-ja9d.onrender.com/api](https://nexuserp-backend-ja9d.onrender.com/api)
- **API Health Endpoint**: [https://nexuserp-backend-ja9d.onrender.com/api/health](https://nexuserp-backend-ja9d.onrender.com/api/health)
- **Cloud Database**: Supabase PostgreSQL (`ijnnazbvnufevfyappts`)
- **Docker Hub Images**: `nithish1875/nexuserp-backend:latest` & `nithish1875/nexuserp-frontend:latest`

---

## 🔑 Pre-Seeded Test Credentials

All accounts use password: **`Password123!`**

| Role | Email | Password | Access Scope & Module Authorization |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Password123!` | Complete system administrative oversight across all modules |
| **Sales** | `sales@company.com` | `Password123!` | Customer CRM, Follow-up Notes, Create & Confirm Sales Challans |
| **Warehouse** | `warehouse@company.com` | `Password123!` | Product Catalog, Stock Adjustments (IN/OUT), Movement Audit Logs |
| **Accounts** | `accounts@company.com` | `Password123!` | Read-only access to Challans, Invoices, Financial Metrics |

---

## 🏗️ System Architecture & Technology Stack

```
+-------------------------------------------------------------+
|              React 18 + Vite Frontend (Vercel)              |
|   - Responsive Glassmorphic Dark Dashboard UI               |
|   - Header 1-Click Role Switcher Dropdown                   |
+------------------------------+------------------------------+
                               |
                   JSON REST API (HTTPS CORS)
                               |
+------------------------------v------------------------------+
|             Express.js + Node.js Backend (Render)           |
|   - JWT Token Authentication & RBAC Guards                  |
|   - Zod Request Schema Validation & Global Error Handler    |
|   - Atomic Prisma Transaction Engine ($transaction)         |
|   - PDFKit Streaming Invoice PDF Generation                 |
+------------------------------+------------------------------+
                               |
                   Prisma ORM (PostgreSQL)
                               |
+------------------------------v------------------------------+
|             Cloud PostgreSQL Database (Supabase)           |
|  (User, Customer, CustomerFollowUp, Product, StockLog...)   |
+-------------------------------------------------------------+
```

---

## 📑 Core System Modules

### 1. Authentication & Role-Based Access Control (RBAC)
- **Stateless JWT Tokens**: Users authenticate via `POST /api/auth/login`. Successful authentication returns a 7-day signed JWT token stored in `localStorage`.
- **Role Guards**: Backend endpoints enforce access control via `authenticateToken` and `authorizeRoles('ADMIN', 'SALES', ...)` middleware.
- **Role Switcher UI**: The frontend header features an instant role switcher to demonstrate RBAC permissions in a single click.

### 2. Customer CRM Module
- **Comprehensive Fields**: Stores `name`, `mobile`, `email`, `businessName`, `gstNumber`, `type` (*RETAIL*, *WHOLESALE*, *DISTRIBUTOR*), `address`, `status` (*LEAD*, *ACTIVE*, *INACTIVE*), `followUpDate`, and `notes`.
- **CRM Timeline History**: Sales representatives can append timestamped follow-up notes (`CustomerFollowUp`) to track customer interaction progress over time.

### 3. Product & Stock Inventory Management
- **Catalog Management**: Tracks SKU, product name, category, unit price, current stock level, minimum stock alert threshold, and warehouse location.
- **Stock Alert Engine**: Real-time visual alerts on dashboard for items at or below minimum stock thresholds.
- **Stock Movement Audit Logs**: Every manual stock adjustment (*IN* or *OUT*) creates an immutable audit record in `StockLog` capturing quantity, reason, actor, and timestamp.

### 4. Sales Challan & Atomic Stock Engine
- **Multi-Item Sales Challans**: Sales users select customers and add multiple line items with specific quantities.
- **Auto-Generated Challan Numbers**: Formatted as `CHAL-YYYYMMDD-XXXX`.
- **Stock Reduction & Transaction Safety**: When a challan status transitions to `CONFIRMED`, backend executes a Prisma `$transaction`:
  1. Verifies current stock levels for all line items.
  2. Rejects transaction with HTTP 400 if stock is insufficient.
  3. Atomically decrements product stock and records `OUT` stock logs.
- **Product Details Snapshot**: Line items store historical snapshots of `productName`, `productSku`, and `unitPrice` so past invoices remain accurate even if product catalog prices change.

### 5. Invoice PDF Generation
- On-the-fly PDF invoice generation using `pdfkit`. Generates professional, printable invoices streamed directly to the user browser.

---

## 📖 REST API Reference

| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate user & issue JWT token | Public |
| `/api/auth/me` | `GET` | Retrieve current user profile | All Authenticated |
| `/api/dashboard/stats` | `GET` | Aggregated ERP & CRM metrics | All Authenticated |
| `/api/customers` | `GET` | List customers with search/filter/pagination | All Authenticated |
| `/api/customers` | `POST` | Create new customer record | Admin, Sales |
| `/api/customers/:id` | `GET` | Customer details & follow-up log timeline | All Authenticated |
| `/api/customers/:id` | `PUT` | Update customer details | Admin, Sales |
| `/api/customers/:id/followups` | `POST` | Add timestamped follow-up note | Admin, Sales |
| `/api/products` | `GET` | Product catalog & low stock alert list | All Authenticated |
| `/api/products` | `POST` | Add product to inventory | Admin, Warehouse |
| `/api/products/:id` | `PUT` | Update product information | Admin, Warehouse |
| `/api/products/:id/adjust-stock` | `POST` | Manual stock adjustment (IN/OUT) | Admin, Warehouse |
| `/api/products/stock-logs` | `GET` | Global stock movement audit history | All Authenticated |
| `/api/challans` | `GET` | List sales challans with search & filters | All Authenticated |
| `/api/challans` | `POST` | Create Challan (Draft or Confirmed) | Admin, Sales |
| `/api/challans/:id/status` | `PUT` | Update status (Confirm/Cancel with stock adjustment) | Admin, Sales |
| `/api/challans/:id/pdf` | `GET` | Stream/download printable PDF Invoice | All Authenticated |

---

## 💻 Environment Variables

### Backend (`/server/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://postgres.ijnnazbvnufevfyappts:P5Vqn0ALIGxUcJsG@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="mini_erp_super_secret_jwt_key_2026"
```

### Frontend (`/client/.env`)
```env
VITE_API_BASE_URL="https://nexuserp-backend-ja9d.onrender.com/api"
```

---

## 🎯 Assumptions & Known Limitations

1. **Cold Start Timing**: Render free tier web services pause after 15 minutes of inactivity; the initial request may take ~30–45 seconds to spin up the container.
2. **Draft Inventory Reservation**: Draft sales challans do not lock stock; inventory is decremented atomically upon confirmation.
3. **Single Company Context**: Designed specifically as an internal operations portal for a single distribution company.
