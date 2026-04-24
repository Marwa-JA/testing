import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Chip } from 'primereact/chip';
import { Rating } from 'primereact/rating';
import { Avatar } from 'primereact/avatar';

import { reviewService } from '../services/reviewService';
import {useAuth} from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import events from '../images/events.jpg'


export const EventDetailsView = ({ event, onBack }) => {
  const navigate = useNavigate();
  const {user} = useAuth();
  const eventDate = event.eventDateTime;

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const [list, avgData] = await Promise.all([
          reviewService.getEventReviews(event.id),
          reviewService.getEventAverageRating(event.id)
        ]);
        setReviews(list);
        setAverageRating(avgData.average > 0 ? avgData.average : null);
      } catch {
        // reviews are non-critical, fail silently
      }
    };
    loadReviews();
  }, [event.id]);
  const imageUrl = event.imageUrls && event.imageUrls.length > 0 ? event.imageUrls[0] : events;

  const handleBooking = () => {
    navigate(`/booking/${event.id}`);
  };

  const statusSeverity = {
    'ACTIVE': 'success',
    'DRAFT': 'info',
    'CANCELED': 'danger',
    'COMPLETED': 'secondary'
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Button 
        label="Back to Events" 
        icon="pi pi-arrow-left" 
        className="p-button-text mb-3"
        onClick={onBack}
      />

      <div className="grid">
        <div className="col-12 lg:col-8">
          <Card>
            <img 
              src={imageUrl} 
              alt={event.title} 
              className="w-full border-round mb-4"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            
            <div className="flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <h1 className="text-4xl font-bold m-0">{event.title}</h1>
              <div className="flex gap-2">
                <Tag 
                  value={event.eventType === 'HOST_PACKAGE' ? 'Host Package' : 'Public Event'}
                  severity={event.eventType === 'HOST_PACKAGE' ? 'warning' : 'success'}
                  className="text-lg"
                />
                <Tag 
                  value={event.status}
                  severity={statusSeverity[event.status]}
                />
              </div>
            </div>

            <div className="mb-3">
              {event.bookingEnabled && <Chip label="Booking Open" icon="pi pi-check-circle" className="bg-green-100 text-green-900" />}
              {!event.bookingEnabled && <Chip label="Booking Temporarily Closed" icon="pi pi-times-circle" className="bg-danger-100 text-danger-900" />}
            </div>

            <Divider />

            <h3 className="text-2xl font-semibold mb-3">About This Event</h3>
            <p className="text-gray-700 line-height-3 mb-4">{event.description}</p>

            <Divider />

            <h3 className="text-2xl font-semibold mb-3">Event Details</h3>
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="flex align-items-center gap-3 mb-3">
                  <i className="pi pi-calendar text-primary text-2xl"></i>
                  <div>
                    <div className="text-sm text-gray-600">
                      {event.eventType === 'HOST_PACKAGE' ? 'Available From' : 'Date'}
                    </div>
                    <div className="font-semibold">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-12 md:col-6">
                <div className="flex align-items-center gap-3 mb-3">
                  <i className="pi pi-clock text-primary text-2xl"></i>
                  <div>
                    <div className="text-sm text-gray-600">
                      {event.eventType === 'HOST_PACKAGE' ? 'Available From (Time)' : 'Time'}
                    </div>
                    <div className="font-semibold">
                      {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-12 md:col-6">
                <div className="flex align-items-center gap-3 mb-3">
                  <i className="pi pi-map-marker text-primary text-2xl"></i>
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-semibold">{event.location}, {event.city}</div>
                  </div>
                </div>
              </div>
              
              <div className="col-12 md:col-6">
                <div className="flex align-items-center gap-3 mb-3">
                  <i className="pi pi-users text-primary text-2xl"></i>
                  <div>
                    <div className="text-sm text-gray-600">Availability</div>
                    <div className="font-semibold">{event.availableSeats} / {event.capacity} spots available</div>
                  </div>
                </div>
              </div>

              {event.totalBookings > 0 && (
                <div className="col-12 md:col-6">
                  <div className="flex align-items-center gap-3 mb-3">
                    <i className="pi pi-ticket text-primary text-2xl"></i>
                    <div>
                      <div className="text-sm text-gray-600">Total Bookings</div>
                      <div className="font-semibold">{event.totalBookings} bookings</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {event.videoUrl && (
              <>
                <Divider />
                <h3 className="text-2xl font-semibold mb-3">Event Video</h3>
                <video
                  src={event.videoUrl}
                  controls
                  className="w-full border-round"
                  style={{ maxHeight: '400px' }}
                />
              </>
            )}

            {event.supplierNotes && (
              <>
                <Divider />
                <h3 className="text-2xl font-semibold mb-3">Additional Information</h3>
                <p className="text-gray-700 line-height-3">{event.supplierNotes}</p>
              </>
            )}

            <Divider />
            <div className="flex align-items-center justify-content-between mb-3">
              <h3 className="text-2xl font-semibold m-0">Reviews</h3>
              {averageRating && (
                <div className="flex align-items-center gap-2">
                  <Rating value={Math.round(averageRating)} readOnly cancel={false} stars={5} />
                  <span className="font-bold text-lg">{averageRating}</span>
                  <span className="text-gray-500 text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to rate this event!</p>
            ) : (
              <div className="flex flex-column gap-3">
                {reviews.map(review => (
                  <div key={review.id} className="p-3 border-round surface-50 border-1 border-200">
                    <div className="flex align-items-center gap-2 mb-2">
                      <Avatar label={review.userName?.[0]?.toUpperCase() || '?'} shape="circle" size="normal" />
                      <span className="font-semibold">{review.userName}</span>
                      <Rating value={review.rating} readOnly cancel={false} stars={5} className="ml-auto" />
                    </div>
                    {review.comment && <p className="text-gray-700 m-0">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="col-12 lg:col-4">
          <Card className="sticky" style={{ top: '20px' }}>
            <div className="text-center mb-4">
              <div className="text-gray-600 mb-2">
                {event.eventType === 'HOST_PACKAGE' ? 'Package Price' : 'Ticket Price'}
              </div>
              <div className="text-5xl font-bold text-primary">${event.ticketPrice.toFixed(2)}</div>
              {event.eventType === 'HOST_PACKAGE' && (
                <div className="text-sm text-gray-600 mt-2">Base package price</div>
              )}
            </div>

            <Divider />

            <div className="flex flex-column gap-3">
              <Button
                label="Go to Checkout"
                icon="pi pi-shopping-cart"
                size="large"
                className="w-full"
                onClick={handleBooking}
                disabled={event.availableSeats === 0 || !event.bookingEnabled || event.status === "CANCELED"}
              />
              
              {event.availableSeats === 0 && (
                <div className="text-center text-red-500">
                  <i className="pi pi-exclamation-triangle mr-2"></i>
                  Sold Out
                </div>
              )}

              {!event.bookingEnabled && event.availableSeats > 0 && (
                <div className="text-center text-orange-500">
                  <i className="pi pi-info-circle mr-2"></i>
                  Bookings Currently Closed
                </div>
              )}
              
              <Button
                label="Contact Organizer"
                icon="pi pi-envelope"
                className="p-button-outlined w-full"
                onClick={() => { if (event.organizerEmail) window.location.href = `mailto:${event.organizerEmail}`; }}
                disabled={!event.organizerEmail}
              />
            </div>

            <Divider />

            <div className="text-sm text-gray-600 text-center">
              <i className="pi pi-info-circle mr-2"></i>
              Free cancellation up to 24 hours before the event
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};