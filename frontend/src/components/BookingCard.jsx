import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

export const BookingCard = ({ booking, onViewDetails, onCancel, onRate, onRateProvider }) => {
  const parseDate = (value) => {
    if (!value) return null;
    if (value?.seconds) return new Date(value.seconds * 1000);
    return new Date(value); 
  };

  const eventDate = parseDate(booking.eventDateTime);
  const bookingDate = parseDate(booking.bookingDate);
  const isUpcoming = eventDate > new Date();

  const getStatusSeverity = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELED': return 'danger';
      case 'COMPLETED': return 'info';
      default: return 'info';
    }
  };

  const header = (
    <div className="relative">
      <Tag 
        value={booking.status}
        severity={getStatusSeverity(booking.status)}
        className="absolute"
        style={{ top: '10px', right: '10px' }}
      />
    </div>
  );

  return (
    <Card header={header} className="h-full">
      <div className="flex flex-column gap-3">
        <div>
          <h3 className="text-xl font-bold mb-1">{booking.eventTitle}</h3>
        </div>

 <div className="flex flex-column gap-2">

          <div className="flex align-items-center gap-2">
            <i className="pi pi-calendar text-primary"></i>
            <span className="text-sm font-semibold">
              {eventDate?.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <i className="pi pi-clock text-primary ml-2"></i>
            <span className="text-sm font-semibold">
              {eventDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex align-items-center gap-2">
            <i className="pi pi-map-marker text-primary"></i>
            <span className="text-sm">{booking.eventLocation}</span>
          </div>

          <div className="flex align-items-center gap-2">
            <i className="pi pi-ticket text-primary"></i>
            <span className="text-sm">
              {booking.numberOfSeats} ticket{booking.numberOfSeats > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex align-items-center gap-2">
            <i className="pi pi-hashtag text-primary"></i>
            <span className="text-sm font-mono">{booking.referenceNumber}</span>
          </div>
        </div>

        <div className="flex align-items-center justify-content-between pt-2 border-top-1 border-200">
          <div className="text-2xl font-bold text-primary">
            ${booking.totalPrice.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            Booked: {bookingDate?.toLocaleDateString()}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            label="View Details"
            icon="pi pi-eye"
            className="flex-1"
            onClick={() => onViewDetails(booking)}
          />
          {isUpcoming && booking.status === 'CONFIRMED' && (
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-outlined p-button-danger"
              onClick={() => onCancel(booking)}
            />
          )}
          {!isUpcoming && booking.status === 'CONFIRMED' && onRate && (
            <Button
              label="Rate"
              icon="pi pi-star"
              className="p-button-outlined p-button-warning"
              onClick={() => onRate(booking)}
            />
          )}
          {!isUpcoming && booking.status === 'CONFIRMED' && onRateProvider && booking.selectedServiceIds?.length > 0 && (
            <Button
              label="Rate Provider"
              icon="pi pi-star-fill"
              className="p-button-outlined p-button-help"
              onClick={() => onRateProvider(booking)}
            />
          )}
        </div>
      </div>
    </Card>
  );
};