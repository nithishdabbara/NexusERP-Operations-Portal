import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Download, CheckCircle2, XCircle, Trash2, Eye } from 'lucide-react';
import { api } from '../services/api';
import { Challan, Customer, Product } from '../types';
import { useAuth } from '../context/AuthContext';

interface ChallanViewProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const ChallanView: React.FC<ChallanViewProps> = ({ onShowToast }) => {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);

  // Form State for New Challan
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lineItems, setLineItems] = useState<{ productId: string; quantity: number }[]>([]);

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await api.getChallans({ search, status: statusFilter });
      setChallans(res.challans);
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.getCustomers({ limit: 100 }),
        api.getProducts({ limit: 100 })
      ]);
      setCustomers(custRes.customers);
      setProducts(prodRes.products);

      if (custRes.customers.length > 0) {
        setSelectedCustomerId(custRes.customers[0].id);
      }
      if (prodRes.products.length > 0) {
        setLineItems([{ productId: prodRes.products[0].id, quantity: 1 }]);
      }
      setShowCreateModal(true);
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  const handleAddLineItem = () => {
    if (products.length === 0) return;
    setLineItems([...lineItems, { productId: products[0].id, quantity: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleCreateChallan = async (status: 'DRAFT' | 'CONFIRMED') => {
    if (!selectedCustomerId || lineItems.length === 0) {
      onShowToast('Please select customer and at least one line item', 'error');
      return;
    }

    try {
      await api.createChallan({
        customerId: selectedCustomerId,
        status,
        items: lineItems
      });
      onShowToast(`Sales Challan created as ${status}`, 'success');
      setShowCreateModal(false);
      fetchChallans();
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'DRAFT' | 'CONFIRMED' | 'CANCELLED') => {
    try {
      await api.updateChallanStatus(id, newStatus);
      onShowToast(`Challan status updated to ${newStatus}`, 'success');
      if (selectedChallan && selectedChallan.id === id) {
        const updated = await api.getChallanById(id);
        setSelectedChallan(updated.challan);
      }
      fetchChallans();
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  const handlePDFDownload = async (c: Challan) => {
    try {
      onShowToast('Generating PDF invoice...', 'success');
      await api.downloadChallanPDF(c.id, c.challanNumber);
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  // Calculate live preview totals
  const getProductMap = () => new Map(products.map(p => [p.id, p]));
  const prodMap = getProductMap();

  let previewTotalAmount = 0;
  let previewTotalQty = 0;
  lineItems.forEach(item => {
    const p = prodMap.get(item.productId);
    if (p) {
      previewTotalAmount += p.unitPrice * item.quantity;
      previewTotalQty += item.quantity;
    }
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Challan & Invoice Flow</h1>
          <p className="page-subtitle">Generate wholesale dispatch challans with automated stock deduction & PDF printing</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Create Sales Challan
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="action-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by Challan No or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total Items</th>
                <th>Total Amount</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                    Loading sales challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                    No sales challans found.
                  </td>
                </tr>
              ) : (
                challans.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.challanNumber}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.customer?.name}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{c.customer?.businessName}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                    </td>
                    <td>{c.totalQuantity} Units</td>
                    <td style={{ fontWeight: 700 }}>₹{c.totalAmount.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '12px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedChallan(c)} title="View Detail">
                          <Eye size={14} /> View
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handlePDFDownload(c)} title="Download PDF Invoice">
                          <Download size={14} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sales Challan Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Sales Challan</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">Select Customer *</label>
              <select
                className="form-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.businessName} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Line Items */}
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Products Line Items</h3>
                <button className="btn btn-secondary btn-sm" onClick={handleAddLineItem}>
                  <Plus size={14} /> Add Product Row
                </button>
              </div>

              {lineItems.map((item, idx) => {
                const p = prodMap.get(item.productId);
                const isInsufficient = p && p.currentStock < item.quantity;
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 40px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <select
                        className="form-select"
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      >
                        {products.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name} ({prod.sku}) - Stock: {prod.currentStock} | ₹{prod.unitPrice}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                      ₹{p ? (p.unitPrice * item.quantity).toLocaleString('en-IN') : 0}
                    </div>

                    <div>
                      {isInsufficient ? (
                        <span className="badge badge-low-stock" style={{ fontSize: '10px' }}>NO STOCK</span>
                      ) : (
                        <span className="badge badge-active" style={{ fontSize: '10px' }}>AVAILABLE</span>
                      )}
                    </div>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveLineItem(idx)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Total Summary */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Total Line Quantity</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{previewTotalQty} Units</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Estimated Grand Total</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{previewTotalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-secondary" onClick={() => handleCreateChallan('DRAFT')}>
                Save as Draft
              </button>
              <button className="btn btn-primary" onClick={() => handleCreateChallan('CONFIRMED')}>
                <CheckCircle2 size={16} /> Confirm & Deduct Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challan Detail View Modal */}
      {selectedChallan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Sales Challan {selectedChallan.challanNumber}</h2>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Created on {new Date(selectedChallan.createdAt).toLocaleString()}</div>
              </div>
              <button className="close-btn" onClick={() => setSelectedChallan(null)}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>CUSTOMER DETAILS</div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{selectedChallan.customer?.name}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{selectedChallan.customer?.businessName}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{selectedChallan.customer?.mobile}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Address: {selectedChallan.customer?.address}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>CHALLAN STATUS & ISSUER</div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge badge-${selectedChallan.status.toLowerCase()}`}>{selectedChallan.status}</span>
                </div>
                <div style={{ fontSize: '12px', marginTop: '10px', color: '#9ca3af' }}>
                  Created By: {selectedChallan.createdBy?.name} ({selectedChallan.createdBy?.role})
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Itemized Product Snapshots</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChallan.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{item.productSku}</td>
                      <td style={{ fontWeight: 600 }}>{item.productName}</td>
                      <td>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: 700 }}>₹{item.subtotal.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div>
                {selectedChallan.status === 'DRAFT' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(selectedChallan.id, 'CONFIRMED')}>
                    <CheckCircle2 size={14} /> Confirm Challan (Deduct Stock)
                  </button>
                )}

                {selectedChallan.status === 'CONFIRMED' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(selectedChallan.id, 'CANCELLED')}>
                    <XCircle size={14} /> Cancel Challan (Restore Stock)
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => handlePDFDownload(selectedChallan)}>
                  <Download size={16} /> Download PDF Invoice
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedChallan(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
