const API_BASE_URL = "http://localhost:8080/api/events";

export const eventService = {
  async getAllEvents() {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch events");
    return response.json();
  },

  async getEventById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch event");
    return response.json();
  },

  async createEvent(eventData) {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) throw new Error("Failed to create event");
    return response.json();
  },

  async updateEvent(id, eventData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) throw new Error("Failed to update event");
    return response.json();
  },

  async toggleBooking(id) {
    const response = await fetch(`${API_BASE_URL}/${id}/toggle-booking`, {
      method: "PUT",
    });

    if (!response.ok) throw new Error("Failed to toggle booking");
    return response.json();
  },

  async uploadEventMedia(id, file) {
    const fd = new FormData();
    fd.append("file", file, file.name);
    const response = await fetch(`${API_BASE_URL}/${id}/media`, {
      method: "POST",
      body: fd,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to upload image");
    }
    return response.json();
  },

  async uploadEventVideo(id, file) {
    const fd = new FormData();
    fd.append("file", file, file.name);
    const response = await fetch(`${API_BASE_URL}/${id}/video`, {
      method: "POST",
      body: fd,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to upload video");
    }
    return response.json();
  },

  async planEvent(params) {
    const response = await fetch(`${API_BASE_URL}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error("Failed to get AI event recommendations");
    return response.json();
  },

  async getRecommendations(userId) {
    const response = await fetch(`${API_BASE_URL}/recommendations?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error("Failed to fetch recommendations");
    return response.json();
  },

  async deleteEvent(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete event");
    return response.text();
  },
};
