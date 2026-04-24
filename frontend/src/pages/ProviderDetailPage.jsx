import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Rating } from 'primereact/rating';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useParams, useNavigate } from 'react-router-dom';
import { supplierService } from '../services/supplierService';
import { reviewService } from '../services/reviewService';

const serviceTypeLabels = {
  CATERING: 'Catering',
  DECORATION: 'Decoration',
  ENTERTAINMENT: 'Entertainment',
  PHOTOGRAPHY: 'Photography',
  VENUE: 'Venue',
  EQUIPMENT: 'Equipment',
  OTHER: 'Other',
};

export const ProviderDetailPage = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [supplier, setSupplier] = useState(null);
  const [services, setServices] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [supplierId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [supplierData, servicesData] = await Promise.all([
        supplierService.getSupplierById(supplierId),
        supplierService.getServicesBySupplierId(supplierId),
      ]);
      setSupplier(supplierData);
      setServices(servicesData.filter(s => s.available));

      try {
        const [rating, reviewList] = await Promise.all([
          reviewService.getSupplierAverageRating(supplierId),
          reviewService.getSupplierReviews(supplierId),
        ]);
        setAverageRating(rating != null ? (typeof rating === 'object' ? parseFloat(rating.average) : parseFloat(rating)) : null);
        setReviews(reviewList || []);
      } catch {
        setAverageRating(null);
        setReviews([]);
      }
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load provider details' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto py-6 px-4 text-center">
        <i className="pi pi-exclamation-circle text-6xl text-gray-400 mb-3"></i>
        <h2 className="text-3xl text-gray-600 mb-3">Provider Not Found</h2>
        <Button label="Back to Directory" icon="pi pi-arrow-left" onClick={() => navigate('/suppliers')} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Toast ref={toast} />

      <Button
        label="Back to Directory"
        icon="pi pi-arrow-left"
        className="p-button-text mb-3"
        onClick={() => navigate('/suppliers')}
      />

      <div className="grid">
        <div className="col-12 lg:col-4">
          <Card>
            <div className="flex flex-column align-items-center text-center">
              <div className="flex align-items-center justify-content-center border-circle bg-primary"
                   style={{ width: '80px', height: '80px' }}>
                <i className="pi pi-user text-4xl text-white"></i>
              </div>
              <h2 className="text-2xl font-bold mt-3 mb-1">{supplier.name}</h2>
              <Tag value={serviceTypeLabels[supplier.serviceType] || supplier.serviceType} severity="info" className="mb-2" />

              {averageRating != null && (
                <div className="flex align-items-center gap-2 mb-2">
                  <Rating value={Math.round(averageRating)} readOnly cancel={false} />
                  <span className="text-sm text-gray-500">({averageRating.toFixed(1)})</span>
                </div>
              )}
            </div>

            <Divider />

            {supplier.description && (
              <p className="text-gray-700 mb-3">{supplier.description}</p>
            )}

            <div className="flex flex-column gap-2">
              {supplier.city && (
                <div className="flex align-items-center gap-2 text-sm text-gray-600">
                  <i className="pi pi-map-marker"></i>
                  <span>{supplier.city}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex align-items-center gap-2 text-sm text-gray-600">
                  <i className="pi pi-envelope"></i>
                  <a href={`mailto:${supplier.email}`} className="text-primary">{supplier.email}</a>
                </div>
              )}
              {supplier.phoneNumber && (
                <div className="flex align-items-center gap-2 text-sm text-gray-600">
                  <i className="pi pi-phone"></i>
                  <a href={`tel:${supplier.phoneNumber}`} className="text-primary">{supplier.phoneNumber}</a>
                </div>
              )}
            </div>

            <Button
              label="Contact Provider"
              icon="pi pi-send"
              className="w-full mt-3"
              onClick={() => { if (supplier.email) window.location.href = `mailto:${supplier.email}`; }}
              disabled={!supplier.email}
            />
          </Card>
        </div>

        <div className="col-12 lg:col-8">
          <h3 className="text-2xl font-bold mb-3">
            <i className="pi pi-list mr-2"></i>
            Services ({services.length})
          </h3>

          {services.length === 0 ? (
            <Card>
              <div className="text-center py-6">
                <i className="pi pi-inbox text-5xl text-gray-400 mb-3"></i>
                <p className="text-gray-500 text-lg">This provider has no services listed yet.</p>
              </div>
            </Card>
          ) : (
            <div className="grid">
              {services.map(service => (
                <div key={service.id} className="col-12 md:col-6">
                  <Card className="h-full shadow-md">
                    <div className="flex flex-column h-full">
                      <div className="flex align-items-center justify-content-between mb-2">
                        <h4 className="text-lg font-bold m-0">{service.name}</h4>
                        <span className="text-xl font-bold text-primary">${service.price.toFixed(2)}</span>
                      </div>
                      {service.description && (
                        <p className="text-gray-600 text-sm flex-1">{service.description}</p>
                      )}
                      <div className="flex align-items-center gap-2 mt-2">
                        <Tag value="Available" severity="success" icon="pi pi-check" />
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}

          <Divider />

          <div className="flex align-items-center justify-content-between mb-3">
            <h3 className="text-2xl font-bold m-0">
              <i className="pi pi-star mr-2"></i>
              Reviews
            </h3>
            {averageRating != null && (
              <div className="flex align-items-center gap-2">
                <Rating value={Math.round(averageRating)} readOnly cancel={false} stars={5} />
                <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center m-0">No reviews yet for this provider.</p>
            </Card>
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
        </div>
      </div>
    </div>
  );
};
