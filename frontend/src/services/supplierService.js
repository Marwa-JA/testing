const API_BASE_URL = 'http://localhost:8080/api';

export const supplierService = {
  async registerSupplier(data) {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to register supplier');
    return response.json();
  },

  async getAllSuppliers() {
    const response = await fetch(`${API_BASE_URL}/suppliers`);
    if (!response.ok) throw new Error('Failed to fetch supplier');
    return response.json();
  },

  async getSupplierById(id) {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch supplier');
    return response.json();
  },

  async getSupplierByUserId(id) {
    const response = await fetch(`${API_BASE_URL}/suppliers/user/${id}`);
    if (!response.ok) throw new Error('Failed to fetch supplier');
    return response.json();
  },

  async updateSupplier(id, data) {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update supplier');
    return response.json();
  },

  async deleteSupplier(id) {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete supplier');
    return response.text();
  },

  // Provider Services
  async getAvailableServices() {
    const response = await fetch(`${API_BASE_URL}/services/available`);
    if (!response.ok) throw new Error('Failed to fetch available services');
    return response.json();
  },

  async getServiceById(serviceId) {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`);
    if (!response.ok) throw new Error('Failed to fetch service');
    return response.json();
  },

  async createService(data) {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create service');
    return response.json();
  },

  async getServicesBySupplierId(supplierId) {
    const response = await fetch(`${API_BASE_URL}/services/supplier/${supplierId}`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  async updateService(serviceId, data) {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update service');
    return response.json();
  },

  async updateServiceStatus(serviceId, status) {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update service status');
    return response.json();
  },

  async deleteService(serviceId) {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete service');
    return response.text();
  }
};