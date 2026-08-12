import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Clock, Phone, Mail, Building2, Calendar, FileText } from 'lucide-react';
import { api } from '../services/api';
import { Customer, CustomerType, CustomerStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface CustomerViewProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ onShowToast }) => {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    type: 'WHOLESALE' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
    followUpDate: '',
    notes: ''
  });

  const [newFollowUpNote, setNewFollowUpNote] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search, typeFilter, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers({
        search,
        type: typeFilter,
        status: statusFilter
      });
      setCustomers(res.customers);
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      type: 'WHOLESALE',
      address: '',
      status: 'LEAD',
      followUpDate: '',
      notes: ''
    });
    setEditingCustomer(null);
    setShowAddModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      mobile: c.mobile,
      email: c.email,
      businessName: c.businessName,
      gstNumber: c.gstNumber || '',
      type: c.type,
      address: c.address,
      status: c.status,
      followUpDate: c.followUpDate ? c.followUpDate.substring(0, 10) : '',
      notes: c.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
        onShowToast('Customer details updated successfully', 'success');
      } else {
        await api.createCustomer(formData);
        onShowToast('New customer created successfully', 'success');
      }
      setShowAddModal(false);
      fetchCustomers();
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  const openDetailView = async (c: Customer) => {
    try {
      const res = await api.getCustomerById(c.id);
      setSelectedCustomer(res.customer);
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  const handleAddFollowUp = async () => {
    if (!selectedCustomer || !newFollowUpNote.trim()) return;
    try {
      await api.addFollowUp(selectedCustomer.id, newFollowUpNote);
      onShowToast('Follow-up note recorded', 'success');
      setNewFollowUpNote('');
      openDetailView(selectedCustomer);
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer CRM Management</h1>
          <p className="page-subtitle">Track wholesale leads, active clients, and follow-up activities</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="action-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by customer, mobile, business, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="RETAIL">Retail</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Customer Data Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer / Business</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                    No customers found matching filter criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{c.businessName}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{c.mobile}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{c.email}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>{c.type}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                    </td>
                    <td>
                      {c.followUpDate ? (
                        <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="#f59e0b" />
                          {new Date(c.followUpDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>None</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openDetailView(c)} title="View Detail">
                          <Eye size={14} />
                        </button>
                        {canEdit && (
                          <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(c)} title="Edit Customer">
                            <Edit size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">GST Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Type</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomerType })}
                  >
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="RETAIL">Retail</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea
                  className="form-textarea"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">CRM Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                  >
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Next Follow-up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Record customer preferences or initial discussion details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail View Modal with Follow-ups */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{selectedCustomer.name}</h2>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{selectedCustomer.businessName}</div>
              </div>
              <button className="close-btn" onClick={() => setSelectedCustomer(null)}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>CONTACT INFORMATION</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}><Phone size={12} /> {selectedCustomer.mobile}</div>
                <div style={{ fontSize: '13px', marginTop: '2px' }}><Mail size={12} /> {selectedCustomer.email}</div>
                <div style={{ fontSize: '13px', marginTop: '2px' }}><Building2 size={12} /> GST: {selectedCustomer.gstNumber || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>ACCOUNT STATUS</div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge badge-${selectedCustomer.status.toLowerCase()}`}>{selectedCustomer.status}</span>
                  <span className="badge" style={{ marginLeft: '6px', background: 'rgba(255,255,255,0.06)' }}>{selectedCustomer.type}</span>
                </div>
                {selectedCustomer.followUpDate && (
                  <div style={{ fontSize: '12px', marginTop: '8px', color: '#f59e0b' }}>
                    <Calendar size={12} /> Next Follow-up: {new Date(selectedCustomer.followUpDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Follow-up Timeline */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>CRM Follow-up Log History</h3>
              {canEdit && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add follow-up note (e.g. Discussed pricing for Q3 bulk order)..."
                    value={newFollowUpNote}
                    onChange={(e) => setNewFollowUpNote(e.target.value)}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleAddFollowUp}>
                    Add Note
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedCustomer.followUps && selectedCustomer.followUps.length > 0 ? (
                  selectedCustomer.followUps.map((f) => (
                    <div key={f.id} style={{ background: 'var(--bg-main)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                      <div style={{ fontSize: '13px' }}>{f.note}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                        By {f.createdBy?.name || 'User'} ({f.createdBy?.role}) • {new Date(f.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#9ca3af', fontSize: '12px' }}>No follow-up logs recorded yet.</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
