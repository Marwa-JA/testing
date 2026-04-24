import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ToggleButton } from 'primereact/togglebutton';
import { Rating } from 'primereact/rating';
import { useAuth } from '../auth/AuthContext';
import { supplierService } from '../services/supplierService';
import { reviewService } from '../services/reviewService';

const STATUS_OPTIONS = [
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Canceled', value: 'CANCELED' }
];

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  available: true,
  status: 'IN_PROGRESS'
};

export const SupplierDashboard = () => {
  const { user } = useAuth();
  const toast = useRef(null);

  const [supplier, setSupplier] = useState(null);
  const [services, setServices] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const userId = user?.id || user?.uid;

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const sup = await supplierService.getSupplierByUserId(userId);
        setSupplier(sup);
        if (sup) {
          const [svcList, rating] = await Promise.all([
            supplierService.getServicesBySupplierId(sup.id),
            reviewService.getSupplierAverageRating(sup.id).catch(() => null),
          ]);
          setServices(svcList);
          const parsedRating = rating != null
            ? (typeof rating === 'object' ? parseFloat(rating.average) : parseFloat(rating))
            : null;
          setAverageRating(parsedRating != null && !isNaN(parsedRating) ? parsedRating : null);
        }
      } catch (err) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const openNew = () => {
    setEditingService(null);
    setForm(emptyForm);
    setDialogVisible(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description,
      price: service.price,
      available: service.available,
      status: service.status
    });
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Service name is required' });
      return;
    }
    setSaving(true);
    try {
      if (editingService) {
        const updated = await supplierService.updateService(editingService.id, {
          ...editingService,
          ...form
        });
        setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
        toast.current?.show({ severity: 'success', summary: 'Updated', detail: 'Service updated successfully' });
      } else {
        const created = await supplierService.createService({
          ...form,
          supplierId: supplier.id
        });
        setServices(prev => [...prev, created]);
        toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Service added successfully' });
      }
      setDialogVisible(false);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (serviceId, status) => {
    try {
      const updated = await supplierService.updateServiceStatus(serviceId, status);
      setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
      toast.current?.show({ severity: 'success', summary: 'Updated', detail: 'Status updated' });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message });
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      await supplierService.deleteService(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Service removed' });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message });
    }
  };

  const statusBodyTemplate = (rowData) => {
    const severityMap = {
      IN_PROGRESS: 'warning',
      CANCELED: 'danger'
    };
    const labelMap = {
      IN_PROGRESS: 'In Progress',
      CANCELED: 'Canceled'
    };
    return (
      <Dropdown
        value={rowData.status}
        options={STATUS_OPTIONS}
        onChange={(e) => handleStatusChange(rowData.id, e.value)}
        className="p-inputtext-sm"
      />
    );
  };

  const availabilityBodyTemplate = (rowData) => (
    <Tag
      value={rowData.available ? 'Available' : 'Unavailable'}
      severity={rowData.available ? 'success' : 'secondary'}
    />
  );

  const priceBodyTemplate = (rowData) => (
    <span className="font-semibold">${rowData.price?.toFixed(2)}</span>
  );

  const actionsBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-sm"
        onClick={() => openEdit(rowData)}
        tooltip="Edit"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-danger p-button-sm"
        onClick={() => handleDelete(rowData.id)}
        tooltip="Delete"
      />
    </div>
  );

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDialogVisible(false)} disabled={saving} />
      <Button label="Save" icon="pi pi-check" onClick={handleSave} loading={saving} />
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <div className="grid mb-4">
        <div className="col-12 md:col-3">
          <Card className="text-center">
            <div className="text-4xl font-bold text-primary">{services.length}</div>
            <div className="text-gray-600 mt-1">Total Services</div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card className="text-center">
            <div className="text-4xl font-bold text-green-500">
              {services.filter(s => s.available).length}
            </div>
            <div className="text-gray-600 mt-1">Available</div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card className="text-center">
            <div className="text-4xl font-bold text-orange-500">
              {services.filter(s => s.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-gray-600 mt-1">In Progress</div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card className="text-center">
            {averageRating != null ? (
              <>
                <div className="text-4xl font-bold text-yellow-500 mb-1">{averageRating.toFixed(1)}</div>
                <Rating value={Math.round(averageRating)} readOnly cancel={false} />
              </>
            ) : (
              <div className="text-gray-400 mt-2">No ratings yet</div>
            )}
            <div className="text-gray-600 mt-1">Avg. Rating</div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex justify-content-between align-items-center mb-4">
          <h2 className="text-xl font-bold m-0">My Services</h2>
          <Button label="Add Service" icon="pi pi-plus" onClick={openNew} />
        </div>

        {services.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <i className="pi pi-briefcase text-4xl mb-3 block"></i>
            <p>No services yet. Add your first service to get started.</p>
          </div>
        ) : (
          <DataTable value={services} paginator rows={10} responsiveLayout="scroll">
            <Column field="name" header="Service Name" sortable />
            <Column field="description" header="Description" />
            <Column header="Price" body={priceBodyTemplate} sortable field="price" />
            <Column header="Availability" body={availabilityBodyTemplate} />
            <Column header="Status" body={statusBodyTemplate} />
            <Column header="Actions" body={actionsBodyTemplate} />
          </DataTable>
        )}
      </Card>

      <Dialog
        header={editingService ? 'Edit Service' : 'Add New Service'}
        visible={dialogVisible}
        style={{ width: '480px' }}
        onHide={() => setDialogVisible(false)}
        footer={dialogFooter}
      >
        <div className="flex flex-column gap-3 pt-2">
          <div className="flex flex-column gap-1">
            <label className="font-medium">Service Name *</label>
            <InputText
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Wedding Photography"
            />
          </div>

          <div className="flex flex-column gap-1">
            <label className="font-medium">Description</label>
            <InputTextarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Describe your service..."
            />
          </div>

          <div className="flex flex-column gap-1">
            <label className="font-medium">Price ($)</label>
            <InputNumber
              value={form.price}
              onValueChange={(e) => setForm(f => ({ ...f, price: e.value ?? 0 }))}
              min={0}
              mode="decimal"
              minFractionDigits={2}
            />
          </div>

          <div className="flex flex-column gap-1">
            <label className="font-medium">Status</label>
            <Dropdown
              value={form.status}
              options={STATUS_OPTIONS}
              onChange={(e) => setForm(f => ({ ...f, status: e.value }))}
            />
          </div>

          <div className="flex align-items-center gap-2">
            <ToggleButton
              checked={form.available}
              onChange={(e) => setForm(f => ({ ...f, available: e.value }))}
              onLabel="Available"
              offLabel="Unavailable"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
