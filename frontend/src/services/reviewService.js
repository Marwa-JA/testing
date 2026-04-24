const API_BASE_URL = 'http://localhost:8080/api';

export const reviewService = {
  async createReview(data) {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to submit review');
    }
    return response.json();
  },

  async getEventReviews(eventId) {
    const response = await fetch(`${API_BASE_URL}/reviews/event/${eventId}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  async getSupplierReviews(supplierId) {
    const response = await fetch(`${API_BASE_URL}/reviews/supplier/${supplierId}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  async getEventAverageRating(eventId) {
    const response = await fetch(`${API_BASE_URL}/reviews/average/event/${eventId}`);
    if (!response.ok) throw new Error('Failed to fetch rating');
    const data = await response.json();
    return data?.average ?? null;
  },

  async getSupplierAverageRating(supplierId) {
    const response = await fetch(`${API_BASE_URL}/reviews/average/supplier/${supplierId}`);
    if (!response.ok) throw new Error('Failed to fetch rating');
    const data = await response.json();
    return data?.average ?? null;
  },

  async deleteReview(reviewId) {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete review');
    return response.text();
  }
};
