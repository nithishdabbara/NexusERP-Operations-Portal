# ⚡ Supabase PostgreSQL Database Setup Guide

Complete step-by-step guide to connect and deploy your **Mini ERP + CRM Database** to **Supabase PostgreSQL**.

---

## Step 1: Create Free Supabase Database
1. Go to [Supabase.com](https://supabase.com) and click **Start your project** (Sign up / Login with GitHub).
2. Click **New Project** and choose a project name (e.g. `mini-erp-db`).
3. Set a strong **Database Password** (save this password!).
4. Choose region (e.g., *AWS Mumbai / Singapore / US East*).
5. Click **Create new project**. Supabase will provision your PostgreSQL instance in ~60 seconds.

---

## Step 2: Copy Connection String
1. In your Supabase Dashboard, go to **Project Settings** -> **Database**.
2. Scroll down to **Connection String** -> Select **URI** (or Transaction Pooler).
3. Copy the string which looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

---

## Step 3: Update `.env` File
Open [`server/.env`](file:///e:/New%20folder/server/.env) and paste your connection string:

```env
PORT=5000
DATABASE_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
JWT_SECRET="mini_erp_super_secret_jwt_key_2026"
```

---

## Step 4: Run 1-Command Database Push & Seeding
From the `server` directory, run:

```bash
# Push database schema & tables to Supabase PostgreSQL
npx prisma db push

# Seed test accounts, customers, products, stock logs & challans
npx ts-node prisma/seed.ts
```

---

## 🎯 Verification on Supabase Dashboard
1. Go to **Table Editor** on Supabase Dashboard.
2. You will see all 7 tables created and seeded automatically:
   - `User` (4 role test accounts)
   - `Customer` (Retail, Wholesale, Distributor)
   - `CustomerFollowUp` (CRM timeline logs)
   - `Product` (Catalog items & stock levels)
   - `StockLog` (IN/OUT audit trails)
   - `Challan` (Sales orders)
   - `ChallanItem` (Itemized price snapshots)
