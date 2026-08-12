export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  note: string;
  createdAt: string;
  createdBy?: { name: string; role: string };
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  type: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { name: string; role: string };
  followUps?: CustomerFollowUp[];
  _count?: { followUps: number; challans: number };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minAlertQty: number;
  location: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { name: string; role: string };
}

export type StockLogType = 'IN' | 'OUT';

export interface StockLog {
  id: string;
  productId: string;
  qtyChanged: number;
  type: StockLogType;
  reason: string;
  createdAt: string;
  product?: { id: string; name: string; sku: string; location: string };
  createdBy?: { name: string; role: string };
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id?: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalAmount: number;
  totalQuantity: number;
  status: ChallanStatus;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    businessName: string;
    mobile: string;
    address: string;
    email?: string;
    gstNumber?: string | null;
  };
  createdBy?: { name: string; role: string; email?: string };
  items: ChallanItem[];
}

export interface DashboardStats {
  stats: {
    totalCustomers: number;
    leadsCount: number;
    activeCustomersCount: number;
    totalProducts: number;
    lowStockCount: number;
    totalChallans: number;
    confirmedChallansCount: number;
    totalRevenue: number;
  };
  lowStockProducts: Product[];
  recentChallans: Challan[];
  recentStockLogs: StockLog[];
}
