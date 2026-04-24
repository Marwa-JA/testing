import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';

export const EditSupplierDialog = ({ visible, supplier, onHide, onSave }) => {
  const [formData, setFormData] = useState({
    serviceType: '',
    city: '',
    description: ''
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        serviceType: supplier.serviceType || '',
        city: supplier.city || '',
        description: supplier.description || ''
      });
    }
  }, [supplier]);

  const serviceTypeOptions = [
    { label: 'Catering', value: 'CATERING' },
    { label: 'Decoration', value: 'DECORATION' },
    { label: 'Entertainment', value: 'ENTERTAINMENT' },
    { label: 'Photography', value: 'PHOTOGRAPHY' },
    { label: 'Venue', value: 'VENUE' },
    { label: 'Equipment', value: 'EQUIPMENT' },
    { label: 'Other', value: 'OTHER' }
  ];

  const cityOptions = [
    { label: 'Damascus', value: 'Damascus' }
  ];

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onSave(formData);
  };

  const footer = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Save Changes"
        icon="pi pi-check"
        onClick={handleSubmit}
      />
    </div>
  );

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog
      header="Edit Provider Profile"
      visible={visible}
      style={{ width: '600px' }}
      onHide={onHide}
      footer={footer}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-column gap-3">

          <div>
            <label className="block text-900 font-medium mb-2">Service Type</label>
            <Dropdown
              className="w-full"
              value={formData.serviceType}
              options={serviceTypeOptions}
              onChange={(e) => handleChange('serviceType', e.value)}
              placeholder="Select service type"
            />
          </div>

          <div>
            <label className="block text-900 font-medium mb-2">City</label>
            <Dropdown
              className="w-full"
              value={formData.city}
              options={cityOptions}
              onChange={(e) => handleChange('city', e.value)}
              placeholder="Select city"
            />
          </div>

          <div>
            <label className="block text-900 font-medium mb-2">Description</label>
            <InputTextarea
              className="w-full"
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};
