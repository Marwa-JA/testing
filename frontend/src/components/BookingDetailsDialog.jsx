import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { QRCodeSVG } from 'qrcode.react';
import { supplierService } from '../services/supplierService';

export const BookingDetailsDialog = ({ booking, visible, onHide, onCancel }) => {
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    if (booking?.selectedServiceIds?.length > 0 && visible) {
      Promise.all(
        booking.selectedServiceIds.map(id => supplierService.getServiceById(id).catch(() => null))
      ).then(services => setSelectedServices(services.filter(Boolean)));
    } else {
      setSelectedServices([]);
    }
  }, [booking, visible]);

  if (!booking) return null;

  const parseDate = (value) => {
  if (!value) return null;
  if (value?.seconds) return new Date(value.seconds * 1000);
  if (value instanceof Date) return value;
  return new Date(value);
  }

const eventDate = parseDate(booking.eventDateTime);
const bookingDate = parseDate(booking.bookingDate);
const isUpcoming = eventDate && eventDate > new Date();

  const getStatusSeverity = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELED': return 'danger';
      case 'COMPLETED': return 'info';
      default: return 'info';
    }
  };

  const footer = (
    <div className="flex gap-2">
      <Button label="Close" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      {isUpcoming && booking.status === 'CONFIRMED' && (
        <Button 
          label="Cancel Booking" 
          icon="pi pi-trash" 
          className="p-button-danger"
          onClick={() => onCancel(booking)}
        />
      )}
    </div>
  );

  return (
    <Dialog
      header="Booking Details"
      visible={visible}
      style={{ width: '600px' }}
      onHide={onHide}
      footer={footer}
    >
      <div className="flex flex-column gap-3">
        <div className="flex align-items-center justify-content-between">
          <h2 className="text-2xl font-bold m-0">{booking.eventTitle}</h2>
          <Tag 
            value={booking.status}
            severity={getStatusSeverity(booking.status)}
            className="text-lg"
          />
        </div>

        <Divider />

        <div className="grid">
          <div className="col-12">
            <div className="flex align-items-center gap-3 mb-3">
              <i className="pi pi-hashtag text-primary text-xl"></i>
              <div>
                <div className="text-sm text-gray-600">Reference Number</div>
                <div className="font-bold font-mono">{booking.referenceNumber}</div>
              </div>
            </div>
          </div>

          {booking.referenceNumber && (
            <div className="col-12 flex justify-content-center mb-2">
              <div className="text-center p-3 border-1 border-200 border-round bg-white">
                <QRCodeSVG value={booking.referenceNumber} size={120} level="H" />
                <div className="text-xs text-gray-500 mt-1">Digital Ticket</div>
              </div>
            </div>
          )}

          <div className="col-12 md:col-6">
            <div className="flex align-items-center gap-3 mb-3">
              <i className="pi pi-calendar text-primary text-xl"></i>
              <div>
                <div className="text-sm text-gray-600">Event Date</div>
                <div className="font-semibold">
                  {eventDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="flex align-items-center gap-3 mb-3">
              <i className="pi pi-clock text-primary text-xl"></i>
              <div>
                <div className="text-sm text-gray-600">Time</div>
                <div className="font-semibold">
                  {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="flex align-items-center gap-3 mb-3">
              <i className="pi pi-map-marker text-primary text-xl"></i>
              <div>
                <div className="text-sm text-gray-600">Location</div>
                <div className="font-semibold">{booking.eventLocation}</div>
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="flex align-items-center gap-3 mb-3">
              <i className="pi pi-ticket text-primary text-xl"></i>
              <div>
                <div className="text-sm text-gray-600">Tickets</div>
                <div className="font-semibold">{booking.numberOfSeats} ticket{booking.numberOfSeats > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="flex align-items-center gap-3 mb-3">
              <i className="pi pi-tag text-primary text-xl"></i>
              <div>
                <div className="text-sm text-gray-600">Event Type</div>
                <div className="font-semibold">
                  {booking.eventType === 'HOST_PACKAGE' ? 'Host Package' : 'Public Event'}
                </div>
              </div>
            </div>
          </div>

          {selectedServices.length > 0 && (
            <div className="col-12">
              <Divider />
              <div className="text-sm text-gray-600 mb-2 font-semibold">Provider Services</div>
              <div className="flex flex-column gap-2">
                {selectedServices.map(service => (
                  <div key={service.id} className="flex align-items-center justify-content-between p-2 border-1 border-200 border-round">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-gray-500">{service.description}</div>
                      )}
                    </div>
                    <span className="font-semibold">${service.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="col-12">
            <Divider />
            <div className="flex align-items-center justify-content-between">
              <div>
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-3xl font-bold text-primary">${booking.totalPrice.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Booking Date</div>
                <div className="font-semibold">{bookingDate.toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {booking.status === 'CONFIRMED' && isUpcoming && (
          <div className="p-3 bg-blue-50 border-round">
            <i className="pi pi-info-circle text-blue-700 mr-2"></i>
            <span className="text-blue-900 text-sm">
              Free cancellation available up to 24 hours before the event
            </span>
          </div>
        )}
      </div>
    </Dialog>
  );
};