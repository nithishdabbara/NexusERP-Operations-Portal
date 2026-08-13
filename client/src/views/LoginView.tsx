import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole } from '../types';

interface LoginViewProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onShowToast }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('Password123!');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.login({ email, password });
      login(res.token, res.user);
      onShowToast(`Welcome back, ${res.user.name}!`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const setDemoCredentials = (role: UserRole) => {
    const emailMap: Record<UserRole, string> = {
      ADMIN: 'admin@company.com',
      SALES: 'sales@company.com',
      WAREHOUSE: 'warehouse@company.com',
      ACCOUNTS: 'accounts@company.com'
    };
    setEmail(emailMap[role]);
    setPassword('Password123!');
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="logo-badge" style={{ margin: '0 auto 12px auto', width: '48px', height: '48px', fontSize: '13px', fontWeight: 800 }}>
            NEXUS
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>NexusERP Operations Portal</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Sign in to access wholesale operations & CRM dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                required
                style={{ paddingLeft: '38px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                required
                style={{ paddingLeft: '38px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }} disabled={submitting}>
            <LogIn size={16} /> {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#2563eb" /> Quick Demo Role Switcher:
          </div>
          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
            Click any role to autofill test credentials (Password: <code>Password123!</code>):
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            <span className="demo-account-chip" onClick={() => setDemoCredentials('ADMIN')}>
              🔑 Admin
            </span>
            <span className="demo-account-chip" onClick={() => setDemoCredentials('SALES')}>
              💼 Sales
            </span>
            <span className="demo-account-chip" onClick={() => setDemoCredentials('WAREHOUSE')}>
              📦 Warehouse
            </span>
            <span className="demo-account-chip" onClick={() => setDemoCredentials('ACCOUNTS')}>
              📊 Accounts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
