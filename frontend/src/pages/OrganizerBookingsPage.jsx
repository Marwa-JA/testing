import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import {bookingService} from '../services/bookingService';

export const OrganizerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const toast = useRef(null);

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Canceled', value: 'CANCELED' }
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAllBookings();
      setBookings(response);
    } catch (error) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to load bookings' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    booking.eventDateTime = new Date(booking.eventDateTime).toLocaleDateString()
    booking.bookingDate = new Date(booking.bookingDate).toLocaleDateString()
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const statusBodyTemplate = (rowData) => {
    const severityMap = {
      'CONFIRMED': 'success',
      'PENDING': 'warning',
      'CANCELED': 'danger'
    };
    return <Tag value={rowData.status} severity={severityMap[rowData.status]} />;
  };

  const priceBodyTemplate = (rowData) => {
    return <span className="font-semibold">${rowData.totalPrice.toFixed(2)}</span>;
  };

const dateBodyTemplate = (rowData) => {
  return new Date(rowData.bookingDate).toLocaleDateString();
};

const eventDateBodyTemplate = (rowData) => {
  return new Date(rowData.eventDateTime).toLocaleDateString();
};

  const actionsBodyTemplate = (rowData) => {
    return (
      <Button 
        icon="pi pi-eye" 
        className="p-button-rounded p-button-text"
        onClick={() => handleViewDetails(rowData)}
        tooltip="View Details"
      />
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row gap-3 align-items-center justify-content-between">
      <div className="flex gap-2 flex-wrap">
        <InputText 
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search bookings..."
          className="w-full md:w-20rem"
        />
        <Dropdown 
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder="Filter by status"
          className="w-full md:w-12rem"
        />
      </div>
    </div>
  );

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !globalFilter || 
      booking.referenceNumber.toLowerCase().includes(globalFilter.toLowerCase()) ||
      booking.userName.toLowerCase().includes(globalFilter.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(globalFilter.toLowerCase()) ||
      booking.eventTitle.toLowerCase().includes(globalFilter.toLowerCase());
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filteredBookings
    .filter(b => b.status !== 'CANCELED')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="card">
      <Toast ref={toast} />
      
      <div className="flex align-items-center justify-content-between mb-4">
        <h2 className="text-3xl font-bold m-0">Bookings Management</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>
      
      <DataTable 
        value={filteredBookings}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '60rem' }}
        emptyMessage="No bookings found"
      >
        <Column field="referenceNumber" header="Reference" sortable style={{ minWidth: '140px' }} />
        <Column field="eventTitle" header="Event" sortable style={{ minWidth: '180px' }} />
        <Column field="userName" header="Customer" sortable style={{ minWidth: '150px' }} />
        <Column body={priceBodyTemplate} header="Amount" sortable style={{ minWidth: '100px' }} />
        <Column body={statusBodyTemplate} header="Status" sortable style={{ minWidth: '100px' }} />
        <Column body={dateBodyTemplate} header="Booked On" sortable style={{ minWidth: '120px' }} />
        <Column body={eventDateBodyTemplate} header="Event Date" sortable style={{ minWidth: '120px' }} />
        <Column body={actionsBodyTemplate} header="Actions" style={{ minWidth: '80px' }} />
      </DataTable>

      <Dialog
        header="Booking Details"
        visible={showDetailsDialog}
        style={{ width: '600px' }}
        onHide={() => setShowDetailsDialog(false)}
      >
        {selectedBooking && (
          <div className="flex flex-column gap-3">
            <div className="flex align-items-center justify-content-between">
              <h3 className="text-2xl font-bold m-0">{selectedBooking.eventTitle}</h3>
              <Tag 
                value={selectedBooking.status}
                severity={selectedBooking.status === 'CONFIRMED' ? 'success' : selectedBooking.status === 'PENDING' ? 'warning' : 'danger'}
                className="text-lg"
              />
            </div>

            <Divider />

            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="mb-3">
                  <label className="text-gray-600 text-sm">Reference Number</label>
                  <div className="font-bold font-mono">{selectedBooking.referenceNumber}</div>
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div className="mb-3">
                  <label className="text-gray-600 text-sm">Booking Date</label>
                  <div className="font-semibold">{selectedBooking.bookingDate}</div>
                </div>
              </div>

              <div className="col-12">
                <Divider />
                <h4 className="text-lg font-semibold mb-2">Customer Information</h4>
              </div>

              <div className="col-12 md:col-6">
                <div className="mb-3">
                  <label className="text-gray-600 text-sm">Name</label>
                  <div className="font-semibold">{selectedBooking.userName}</div>
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div className="mb-3">
                  <label className="text-gray-600 text-sm">Email</label>
                  <div className="font-semibold">{selectedBooking.userEmail}</div>
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div className="mb-3">
                  <label className="text-gray-600 text-sm">Phone</label>
                  <div className="font-semibold">{selectedBooking.userPhone}</div>
                </div>
              </div>

              <div className="col-12">
                <Divider />
                <h4 className="text-lg font-semibold mb-2">Booking Details</h4>
              </div>

              <div className="col-12 md:col-6">
                <div className="mb-3">
                  <label className="text-gray-600 text-sm">Event Date</label>
                  <div className="font-semibold">{selectedBooking.eventDateTime}</div>
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div className="mb-3">
                  <label className="text-gray-600 text-sm">Tickets</label>
                  <div className="font-semibold">{selectedBooking.numberOfSeats} ticket(s)</div>
                </div>
              </div>

              <div className="col-12">
                <Divider />
                <div className="flex align-items-center justify-content-between">
                  <span className="text-xl font-semibold">Total Amount</span>
                  <span className="text-3xl font-bold text-primary">${selectedBooking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};