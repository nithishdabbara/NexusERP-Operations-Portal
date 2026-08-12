const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || errorData.message || 'API request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Customers
  getCustomers: async (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/customers?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getCustomerById: async (id: string) => {
    const res = await fetch(`${API_BASE}/customers/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createCustomer: async (data: any) => {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateCustomer: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  addFollowUp: async (id: string, note: string) => {
    const res = await fetch(`${API_BASE}/customers/${id}/followups`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ note })
    });
    return handleResponse(res);
  },

  // Products
  getProducts: async (params?: { page?: number; limit?: number; search?: string; category?: string; lowStock?: boolean }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/products?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getProductById: async (id: string) => {
    const res = await fetch(`${API_BASE}/products/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createProduct: async (data: any) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateProduct: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  adjustStock: async (id: string, data: { qtyChanged: number; type: 'IN' | 'OUT'; reason: string }) => {
    const res = await fetch(`${API_BASE}/products/${id}/adjust-stock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getStockLogs: async (params?: { page?: number; type?: string; productId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/products/stock-logs?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Challans
  getChallans: async (params?: { page?: number; search?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/challans?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getChallanById: async (id: string) => {
    const res = await fetch(`${API_BASE}/challans/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createChallan: async (data: any) => {
    const res = await fetch(`${API_BASE}/challans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateChallanStatus: async (id: string, status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED') => {
    const res = await fetch(`${API_BASE}/challans/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  downloadChallanPDF: async (id: string, challanNumber: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/challans/${id}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to generate PDF');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${challanNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};
