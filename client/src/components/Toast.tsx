import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <CheckCircle2 size={18} color="#10b981" /> : <AlertTriangle size={18} color="#ef4444" />}
      <span>{message}</span>
      <button className="close-btn" onClick={onClose} style={{ marginLeft: 'auto' }}>
        <X size={14} />
      </button>
    </div>
  );
};
