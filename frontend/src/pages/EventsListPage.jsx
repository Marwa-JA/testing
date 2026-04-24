import { useState, useEffect, useRef } from "react";
import { EventCard } from "../components/EventCard";
import { EventFilters } from "../components/EventFilters";
import { EventDetailsView } from "../components/EventDetailsView";
import { eventService } from "../services/eventService";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

export const EventsListPage = () => {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: "",
    city: "",
    startDate: null,
    endDate: null,
    minPrice: "",
    maxPrice: "",
    eventType: "ALL",
  });
  const toast = useRef(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAllEvents();
      const eventsWithDates = data.map((event) => ({
        ...event,
        eventDateTime: event.eventDateTime
          ? new Date(event.eventDateTime)
          : null,
        createdAt: event.createdAt ? new Date(event.createdAt) : null,
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : null,
      }));

      setAllEvents(eventsWithDates);
      setEvents(eventsWithDates);
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

  const handleSearch = async () => {
    setLoading(true);
    try {
      let filtered = [...allEvents];

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (event) =>
            event.title.toLowerCase().includes(term) ||
            event.description.toLowerCase().includes(term)
        );
      }

      if (filters.city) {
        filtered = filtered.filter((event) =>
          event.city.toLowerCase().includes(filters.city.toLowerCase())
        );
      }

      if (filters.eventType !== "ALL") {
        filtered = filtered.filter(
          (event) => event.eventType === filters.eventType
        );
      }

      if (filters.startDate) {
        const startTime = filters.startDate.getTime();
        filtered = filtered.filter(
          (event) => event.eventDateTime.getTime() >= startTime
        );
      }

      if (filters.endDate) {
        const endTime = new Date(filters.endDate);
        endTime.setHours(23, 59, 59, 999);
        filtered = filtered.filter(
          (event) => event.eventDateTime.getTime() <= endTime.getTime()
        );
      }

      if (filters.minPrice) {
        filtered = filtered.filter(
          (event) => event.ticketPrice >= parseFloat(filters.minPrice)
        );
      }

      if (filters.maxPrice) {
        filtered = filtered.filter(
          (event) => event.ticketPrice <= parseFloat(filters.maxPrice)
        );
      }

      setEvents(filtered);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Found ${filtered.length} events`,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to search events",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      city: "",
      startDate: null,
      endDate: null,
      minPrice: "",
      maxPrice: "",
      eventType: "ALL",
    });
    loadEvents();
  };

  const handleViewDetails = async (eventId) => {
    setLoading(true);
    try {
      const event = await eventService.getEventById(eventId);
      setSelectedEvent({
        ...event,
        eventDateTime: event.eventDateTime
          ? new Date(event.eventDateTime)
          : null,
        createdAt: event.createdAt ? new Date(event.createdAt) : null,
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : null,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to fetch event details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
  };

  if (selectedEvent) {
    return <EventDetailsView event={selectedEvent} onBack={handleBackToList} />;
  }

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
    <div className="container mx-auto py-6 px-4">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="text-4xl font-bold mb-2">Discover Events</h1>
        <p className="text-gray-600">
          Find and book amazing events or host packages
        </p>
      </div>

      <EventFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

      <div className="mb-3 flex align-items-center justify-content-between">
        <span className="text-lg font-semibold">
          {events.length} events found
        </span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <i className="pi pi-search text-6xl text-gray-400 mb-3"></i>
          <h3 className="text-2xl text-gray-600">No events found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid">
          {events.map((event) => (
            <div key={event.id} className="col-12 md:col-6 lg:col-4">
              <EventCard event={event} onViewDetails={handleViewDetails} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
