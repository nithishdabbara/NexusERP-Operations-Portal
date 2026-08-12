import React from 'react';
import { LayoutDashboard, Users, Package, FileText, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'customers', label: 'Customer CRM', icon: Users, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'products', label: 'Inventory & Stock', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'challans', label: 'Sales Challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'stock-logs', label: 'Stock Audit Logs', icon: History, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge" style={{ fontSize: '14px', fontWeight: 800 }}>NEXUS</div>
        <div>
          <div className="brand-title">NexusERP</div>
          <div className="brand-subtitle">Wholesale & CRM</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          if (!user || !item.roles.includes(user.role)) return null;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
