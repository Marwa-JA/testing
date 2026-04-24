import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { bookingService } from '../services/bookingService';
import { supplierService } from '../services/supplierService';


export const BookingConfirmationPage = () => {
  const [booking, setBooking] = useState();
  const [selectedServices, setSelectedServices] = useState([]);
  const navigate = useNavigate();
  const {bookingId} = useParams();

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    const response = await bookingService.getBookingById(bookingId);
    setBooking(response);
    if (response?.selectedServiceIds?.length > 0) {
      const services = await Promise.all(
        response.selectedServiceIds.map(id => supplierService.getServiceById(id).catch(() => null))
      );
      setSelectedServices(services.filter(Boolean));
    }
  }

  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid">
        <div className="col-12 md:col-8 mx-auto">
          <Card>
            <div className="text-center mb-4">
              <div className="inline-flex align-items-center justify-content-center border-circle bg-green-100 mb-3" 
                   style={{ width: '120px', height: '120px' }}>
                <i className="pi pi-check text-6xl text-green-600"></i>
              </div>
              <h1 className="text-4xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
              <p className="text-xl text-gray-600">Your booking has been successfully confirmed</p>
            </div>

            <Divider />

            <div className="mb-4">
              <div className="p-4 bg-blue-50 border-round mb-4">
                <div className="flex align-items-center gap-3">
                  <i className="pi pi-envelope text-3xl text-blue-600"></i>
                  <div>
                    <div className="font-semibold text-blue-900">Confirmation Email Sent</div>
                    <div className="text-sm text-blue-700">
                      We've sent a confirmation email to <strong>{booking?.userEmail}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">Booking Details</h3>

              {booking?.referenceNumber && (
                <div className="flex justify-content-center mb-4">
                  <div className="text-center p-4 border-1 border-200 border-round bg-white">
                    <QRCodeSVG value={booking.referenceNumber} size={160} level="H" />
                    <div className="text-sm text-gray-500 mt-2">Your Digital Ticket</div>
                  </div>
                </div>
              )}

              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="mb-3">
                    <label className="text-gray-600 text-sm">Reference Number</label>
                    <div className="font-bold font-mono text-lg">{booking?.referenceNumber}</div>
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="mb-3">
                    <label className="text-gray-600 text-sm">Total Amount</label>
                    <div className="font-bold text-primary text-xl">${booking?.totalPrice?.toFixed(2)}</div>
                  </div>
                </div>

                {booking?.eventTitle && (
                  <div className="col-12 md:col-6">
                    <div className="mb-3">
                      <label className="text-gray-600 text-sm">Event</label>
                      <div className="font-semibold">{booking.eventTitle}</div>
                    </div>
                  </div>
                )}

                {booking?.numberOfSeats && (
                  <div className="col-12 md:col-6">
                    <div className="mb-3">
                      <label className="text-gray-600 text-sm">Seats</label>
                      <div className="font-semibold">{booking.numberOfSeats}</div>
                    </div>
                  </div>
                )}
              </div>

              {selectedServices.length > 0 && (
                <>
                  <Divider />
                  <h3 className="text-xl font-semibold mb-3">Provider Services</h3>
                  <div className="flex flex-column gap-2">
                    {selectedServices.map(service => (
                      <div key={service.id} className="flex align-items-center justify-content-between p-3 border-1 border-200 border-round">
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
                </>
              )}
            </div>

            <Divider />

            <div className="flex flex-column md:flex-row gap-3">
              <Button 
                label="View My Bookings" 
                icon="pi pi-list"
                className="flex-1"
                onClick={() => navigate("/bookings")}
              />
              <Button 
                label="Browse More Events" 
                icon="pi pi-search"
                className="p-button-outlined flex-1"
                onClick={() => navigate("/events")}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};