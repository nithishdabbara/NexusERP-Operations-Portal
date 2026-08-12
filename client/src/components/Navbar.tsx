import React from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchRoleDemo } = useAuth();

  return (
    <header className="top-navbar">
      <div className="role-demo-banner">
        <ShieldCheck size={16} color="#6366f1" />
        <span>Active Demo Role:</span>
        <select
          className="role-select"
          value={user?.role || 'ADMIN'}
          onChange={(e) => switchRoleDemo(e.target.value as UserRole)}
        >
          <option value="ADMIN">Admin (Full Access)</option>
          <option value="SALES">Sales (CRM + Challans)</option>
          <option value="WAREHOUSE">Warehouse (Stock + Inventory)</option>
          <option value="ACCOUNTS">Accounts (View Challans + Finance)</option>
        </select>
      </div>

      <div className="user-profile">
        <div className="user-avatar">{user?.name.charAt(0)}</div>
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-role-badge">{user?.role}</span>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={logout}
          title="Logout"
          style={{ marginLeft: '12px' }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
