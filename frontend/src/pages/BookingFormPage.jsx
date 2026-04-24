import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { eventService } from '../services/eventService';
import { bookingService } from '../services/bookingService';
import { supplierService } from '../services/supplierService';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

export const BookingFormPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '', holder: '' });
  const [userInfo, setUserInfo] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phoneNumber || ''
  });
  const toast = useRef(null);

  const paymentMethods = [
    { label: 'Credit Card', value: 'CREDIT_CARD', icon: 'pi pi-credit-card' },
    { label: 'PayPal', value: 'PAYPAL', icon: 'pi pi-paypal' },
    { label: 'Cash', value: 'CASH', icon: 'pi pi-money-bill' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER', icon: 'pi pi-building' }
  ];

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const foundEvent = await eventService.getEventById(eventId);
      setEvent(foundEvent);
      if (foundEvent.eventType === 'HOST_PACKAGE') {
        const services = await supplierService.getAvailableServices();
        const suppliers = await supplierService.getAllSuppliers();
        const supplierMap = {};
        suppliers.forEach(s => { supplierMap[s.id] = s; });
        const enriched = services.map(svc => ({
          ...svc,
          category: supplierMap[svc.supplierId]?.serviceType || 'OTHER'
        }));
        setAvailableServices(enriched);

        try {
          const dates = await bookingService.getBookedDates(eventId);
          setBookedDates(dates.map(d => {
            const [y, m, day] = d.split('-');
            return new Date(parseInt(y), parseInt(m) - 1, parseInt(day));
          }));
        } catch {
          // non-critical
        }
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load event'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const validateCardInfo = () => {
    if (paymentMethod !== 'CREDIT_CARD') return true;
    const { holder, number, expiry, cvv } = cardInfo;
    if (!holder.trim() || !number.trim() || !expiry.trim() || !cvv.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all credit card fields' });
      return false;
    }
    const digits = number.replace(/\s/g, '');
    if (digits.length < 13 || digits.length > 19 || !/^\d+$/.test(digits)) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please enter a valid card number' });
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Expiry must be in MM/YY format' });
      return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'CVV must be 3 or 4 digits' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (event.eventType === 'HOST_PACKAGE' && !selectedDateTime) {
      toast.current?.show({ severity: 'warn', summary: 'Date Required', detail: 'Please select a date and time for your booking' });
      return;
    }
    if (!validateCardInfo()) return;

    // Simulate payment failure for test card number
    if (paymentMethod === 'CREDIT_CARD' && cardInfo.number.replace(/\s/g, '') === '4000000000000002') {
      toast.current?.show({
        severity: 'error',
        summary: 'Payment Failed',
        detail: 'Your card was declined. Please try a different payment method.'
      });
      return;
    }

    setSubmitting(true);
    const userId = currentUser?.id || currentUser?.uid;

    try {
      const bookingData = {
        eventId: event.id,
        numberOfSeats: ticketCount,
        paymentMethod: paymentMethod,
        selectedServiceIds: selectedServiceIds.length > 0 ? selectedServiceIds : null,
        selectedDateTime: selectedDateTime ? selectedDateTime.toISOString() : null,
      };

      const response = await bookingService.createBooking(userId, bookingData);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Booking confirmed!'
      });

      setTimeout(() => {
        navigate(`/booking-confirmation/${response.booking.id}`);
      }, 1000);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-6 px-4 text-center">
        <i className="pi pi-exclamation-circle text-6xl text-gray-400 mb-3"></i>
        <h2 className="text-3xl text-gray-600 mb-3">Event Not Found</h2>
        <Button label="Back" icon="pi pi-arrow-left" onClick={() => navigate(-1)} />
      </div>
    );
  }

  const eventDate = event.eventDateTime?.seconds
    ? new Date(event.eventDateTime.seconds * 1000)
    : new Date(event.eventDateTime);
  const servicesTotal = availableServices
    .filter(s => selectedServiceIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);
  const totalPrice = (event.ticketPrice * ticketCount) + servicesTotal;
  const imageUrl = event.imageUrls && event.imageUrls.length > 0 ? event.imageUrls[0] : '';

  return (
    <div className="container mx-auto py-6 px-4">
      <Toast ref={toast} />
      
      <Button 
        label="Back to Event" 
        icon="pi pi-arrow-left" 
        className="p-button-text mb-3"
        onClick={() => navigate(-1)}
      />

      <div className="grid">
        <div className="col-12 lg:col-8">
          <Card>
            <h2 className="text-3xl font-bold mb-4">Complete Your Booking</h2>
            
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-3">Event Details</h3>
              <div className="flex gap-3 p-3 border-1 border-200 border-round">
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt={event.title}
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    className="border-round"
                  />
                )}
                <div className="flex-1">
                  <div className="flex align-items-center gap-2 mb-2">
                    <h4 className="text-xl font-bold m-0">{event.title}</h4>
                    <Tag 
                      value={event.eventType === 'HOST_PACKAGE' ? 'Host' : 'Public'}
                      severity={event.eventType === 'HOST_PACKAGE' ? 'warning' : 'success'}
                    />
                  </div>
                  <div className="flex flex-column gap-1 text-sm text-gray-700">
                    <div>
                      <i className="pi pi-calendar mr-2"></i>
                      {event.eventType === 'HOST_PACKAGE' ? 'Available from: ' : ''}{eventDate.toLocaleDateString()}
                    </div>
                    <div>
                      <i className="pi pi-clock mr-2"></i>
                      {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div><i className="pi pi-map-marker mr-2"></i>{event.location}, {event.city}</div>
                  </div>
                </div>
              </div>
            </div>

            {event.eventType === 'HOST_PACKAGE' && (
              <>
                <Divider />
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-3">Select Your Date & Time</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Choose your preferred date and time. Dates already booked are unavailable.
                  </p>
                  <Calendar
                    value={selectedDateTime}
                    onChange={(e) => setSelectedDateTime(e.value)}
                    showTime
                    hourFormat="12"
                    minDate={eventDate}
                    viewDate={eventDate}
                    disabledDates={bookedDates}
                    inline
                    className="w-full"
                  />
                  {selectedDateTime && (
                    <div className="mt-2 p-2 border-round surface-100 text-sm">
                      <i className="pi pi-check-circle text-green-500 mr-2"></i>
                      Selected: {selectedDateTime.toLocaleDateString()} at {selectedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </>
            )}

            <Divider />

            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-3">
                {event.eventType === 'HOST_PACKAGE' ? 'Package Details' : 'Ticket Selection'}
              </h3>
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label className="block text-900 font-medium mb-2">
                    {event.eventType === 'HOST_PACKAGE' ? 'Number of Packages' : 'Number of Tickets'}
                  </label>
                  <InputNumber 
                    value={ticketCount}
                    onValueChange={(e) => setTicketCount(e.value)}
                    min={1}
                    max={event.availableSeats}
                    showButtons
                    className="w-full"
                  />
                </div>
                <div className="col-12 md:col-6">
                  <label className="block text-900 font-medium mb-2">Price Per {event.eventType === 'HOST_PACKAGE' ? 'Package' : 'Ticket'}</label>
                  <div className="text-2xl font-bold text-primary">${event.ticketPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <Divider />

            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-3">Your Information</h3>
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label className="block text-900 font-medium mb-2">Full Name</label>
                  <InputText 
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="col-12 md:col-6">
                  <label className="block text-900 font-medium mb-2">Email</label>
                  <InputText 
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="col-12 md:col-6">
                  <label className="block text-900 font-medium mb-2">Phone Number</label>
                  <InputText 
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {event.eventType === 'HOST_PACKAGE' && availableServices.length > 0 && (() => {
              const categoryLabels = {
                CATERING: 'Catering', DECORATION: 'Decoration', ENTERTAINMENT: 'Entertainment',
                PHOTOGRAPHY: 'Photography', VENUE: 'Venue', EQUIPMENT: 'Equipment', OTHER: 'Other'
              };
              const grouped = availableServices.reduce((acc, svc) => {
                const cat = svc.category || 'OTHER';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(svc);
                return acc;
              }, {});
              return (
                <>
                  <Divider />
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-1">Add Provider Services</h3>
                    <p className="text-sm text-gray-500 mb-3">Optional services you can add to your package</p>
                    {Object.entries(grouped).map(([category, services]) => (
                      <div key={category} className="mb-3">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">
                          <Tag value={categoryLabels[category] || category} severity="info" className="mr-2" />
                        </h4>
                        <div className="flex flex-column gap-2">
                          {services.map(service => (
                            <div key={service.id} className="flex align-items-center justify-content-between p-3 border-1 border-200 border-round">
                              <div className="flex align-items-center gap-3">
                                <Checkbox
                                  inputId={service.id}
                                  checked={selectedServiceIds.includes(service.id)}
                                  onChange={() => toggleService(service.id)}
                                />
                                <div>
                                  <label htmlFor={service.id} className="font-medium cursor-pointer">{service.name}</label>
                                  {service.description && (
                                    <div className="text-sm text-gray-500">{service.description}</div>
                                  )}
                                </div>
                              </div>
                              <span className="font-semibold text-primary">${service.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            <Divider />

            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-3">Payment Method</h3>
              <Dropdown
                value={paymentMethod}
                options={paymentMethods}
                onChange={(e) => setPaymentMethod(e.value)}
                className="w-full mb-3"
                itemTemplate={(option) => (
                  <div className="flex align-items-center gap-2">
                    <i className={option.icon}></i>
                    <span>{option.label}</span>
                  </div>
                )}
                valueTemplate={(option) => option ? (
                  <div className="flex align-items-center gap-2">
                    <i className={option.icon}></i>
                    <span>{option.label}</span>
                  </div>
                ) : 'Select payment method'}
              />

              {paymentMethod === 'CREDIT_CARD' && (
                <div className="p-3 border-1 border-200 border-round surface-50">
                  <div className="grid">
                    <div className="col-12">
                      <label className="block text-900 font-medium mb-2">Card Holder Name</label>
                      <InputText
                        value={cardInfo.holder}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, holder: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full"
                      />
                    </div>
                    <div className="col-12">
                      <label className="block text-900 font-medium mb-2">Card Number</label>
                      <InputText
                        value={cardInfo.number}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, number: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full"
                      />
                    </div>
                    <div className="col-6">
                      <label className="block text-900 font-medium mb-2">Expiry Date</label>
                      <InputText
                        value={cardInfo.expiry}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, expiry: e.target.value }))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full"
                      />
                    </div>
                    <div className="col-6">
                      <label className="block text-900 font-medium mb-2">CVV</label>
                      <InputText
                        value={cardInfo.cvv}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="123"
                        maxLength={4}
                        type="password"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    <i className="pi pi-lock mr-1"></i>
                    This is a demo payment form. No real transaction will be processed.
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    <i className="pi pi-info-circle mr-1"></i>
                    Use card number <strong>4000 0000 0000 0002</strong> to test a declined payment.
                  </div>
                </div>
              )}

              {paymentMethod === 'PAYPAL' && (
                <div className="p-3 border-1 border-200 border-round surface-50 text-center">
                  <i className="pi pi-paypal text-4xl text-blue-500 mb-2"></i>
                  <p className="text-sm text-gray-600 m-0">You will be redirected to PayPal to complete payment (demo).</p>
                </div>
              )}

              {paymentMethod === 'CASH' && (
                <div className="p-3 border-1 border-200 border-round surface-50">
                  <i className="pi pi-money-bill text-2xl text-green-600 mr-2"></i>
                  <span className="text-sm text-gray-600">Pay with cash at the event venue on the day of the event.</span>
                </div>
              )}

              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="p-3 border-1 border-200 border-round surface-50">
                  <i className="pi pi-building text-2xl text-purple-600 mr-2"></i>
                  <span className="text-sm text-gray-600">Bank transfer details will be sent to your email after booking (demo).</span>
                </div>
              )}
            </div>

            <Divider />

            <div className="flex align-items-center justify-content-between mb-4">
              <h3 className="text-xl font-semibold m-0">Total Amount</h3>
              <div className="text-4xl font-bold text-primary">${totalPrice.toFixed(2)}</div>
            </div>

            <Button 
              label="Confirm Booking" 
              icon="pi pi-check"
              onClick={handleSubmit}
              className="w-full"
              size="large"
              loading={submitting}
            />
          </Card>
        </div>

        <div className="col-12 lg:col-4">
          <Card className="sticky" style={{ top: '20px' }}>
            <h3 className="text-xl font-semibold mb-3">Booking Summary</h3>
            
            <div className="flex flex-column gap-3">
              <div className="flex justify-content-between">
                <span className="text-gray-600">Event</span>
                <span className="font-semibold text-right">{event.title}</span>
              </div>
              
              {event.eventType === 'HOST_PACKAGE' && selectedDateTime && (
                <div className="flex justify-content-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold text-right">
                    {selectedDateTime.toLocaleDateString()} {selectedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              <div className="flex justify-content-between">
                <span className="text-gray-600">{event.eventType === 'HOST_PACKAGE' ? 'Packages' : 'Tickets'}</span>
                <span className="font-semibold">{ticketCount}</span>
              </div>
              
              <div className="flex justify-content-between">
                <span className="text-gray-600">Price per {event.eventType === 'HOST_PACKAGE' ? 'package' : 'ticket'}</span>
                <span className="font-semibold">${event.ticketPrice.toFixed(2)}</span>
              </div>
              
              {selectedServiceIds.length > 0 && (
                <div className="flex justify-content-between">
                  <span className="text-gray-600">Provider Services ({selectedServiceIds.length})</span>
                  <span className="font-semibold">${servicesTotal.toFixed(2)}</span>
                </div>
              )}

              <Divider />

              <div className="flex justify-content-between">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <Divider />

            <div className="text-sm text-gray-600">
              <i className="pi pi-info-circle mr-2"></i>
              Free cancellation up to 24 hours before the event
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};