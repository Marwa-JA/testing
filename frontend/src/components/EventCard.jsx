import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import events from '../images/events.jpg'

export const EventCard = ({ event, onViewDetails }) => {
  const eventDate = event.eventDateTime ? new Date(event.eventDateTime) : null;
  const imageUrl = event.imageUrls && event.imageUrls.length > 0 
    ? event.imageUrls[0] 
    : events;

  return (
    <Card
      header={
        <div className="relative" style={{ height: '200px'}}>
          <img alt={event.title} src={imageUrl} className="w-full" style={{ height: '200px', objectFit: 'cover' }} />
          {event.availableSeats === 0 && <Badge value="Sold Out" severity="danger" className="absolute" style={{ top: '10px', right: '10px' }} />}
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button
            label={event.eventType === 'HOST_PACKAGE' ? 'View Package' : 'View Details'}
            icon="pi pi-eye"
            className="flex-1"
            onClick={() => onViewDetails(event.id)}
          />
        </div>
      }
      className="h-full"
    >
      <div className="flex flex-column gap-2">
        <div className="flex align-items-start justify-content-between gap-2">
          <h3 className="m-0 text-xl font-bold flex-1">{event.title}</h3>
          <Tag
            value={event.eventType === 'HOST_PACKAGE' ? 'Host' : 'Public'}
            severity={event.eventType === 'HOST_PACKAGE' ? 'warning' : 'success'}
          />
        </div>

        <p className="text-gray-600 m-0 line-height-3" style={{ minHeight: '60px' }}>
          {event.description.substring(0, 100)}...
        </p>

        <div className="flex flex-column gap-2 mt-2">
          {eventDate && (
            <div className="flex align-items-center gap-2">
              <i className="pi pi-calendar text-primary"></i>
              <span className="text-sm">{eventDate.toLocaleDateString()}</span>
              <i className="pi pi-clock text-primary ml-2"></i>
              <span className="text-sm">{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

          <div className="flex align-items-center gap-2">
            <i className="pi pi-map-marker text-primary"></i>
            <span className="text-sm">{event.city}</span>
          </div>

          <div className="flex align-items-center justify-content-between mt-2">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-users text-primary"></i>
              <span className="text-sm font-semibold">
                {event.availableSeats > 0 ? `${event.availableSeats} spots left` : 'Sold Out'}
              </span>
            </div>
            <div className="text-2xl font-bold gradient-text">${event.ticketPrice.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};