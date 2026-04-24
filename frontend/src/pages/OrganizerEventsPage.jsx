import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { useNavigate } from "react-router-dom";
import { eventService } from "../services/eventService";
import { bookingService } from "../services/bookingService";

export const OrganizerEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [notifyEvent, setNotifyEvent] = useState(null);
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifySending, setNotifySending] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  const statusOptions = [
    { label: "All Status", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Canceled", value: "CANCELED" },
    { label: "Completed", value: "COMPLETED" },
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to load events",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate("/organizer/events/create");
  };

  const handleEditEvent = (event) => {
    navigate(`/organizer/events/edit/${event.id}`);
  };

  const handleDelete = (event) => {
    confirmDialog({
      message: `Are you sure you want to delete "${event.title}"?`,
      header: "Delete Event",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await eventService.deleteEvent(event.id);

          setEvents((prev) => prev.filter((e) => e.id !== event.id));

          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Event deleted successfully",
          });
        } catch (error) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Failed to delete event",
          });
        }
      },
    });
  };

  const handleNotifySend = async () => {
    if (!notifySubject.trim() || !notifyMessage.trim()) {
      toast.current?.show({ severity: "warn", summary: "Validation", detail: "Subject and message are required" });
      return;
    }
    setNotifySending(true);
    try {
      const result = await bookingService.notifyAttendees(notifyEvent.id, notifySubject, notifyMessage);
      toast.current?.show({
        severity: "success",
        summary: "Sent",
        detail: `Notification sent to ${result.notified} attendee(s)`,
      });
      setNotifyEvent(null);
      setNotifySubject("");
      setNotifyMessage("");
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: error.message });
    } finally {
      setNotifySending(false);
    }
  };

  const handleToggleBooking = async (event) => {
    try {
      await eventService.toggleBooking(event.id);
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === event.id ? { ...e, bookingEnabled: !e.bookingEnabled } : e
        )
      );
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Bookings ${!event.bookingEnabled ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update booking status",
      });
    }
  };

const dateBodyTemplate = (rowData) => {
  let date;
  if (rowData.eventDateTime?.seconds) {
    date = new Date(rowData.eventDateTime.seconds * 1000);
  } else if (rowData.eventDateTime instanceof Date) {
    date = rowData.eventDateTime;
  } else {
    date = new Date(rowData.eventDateTime);
  }
  return date.toLocaleDateString();
};


  const statusBodyTemplate = (rowData) => {
    const severity = {
      ACTIVE: "success",
      CANCELED: "danger",
      COMPLETED: "secondary",
    };
    return <Tag value={rowData.status} severity={severity[rowData.status]} />;
  };

  const typeBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.eventType === "HOST_PACKAGE" ? "Host" : "Public"}
        severity={rowData.eventType === "HOST_PACKAGE" ? "warning" : "success"}
      />
    );
  };

  const bookingBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.bookingEnabled ? "Open" : "Closed"}
        severity={rowData.bookingEnabled ? "success" : "danger"}
      />
    );
  };

  const statsBodyTemplate = (rowData) => {
    return (
      <div className="flex flex-column gap-1">
        <div className="text-sm">
          <strong>{rowData.totalBookings || 0}</strong> bookings
        </div>
        <div className="text-sm">
          <strong>{rowData.availableSeats}</strong> / {rowData.capacity}{" "}
          available
        </div>
      </div>
    );
  };

  const revenueBodyTemplate = (rowData) => {
    return (
      <span className="font-semibold">
        ${(rowData.totalRevenue || 0).toFixed(2)}
      </span>
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          onClick={() => handleEditEvent(rowData)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-bell"
          className="p-button-rounded p-button-text p-button-info"
          onClick={() => setNotifyEvent(rowData)}
          tooltip="Notify Attendees"
        />
        <Button
          icon={rowData.bookingEnabled ? "pi pi-lock" : "pi pi-lock-open"}
          className="p-button-rounded p-button-text p-button-warning"
          onClick={() => handleToggleBooking(rowData)}
          tooltip={
            rowData.bookingEnabled ? "Disable Bookings" : "Enable Bookings"
          }
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => handleDelete(rowData)}
          tooltip="Delete"
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row gap-3 align-items-center justify-content-between">
      <div className="flex gap-2">
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search events..."
          className="w-full md:w-20rem"
        />
        <Dropdown
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder="Filter by status"
          className="w-full md:w-15rem"
        />
      </div>
      <Button
        label="Create Event"
        icon="pi pi-plus"
        onClick={handleCreateEvent}
      />
    </div>
  );

const filteredEvents = events.filter((event) => {
  const matchesSearch =
    !globalFilter ||
    event.title?.toLowerCase().includes(globalFilter.toLowerCase()) ||
    event.city?.toLowerCase().includes(globalFilter.toLowerCase());

 let matchesStatus = true;
  if (statusFilter && statusFilter !== "ALL") {
    matchesStatus = event.status === statusFilter;
  }

  return matchesSearch && matchesStatus;
});


  if (loading) {
    return (
      <div
        className="flex align-items-center justify-content-center"
        style={{ minHeight: "400px" }}
      >
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Dialog
        header={`Notify Attendees — ${notifyEvent?.title || ''}`}
        visible={!!notifyEvent}
        style={{ width: '480px' }}
        onHide={() => { setNotifyEvent(null); setNotifySubject(""); setNotifyMessage(""); }}
        footer={
          <div className="flex gap-2 justify-content-end">
            <Button label="Cancel" className="p-button-text" onClick={() => { setNotifyEvent(null); setNotifySubject(""); setNotifyMessage(""); }} />
            <Button label="Send" icon="pi pi-send" onClick={handleNotifySend} loading={notifySending} />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-2">
          <div>
            <label className="block font-medium mb-1">Subject</label>
            <InputText value={notifySubject} onChange={(e) => setNotifySubject(e.target.value)} className="w-full" placeholder="e.g. Important update about your booking" />
          </div>
          <div>
            <label className="block font-medium mb-1">Message</label>
            <InputTextarea value={notifyMessage} onChange={(e) => setNotifyMessage(e.target.value)} className="w-full" rows={5} placeholder="Write your message to all confirmed attendees..." />
          </div>
          <p className="text-sm text-gray-500 m-0">This will send an email to all confirmed attendees of this event.</p>
        </div>
      </Dialog>

      <h2 className="text-3xl font-bold mb-4">Manage Events</h2>

      <DataTable
        value={filteredEvents}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "60rem" }}
        emptyMessage="No events found"
      >
        <Column
          field="title"
          header="Event Title"
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column
          body={typeBodyTemplate}
          header="Type"
          sortable
          style={{ minWidth: "100px" }}
        />
        <Column
          field="city"
          header="City"
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          body={dateBodyTemplate}
          header="Date"
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          body={statusBodyTemplate}
          header="Status"
          sortable
          style={{ minWidth: "100px" }}
        />
        <Column
          body={bookingBodyTemplate}
          header="Bookings"
          sortable
          style={{ minWidth: "100px" }}
        />
        <Column
          body={statsBodyTemplate}
          header="Stats"
          style={{ minWidth: "150px" }}
        />
        <Column
          body={revenueBodyTemplate}
          header="Revenue"
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          body={actionsBodyTemplate}
          header="Actions"
          style={{ minWidth: "180px" }}
        />
      </DataTable>
    </div>
  );
};
