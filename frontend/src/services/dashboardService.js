const BASE_URL = 'http://localhost:8080/api/dashboard';

export const dashboardService = {
  async getOrganizationDashboard() {
    const response = await fetch(`${BASE_URL}/organization`);
    if (!response.ok) throw new Error("Failed to fetch dashboard data");
    return response.json();
  },

  async exportPdf() {
    const response = await fetch(`${BASE_URL}/export/pdf`);
    if (!response.ok) throw new Error("Failed to export PDF");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-report.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
