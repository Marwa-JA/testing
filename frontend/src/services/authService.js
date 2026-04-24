const API_BASE_URL = "http://localhost:8080/api";

export const authService = {
  async register(data) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    return response.json();
  },

  async verifyToken(token) {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Invalid token");
    }
    return response.json();
  },

  async updateProfile(uid, formData) {
    const url = `${API_BASE_URL}/auth/user/${uid}`;

    const fd = new FormData();
    const userPart = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      role: formData.role
    };
    fd.append(
      "user",
      new Blob([JSON.stringify(userPart)], { type: "application/json" })
    );

    if (formData.profileFile) {
      fd.append("file", formData.profileFile, formData.profileFile.name);
    }

    const response = await fetch(url, {
      method: "PUT",
      body: fd,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to update profile");
    }
    return response.json();
  },

  async deleteProfilePic(uid) {
    const url = `${API_BASE_URL}/auth/user/${uid}/profile-picture`;
    const token = localStorage.getItem("firebaseToken");

    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to delete profile picture");
    }

    return response.json();
  },

  async updateNotificationPreferences(uid, preferences) {
    const response = await fetch(`${API_BASE_URL}/auth/user/${uid}/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to update notification preferences");
    }
    return response.json();
  },

  async deleteAccount(uid) {
    const response = await fetch(`${API_BASE_URL}/auth/user/${uid}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete account");
    }
    return response.text();
  },
};
