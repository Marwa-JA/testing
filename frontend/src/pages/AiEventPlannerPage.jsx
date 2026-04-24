import { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';

const EVENT_TYPE_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Public Event', value: 'PUBLIC_EVENT' },
  { label: 'Hostable Package', value: 'HOST_PACKAGE' },
];

const BUDGET_OPTIONS = [
  { label: 'Any budget', value: '' },
  { label: 'Under $1,000', value: 'Under $1,000' },
  { label: '$1,000 – $5,000', value: '$1,000–$5,000' },
  { label: '$5,000 – $15,000', value: '$5,000–$15,000' },
  { label: '$15,000 – $50,000', value: '$15,000–$50,000' },
  { label: 'Over $50,000', value: 'Over $50,000' },
];

export const AiEventPlannerPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    eventType: '',
    guestCount: null,
    budget: '',
    location: '',
    description: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleGenerate = async () => {
    setError('');
    setResults([]);
    setLoading(true);
    setSearched(true);
    try {
      const data = await eventService.planEvent({
        ...form,
        guestCount: form.guestCount ?? '',
      });
      setResults(data);
    } catch (err) {
      setError('Failed to get AI recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <i className="pi pi-sparkles mr-3 text-yellow-500"></i>
            AI Event Planner
          </h1>
          <p className="text-gray-600">
            Tell us what you're looking for and we'll recommend the best matching events from our catalogue.
          </p>
        </div>

        <Card className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label className="font-medium block mb-1">Event Type</label>
              <Dropdown
                value={form.eventType}
                options={EVENT_TYPE_OPTIONS}
                onChange={(e) => setForm(f => ({ ...f, eventType: e.value }))}
                placeholder="Any type"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="font-medium block mb-1">Expected Guests</label>
              <InputNumber
                value={form.guestCount}
                onValueChange={(e) => setForm(f => ({ ...f, guestCount: e.value }))}
                placeholder="e.g. 100"
                min={1}
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="font-medium block mb-1">Budget Range</label>
              <Dropdown
                value={form.budget}
                options={BUDGET_OPTIONS}
                onChange={(e) => setForm(f => ({ ...f, budget: e.value }))}
                placeholder="Any budget"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="font-medium block mb-1">Preferred Location</label>
              <InputText
                value={form.location}
                onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. New York, outdoor, downtown..."
                className="w-full"
              />
            </div>

            <div className="col-12">
              <label className="font-medium block mb-1">Short Description</label>
              <InputText
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. A relaxed corporate networking evening..."
                className="w-full"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3 m-0">
              <i className="pi pi-exclamation-circle mr-1"></i>{error}
            </p>
          )}

          <Button
            label={loading ? 'Finding Events...' : 'Find Matching Events'}
            icon="pi pi-sparkles"
            onClick={handleGenerate}
            loading={loading}
            disabled={loading}
            className="w-full mt-4"
          />
        </Card>

        {searched && !loading && results.length === 0 && !error && (
          <p className="text-center text-gray-500 mt-4">No matching events found. Try adjusting your criteria.</p>
        )}

        {results.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-3">
              <i className="pi pi-check-circle text-green-500 mr-2"></i>
              {results.length} Recommended Event{results.length > 1 ? 's' : ''}
            </h2>
            <div className="flex flex-column gap-3">
              {results.map((rec) => (
                <Card key={rec.id} className="border-left-3 border-primary">
                  <div className="flex align-items-start justify-content-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex align-items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold m-0">{rec.title}</h3>
                        <Tag
                          value={rec.eventType === 'HOST_PACKAGE' ? 'Host Package' : 'Public Event'}
                          severity={rec.eventType === 'HOST_PACKAGE' ? 'warning' : 'success'}
                        />
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                        <span><i className="pi pi-map-marker mr-1"></i>{rec.location}</span>
                        <span><i className="pi pi-dollar mr-1"></i>${Number(rec.price).toFixed(2)}</span>
                        <span><i className="pi pi-users mr-1"></i>{rec.availableSeats} seats available</span>
                      </div>
                      <p className="text-gray-700 m-0 text-sm">
                        <i className="pi pi-sparkles text-yellow-500 mr-1"></i>
                        <em>{rec.reason}</em>
                      </p>
                    </div>
                    <Button
                      label="Book Now"
                      icon="pi pi-ticket"
                      onClick={() => navigate(`/booking/${rec.id}`)}
                      disabled={rec.availableSeats === 0}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
