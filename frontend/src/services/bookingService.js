const API_BASE_URL = "http://localhost:8080/api";

export const bookingService = {
  async getAllBookings() {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) throw new Error("Failed to fetch bookings");
    return response.json();
  },

  async getBookingById(bookingId) {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
    if (!response.ok) throw new Error("Failed to fetch booking");
    return response.json();
  },

  async createBooking(userId, bookingData) {
    const response = await fetch(
      `${API_BASE_URL}/bookings?userId=${encodeURIComponent(userId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      }
    );

    if (!response.ok) throw new Error("Failed to create booking");
    return response.json();
  },

  async getUpcomingBookings(userId) {
    const response = await fetch(
      `${API_BASE_URL}/bookings/user/${userId}/upcoming`
    );
    if (!response.ok) throw new Error("Failed to fetch booking");
    return response.json();
  },
  
  async getPastBookings(userId) {
    const response = await fetch(
      `${API_BASE_URL}/bookings/user/${userId}/past`
    );
    if (!response.ok) throw new Error("Failed to fetch booking");
    return response.json();
  },

  async cancelBooking(bookingId, userId) {
    const response = await fetch(
      `${API_BASE_URL}/bookings/${bookingId}/cancel?userId=${encodeURIComponent(userId)}`,
      { method: "PUT" }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to cancel booking");
    }
    return response.json();
  },

  async getBookedDates(eventId) {
    const response = await fetch(`${API_BASE_URL}/bookings/event/${eventId}/booked-dates`);
    if (!response.ok) throw new Error("Failed to fetch booked dates");
    return response.json();
  },

  async notifyAttendees(eventId, subject, message) {
    const response = await fetch(`${API_BASE_URL}/bookings/notify/${eventId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to send notifications");
    }
    return response.json();
  },
};
