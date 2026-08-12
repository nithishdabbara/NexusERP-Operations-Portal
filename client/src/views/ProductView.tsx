import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, AlertTriangle, Edit, ArrowUpDown, Package, Layers } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProductViewProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const ProductView: React.FC<ProductViewProps> = ({ onShowToast }) => {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    unitPrice: 0,
    currentStock: 0,
    minAlertQty: 10,
    location: 'Warehouse 1'
  });

  const [adjustData, setAdjustData] = useState({
    qtyChanged: 1,
    type: 'IN' as 'IN' | 'OUT',
    reason: 'Stock Restock Purchase'
  });

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({
        search,
        category: categoryFilter,
        lowStock: lowStockOnly
      });
      setProducts(res.products);
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'Electronics',
      unitPrice: 0,
      currentStock: 0,
      minAlertQty: 10,
      location: 'Warehouse 1'
    });
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minAlertQty: p.minAlertQty,
      location: p.location
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        onShowToast('Product updated successfully', 'success');
      } else {
        await api.createProduct(formData);
        onShowToast('New product added to catalog', 'success');
      }
      setShowAddModal(false);
      fetchProducts();
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;
    try {
      await api.adjustStock(stockAdjustProduct.id, adjustData);
      onShowToast(`Stock updated for ${stockAdjustProduct.name}`, 'success');
      setStockAdjustProduct(null);
      fetchProducts();
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory & Stock Catalog</h1>
          <p className="page-subtitle">Manage wholesale inventory, warehouse locations, and stock adjustments</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="action-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search product name, SKU, or warehouse location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Peripherals">Peripherals</option>
          <option value="Accessories">Accessories</option>
          <option value="Networking">Networking</option>
        </select>

        <button
          className={`btn ${lowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setLowStockOnly(!lowStockOnly)}
        >
          <AlertTriangle size={14} /> Low Stock Only
        </button>
      </div>

      {/* Product Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.currentStock <= p.minAlertQty;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.sku}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>{p.category}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{p.unitPrice.toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: isLowStock ? '#ef4444' : '#10b981' }}>
                            {p.currentStock} Units
                          </span>
                          {isLowStock && <span className="badge badge-low-stock">LOW STOCK</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#9ca3af' }}>{p.location}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {canEdit && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setStockAdjustProduct(p);
                                  setAdjustData({ qtyChanged: 1, type: 'IN', reason: 'Stock Restock Purchase' });
                                }}
                                title="Adjust Stock (IN/OUT)"
                              >
                                <ArrowUpDown size={14} /> Stock
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(p)} title="Edit Product">
                                <Edit size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. PRD-MS-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    required
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Initial Stock *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="0"
                    disabled={!!editingProduct}
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Low Stock Alert Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="0"
                    value={formData.minAlertQty}
                    onChange={(e) => setFormData({ ...formData, minAlertQty: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Location *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Rack A1 - Warehouse 1"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {stockAdjustProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Adjust Stock Level</h2>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{stockAdjustProduct.name} ({stockAdjustProduct.sku})</div>
              </div>
              <button className="close-btn" onClick={() => setStockAdjustProduct(null)}>×</button>
            </div>
            <form onSubmit={handleAdjustStock}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Current Stock</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{stockAdjustProduct.currentStock} Units</div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Adjustment Type</label>
                  <select
                    className="form-select"
                    value={adjustData.type}
                    onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value as 'IN' | 'OUT' })}
                  >
                    <option value="IN">IN (Stock Received / Added)</option>
                    <option value="OUT">OUT (Damaged / Manual Removal)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="1"
                    value={adjustData.qtyChanged}
                    onChange={(e) => setAdjustData({ ...adjustData, qtyChanged: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Stock Adjustment *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Purchase order delivery, Damage disposal..."
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStockAdjustProduct(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
