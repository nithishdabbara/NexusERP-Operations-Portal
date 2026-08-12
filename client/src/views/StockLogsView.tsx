import React, { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { api } from '../services/api';
import { StockLog } from '../types';

interface StockLogsViewProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const StockLogsView: React.FC<StockLogsViewProps> = ({ onShowToast }) => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, [typeFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getStockLogs({ type: typeFilter });
      setLogs(res.logs);
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Audit Logs</h1>
          <p className="page-subtitle">Immutable audit trail of all warehouse inventory movements (IN / OUT)</p>
        </div>
      </div>

      <div className="action-bar">
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Movement Types</option>
          <option value="IN">IN (Restock / Returns)</option>
          <option value="OUT">OUT (Challan / Disposals)</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product / SKU</th>
                <th>Type</th>
                <th>Qty Changed</th>
                <th>Reason</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>
                    Loading stock audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                    No stock logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.product?.name}</div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#9ca3af' }}>
                        {log.product?.sku}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${log.type.toLowerCase()}`}>
                        {log.type === 'IN' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        {log.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {log.type === 'IN' ? `+${log.qtyChanged}` : `-${log.qtyChanged}`} Units
                    </td>
                    <td style={{ fontSize: '13px' }}>{log.reason}</td>
                    <td style={{ fontSize: '12px' }}>
                      {log.createdBy?.name} ({log.createdBy?.role})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
