import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '../auth/AuthContext';
import { eventService } from '../services/eventService';
import hero from '../images/hero.jpg';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingRecs(true);
    eventService.getRecommendations(user.id)
      .then(setRecommendations)
      .catch(() => {/* fail silently */})
      .finally(() => setLoadingRecs(false));
  }, [user?.id]);

  return (
    <div>
      <div className="relative overflow-hidden" style={{ height: '65vh' }}>
        <img
          src={hero}
          alt="Events"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(59,130,246,0.4), rgba(6,182,212,0.3))', mixBlendMode: 'multiply' }} />

        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div className="container mx-auto text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome to EventMarketPlace
            </h1>
            <p className="text-xl md:text-2xl">
              Attend or Host Amazing Events
            </p>
          </div>
        </div>
      </div>

      <div className="glass-strong py-4 px-4 text-center" style={{ borderRadius: 0 }}>
        <div className="container mx-auto">
          <div className="flex gap-3 justify-content-center">
            <Button
              label="Browse Events"
              size="large"
              onClick={() => navigate('/events')}
            />
            <Button
              label="Become a Provider"
              size="large"
              className="p-button-outlined"
              onClick={() => navigate('/register')}
            />
          </div>
        </div>
      </div>

      {user && (
        <div className="container mx-auto py-6 px-4">
          <h2 className="text-3xl font-bold mb-1">
            <i className="pi pi-sparkles text-yellow-500 mr-2"></i>
            Recommended for You
          </h2>
          <p className="text-gray-500 mb-4">Personalized picks based on your booking history</p>

          {loadingRecs && (
            <div className="flex justify-content-center py-4">
              <ProgressSpinner style={{ width: '40px', height: '40px' }} />
            </div>
          )}

          {!loadingRecs && recommendations.length === 0 && (
            <p className="text-gray-400">No recommendations yet — book some events to get personalised suggestions!</p>
          )}

          {!loadingRecs && recommendations.length > 0 && (
            <div className="grid">
              {recommendations.map((event) => (
                <div key={event.id} className="col-12 md:col-4">
                  <Card className="h-full">
                    <div className="flex flex-column h-full">
                      <div className="flex align-items-center gap-2 mb-2">
                        <Tag
                          value={event.eventType === 'HOST_PACKAGE' ? 'Host Package' : 'Public Event'}
                          severity={event.eventType === 'HOST_PACKAGE' ? 'warning' : 'success'}
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                      <p className="text-gray-500 text-sm mb-1">
                        <i className="pi pi-map-marker mr-1"></i>{event.location}, {event.city}
                      </p>
                      <p className="text-gray-500 text-sm mb-3">
                        <i className="pi pi-dollar mr-1"></i>${Number(event.ticketPrice).toFixed(2)} &nbsp;·&nbsp;
                        <i className="pi pi-users mr-1"></i>{event.availableSeats} seats
                      </p>
                      <div className="mt-auto">
                        <Button
                          label="Book Now"
                          icon="pi pi-ticket"
                          className="w-full"
                          onClick={() => navigate(`/booking/${event.id}`)}
                          disabled={!event.bookingEnabled || event.availableSeats === 0}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
