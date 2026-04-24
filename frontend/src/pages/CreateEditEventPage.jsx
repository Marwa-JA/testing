import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { useAuth } from '../auth/AuthContext';

export const CreateEditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingVideo, setPendingVideo] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'PUBLIC_EVENT',
    location: '',
    city: '',
    eventDateTime: null,
    ticketPrice: 0,
    capacity: 0,
    imageUrls: [],
    supplierNotes: '',
    status: 'ACTIVE',
    bookingEnabled: true,
    availableSeats: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {

  const fetchEvent = async () => {
    if (eventId) {
      try {
        const eventData = await eventService.getEventById(eventId);
        setFormData({
          ...eventData,
          eventDateTime: eventData.eventDateTime ? new Date(eventData.eventDateTime) : null
        });
      } catch (err) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load event data'
        });
      }
    }
  };

  fetchEvent();
}, [eventId]);

  const eventTypeOptions = [
    { label: 'Public Event', value: 'PUBLIC_EVENT' },
    { label: 'Host Package', value: 'HOST_PACKAGE' }
  ];

  const statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Canceled', value: 'CANCELED' },
    { label: 'Completed', value: 'COMPLETED' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e) => {
    setPendingFiles(Array.from(e.files));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.city || !formData.location || !formData.eventDateTime) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        eventDateTime: formData.eventDateTime.toISOString(),
        availableSeats: formData.capacity - (formData.totalBookings || 0),
        totalBookings: formData.totalBookings || 0,
        totalRevenue: formData.totalRevenue || 0,
        organizerEmail: currentUser?.email || null
      };

      let savedEvent;
      if (eventId) {
        savedEvent = await eventService.updateEvent(eventId, payload);
      } else {
        savedEvent = await eventService.createEvent(payload);
      }

      for (const file of pendingFiles) {
        await eventService.uploadEventMedia(savedEvent.id, file);
      }

      if (pendingVideo) {
        await eventService.uploadEventVideo(savedEvent.id, pendingVideo);
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: eventId ? 'Event updated successfully' : 'Event created successfully'
      });

      setTimeout(() => navigate('/organizer/events'), 1000);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Something went wrong'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/organizer/events');

  return (
    <div className="container mx-auto py-6 px-4">
      <Toast ref={toast} />
      <div className="flex align-items-center justify-content-between mb-4">
        <h1 className="text-4xl font-bold m-0">{eventId ? 'Edit Event' : 'Create New Event'}</h1>
        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={handleCancel} />
      </div>

      <div className="grid">
        <div className="col-12 lg:col-8">
          <Card>
            <div className="grid">
              <div className="col-12">
                <h3 className="text-xl font-semibold mb-3">Basic Information</h3>
              </div>
              <div className="col-12">
                <label>Event Title *</label>
                <InputText value={formData.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full" />
              </div>
              <div className="col-12">
                <label>Description *</label>
                <InputTextarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="w-full" rows={4} />
              </div>
              <div className="col-12 md:col-6">
                <label>Event Type *</label>
                <Dropdown value={formData.eventType} options={eventTypeOptions} onChange={(e) => handleChange('eventType', e.value)} className="w-full" />
              </div>
              <div className="col-12 md:col-6">
                <label>Status *</label>
                <Dropdown value={formData.status} options={statusOptions} onChange={(e) => handleChange('status', e.value)} className="w-full" />
              </div>

              <div className="col-12">
                <Divider />
                <h3>Location Details</h3>
              </div>
              <div className="col-12 md:col-6">
                <label>City *</label>
                <InputText value={formData.city} onChange={(e) => handleChange('city', e.target.value)} className="w-full" />
              </div>
              <div className="col-12 md:col-6">
                <label>Venue/Location *</label>
                <InputText value={formData.location} onChange={(e) => handleChange('location', e.target.value)} className="w-full" />
              </div>

              <div className="col-12">
                <Divider />
                <h3>Date & Time</h3>
              </div>
              <div className="col-12 md:col-6">
                <label>Event Date & Time *</label>
                <Calendar value={formData.eventDateTime} onChange={(e) => handleChange('eventDateTime', e.value)} showTime hourFormat="12" className="w-full" />
              </div>

              <div className="col-12">
                <Divider />
                <h3>Pricing & Capacity</h3>
              </div>
              <div className="col-12 md:col-4">
                <label>{formData.eventType === 'HOST_PACKAGE' ? 'Package Price ($)' : 'Ticket Price ($)'}</label>
                <InputNumber value={formData.ticketPrice} onValueChange={(e) => handleChange('ticketPrice', e.value)} mode="currency" currency="USD" locale="en-US" className="w-full" min={0} />
              </div>
              <div className="col-12 md:col-4">
                <label>Capacity *</label>
                <InputNumber value={formData.capacity} onValueChange={(e) => handleChange('capacity', e.value)} className="w-full" min={1} />
              </div>
              <div className="col-12 md:col-4">
                <div className="flex align-items-center h-5rem">
                <Checkbox checked={formData.bookingEnabled} onChange={(e) => handleChange('bookingEnabled', e.checked)} />
                <label>Enable Bookings</label>
                </div>
              </div>

              <div className="col-12">
                <Divider />
                <h3>Media</h3>
              </div>
              <div className="col-12">
                <label>Event Images</label>
                <FileUpload name="eventImages" multiple accept="image/*" maxFileSize={5000000} chooseLabel="Select Images" onSelect={handleFileSelect} />
              </div>
              <div className="col-12">
                <label>Event Video</label>
                <FileUpload name="eventVideo" accept="video/*" maxFileSize={100000000} chooseLabel="Select Video" onSelect={(e) => setPendingVideo(e.files[0] || null)} />
                {formData.videoUrl && (
                  <p className="text-sm text-green-600 mt-1"><i className="pi pi-check-circle mr-1"></i>Video already uploaded</p>
                )}
              </div>

              <div className="col-12">
                <Divider />
                <h3>Additional Information</h3>
              </div>
              <div className="col-12">
                <label>Provider Notes</label>
                <InputTextarea value={formData.supplierNotes} onChange={(e) => handleChange('supplierNotes', e.target.value)} className="w-full" rows={4} />
              </div>
            </div>

            <Divider />

            <div className="flex gap-3 justify-content-end mt-4">
              <Button label="Cancel" icon="pi pi-times" className="p-button-outlined" onClick={handleCancel} />
              <Button label={eventId ? 'Update Event' : 'Create Event'} icon="pi pi-check" onClick={handleSubmit} loading={loading} />
            </div>
          </Card>
        </div>

        <div className="col-12 lg:col-4">
          <Card className="sticky" style={{ top: '20px' }}>
            <h3>Event Preview</h3>
            <p><strong>Title:</strong> {formData.title || 'Untitled Event'}</p>
            <p><strong>Type:</strong> {formData.eventType === 'HOST_PACKAGE' ? 'Host Package' : 'Public Event'}</p>
            <p><strong>Location:</strong> {formData.location || 'Not set'}, {formData.city || 'Not set'}</p>
            <p><strong>Date & Time:</strong> {formData.eventDateTime ? formData.eventDateTime.toLocaleString() : 'Not set'}</p>
            <p><strong>Price:</strong> ${(formData.ticketPrice || 0).toFixed(2)}</p>
            <p><strong>Capacity:</strong> {formData.capacity || 0} spots</p>
            <p><strong>Status:</strong> {formData.status}</p>
            <p><strong>Bookings:</strong> {formData.bookingEnabled ? 'Enabled' : 'Disabled'}</p>
            {(formData.imageUrls?.length > 0 || pendingFiles.length > 0) && (
              <p><strong>Images:</strong> {formData.imageUrls?.length || 0} saved{pendingFiles.length > 0 ? `, ${pendingFiles.length} pending upload` : ''}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};