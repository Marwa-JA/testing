import { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { dashboardService } from "../services/dashboardService";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

export const OrganizerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getOrganizationDashboard();
      setDashboardData(res);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await dashboardService.exportPdf();
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to export PDF" });
    } finally {
      setExporting(false);
    }
  };

  const statusBodyTemplate = (rowData) => {
    const severity = rowData.status === "CONFIRMED" ? "success" : "warning";
    return <Tag value={rowData.status} severity={severity} />;
  };

  const priceBodyTemplate = (rowData) => (
    <span className="font-semibold">${rowData.totalPrice.toFixed(2)}</span>
  );

  const dateBodyTemplate = (rowData) =>
    new Date(rowData.bookingDate).toLocaleDateString();

  if (loading || !dashboardData) {
    return (
      <div
        className="flex align-items-center justify-content-center"
        style={{ minHeight: "400px" }}
      >
        <ProgressSpinner />
      </div>
    );
  }

  const bookingsChartData = {
    labels: dashboardData.eventStats.map((e) => e.eventTitle),
    datasets: [
      {
        label: "Total Bookings",
        backgroundColor: "#42A5F5",
        data: dashboardData.eventStats.map((e) => e.totalBookings),
      },
    ],
  };

  const revenueChartData = {
    labels: dashboardData.eventStats.map((e) => e.eventTitle),
    datasets: [
      {
        label: "Revenue ($)",
        backgroundColor: "#9C27B0",
        data: dashboardData.eventStats.map((e) => e.totalRevenue),
      },
    ],
  };

  const occupancyChartData = {
    labels: dashboardData.eventStats.map((e) => e.eventTitle),
    datasets: [
      {
        label: "Booked",
        backgroundColor: "#42A5F5",
        data: dashboardData.eventStats.map((e) => e.totalBookings),
      },
      {
        label: "Available",
        backgroundColor: "#EF9A9A",
        data: dashboardData.eventStats.map((e) => e.availableSeats),
      },
    ],
  };

  const occupancyChartOptions = { scales: { x: { stacked: true }, y: { stacked: true } } };

  const providerChartData = dashboardData.providerPerformance?.length > 0 ? {
    labels: dashboardData.providerPerformance.map((p) => p.supplierName),
    datasets: [
      {
        label: "Bookings",
        backgroundColor: "#26A69A",
        data: dashboardData.providerPerformance.map((p) => p.bookingCount),
      },
    ],
  } : null;

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="flex align-items-center justify-content-between mb-4">
        <h1 className="text-4xl font-bold m-0">Dashboard</h1>
        <Button
          label="Export PDF"
          icon="pi pi-file-pdf"
          className="p-button-outlined p-button-danger"
          onClick={handleExportPdf}
          loading={exporting}
        />
      </div>

      <div className="grid mb-4">
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="bg-blue-50">
            <div className="text-gray-600 text-sm">Total Events</div>
            <div className="text-3xl font-bold text-blue-900">{dashboardData.totalEvents}</div>
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="bg-green-50">
            <div className="text-gray-600 text-sm">Total Bookings</div>
            <div className="text-3xl font-bold text-green-900">{dashboardData.totalBookings}</div>
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="bg-purple-50">
            <div className="text-gray-600 text-sm">Total Revenue</div>
            <div className="text-3xl font-bold text-purple-900">
              ${dashboardData.totalRevenue.toLocaleString()}
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="bg-orange-50">
            <div className="text-gray-600 text-sm">Cancellations</div>
            <div className="text-3xl font-bold text-orange-900">{dashboardData.totalCancellations}</div>
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="bg-red-50">
            <div className="text-gray-600 text-sm mb-1">Cancellation Rate</div>
            <div className="text-3xl font-bold text-red-900">{dashboardData.cancellationRate}%</div>
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="bg-teal-50">
            <div className="text-gray-600 text-sm mb-1">Attendance Rate</div>
            <div className="text-3xl font-bold text-teal-900">{dashboardData.attendanceRate}%</div>
          </Card>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-2">Bookings & Revenue</h2>
      <div className="grid mb-4">
        <div className="col-12 md:col-6 lg:col-6 mb-3">
          <Card>
            <h3 className="text-lg font-semibold mb-2">Bookings by Event</h3>
            <Chart
              type="bar"
              data={bookingsChartData}
              style={{ width: "100%", height: "250px" }}
            />
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-6 mb-3">
          <Card>
            <h3 className="text-lg font-semibold mb-2">Revenue by Event</h3>
            <Chart
              type="bar"
              data={revenueChartData}
              style={{ width: "100%", height: "250px" }}
            />
          </Card>
        </div>
        <div className="col-12 mb-3">
          <Card>
            <h3 className="text-lg font-semibold mb-2">Seat Occupancy by Event</h3>
            <Chart
              type="bar"
              data={occupancyChartData}
              options={occupancyChartOptions}
              style={{ width: "100%", height: "250px" }}
            />
          </Card>
        </div>
      </div>

      {dashboardData.mostPopularEvents?.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mt-4 mb-2">Most Popular Events</h2>
          <div className="grid mb-4">
            {dashboardData.mostPopularEvents.map((event, idx) => (
              <div key={event.eventId} className="col-12 md:col-4">
                <Card className={idx === 0 ? "bg-yellow-50" : idx === 1 ? "bg-gray-50" : "bg-orange-50"}>
                  <div className="flex align-items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{event.eventTitle}</div>
                      <div className="text-sm text-gray-500">{event.totalBookings} bookings · ${event.totalRevenue.toLocaleString()} revenue</div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}

      {providerChartData && (
        <>
          <h2 className="text-2xl font-semibold mt-2 mb-2">Provider Performance</h2>
          <div className="mb-4">
            <Card>
              <h3 className="text-lg font-semibold mb-2">Bookings by Provider</h3>
              <Chart
                type="bar"
                data={providerChartData}
                style={{ width: "100%", height: "250px" }}
              />
            </Card>
          </div>
        </>
      )}

      <h2 className="text-2xl font-semibold mt-4 mb-2">Recent Bookings</h2>
      <Card>
        <DataTable
          value={dashboardData.recentBookings}
          rows={5}
          emptyMessage="No recent bookings"
        >
          <Column
            field="eventTitle"
            header="Event"
            style={{ minWidth: "150px" }}
          />
          <Column field="userName" header="Customer" />
          <Column field="ticketCount" header="Tickets" />
          <Column body={priceBodyTemplate} header="Amount" />
          <Column body={statusBodyTemplate} header="Status" />
          <Column body={dateBodyTemplate} header="Date" />
        </DataTable>
      </Card>
    </div>
  );
};
