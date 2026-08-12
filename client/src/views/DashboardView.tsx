import React, { useEffect, useState } from 'react';
import { Users, Package, FileText, AlertTriangle, IndianRupee, ArrowRight, Plus } from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', color: '#9ca3af' }}>Loading dashboard metrics...</div>;
  if (error) return <div style={{ padding: '40px', color: '#ef4444' }}>Error: {error}</div>;
  if (!data) return null;

  const { stats, lowStockProducts, recentChallans } = data;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-subtitle">Real-time overview of Wholesale ERP & CRM metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('customers')}>
            <Plus size={14} /> New Customer
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('challans')}>
            <Plus size={14} /> New Sales Challan
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            <div className="stat-label">Confirmed Revenue ({stats.confirmedChallansCount} Challans)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">{stats.activeCustomersCount} Active Customers ({stats.leadsCount} Leads)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <Package size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Catalog Products Tracked</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: stats.lowStockCount > 0 ? '#ef4444' : '#f59e0b' }}>
              {stats.lowStockCount}
            </div>
            <div className="stat-label">Low Stock Inventory Alerts</div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      {lowStockProducts.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle color="#ef4444" size={20} />
              <h2 className="card-title" style={{ color: '#ef4444' }}>Low Stock Inventory Warnings</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('products')}>
              Manage Stock <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Current Stock</th>
                  <th>Alert Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{p.sku}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>{p.currentStock} Units</td>
                    <td>{p.minAlertQty} Units</td>
                    <td>
                      <span className="badge badge-low-stock">RESTOCK NEEDED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Sales Challans */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Sales Challans</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('challans')}>
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Customer / Business</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentChallans.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.challanNumber}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.customer?.name}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{c.customer?.businessName}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{c.totalAmount.toLocaleString('en-IN')}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
