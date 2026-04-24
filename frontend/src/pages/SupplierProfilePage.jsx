import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

import { useAuth } from '../auth/AuthContext';
import { authService } from '../services/authService';
import { supplierService } from '../services/supplierService';
import { updatePassword } from "firebase/auth";
import { EditProfileDialog } from '../components/EditProfileDialog';
import { EditSupplierDialog } from '../components/EditSupplierDialog';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';
import { DeleteAccountDialog } from '../components/DeleteAccountDialog';

export const SupplierProfilePage = () => {
  const { user, updateUser, logout, firebaseUser } = useAuth();
  const toast = useRef(null);

  const [supplier, setSupplier] = useState(null);
  const [loadingSupplier, setLoadingSupplier] = useState(true);

  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showEditSupplierDialog, setShowEditSupplierDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const userId = user?.id || user?.uid || null;

  useEffect(() => {
    const loadSupplier = async () => {
      if (!user || user.role !== 'SUPPLIER' || !userId) {
        setLoadingSupplier(false);
        return;
      }

      try {
        const data = await supplierService.getSupplierByUserId(userId);
        setSupplier(data);
      } catch (err) {
        setSupplier(null);
      } finally {
        setLoadingSupplier(false);
      }
    };

    loadSupplier();
  }, [user, userId]);

  const handleUpdateUser = async (formData) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      const updatedUser = await authService.updateProfile(userId,formData);

      updateUser(updatedUser);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully'
      });

      setShowEditUserDialog(false);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSupplier = async (formData) => {
    if (!supplier || !userId) return;
    setActionLoading(true);
    try {
      const payload = {
        ...supplier,
        serviceType: formData.serviceType,
        city: formData.city,
        description: formData.description
      };

      const updated = await supplierService.updateSupplier(supplier.id, payload);
      setSupplier(updated);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Provider profile updated successfully'
      });

      setShowEditSupplierDialog(false);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = async (passwordData) => {
    setActionLoading(true);
    try {
      await updatePassword(firebaseUser, passwordData.newPassword);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Password changed successfully'
      });

      setShowPasswordDialog(false);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await authService.deleteAccount(userId);
      await supplierService.deleteSupplier(supplier.id)

      toast.current?.show({
        severity: 'success',
        summary: 'Account Deleted',
        detail: 'Your account has been deleted successfully'
      });

      setShowDeleteDialog(false);

      setTimeout(() => {
        logout();
      }, 1000);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getServiceTypeLabel = (serviceType) => {
    if (!serviceType) return 'Not set';
    switch (serviceType) {
      case 'CATERING': return 'Catering';
      case 'DECORATION': return 'Decoration';
      case 'ENTERTAINMENT': return 'Entertainment';
      case 'PHOTOGRAPHY': return 'Photography';
      case 'VENUE': return 'Venue';
      case 'EQUIPMENT': return 'Equipment';
      case 'OTHER': return 'Other';
      default: return serviceType;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Toast ref={toast} />
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Toast ref={toast} />

      <EditProfileDialog
        visible={showEditUserDialog}
        user={user}
        onHide={() => setShowEditUserDialog(false)}
        onSave={handleUpdateUser}
      />

      <EditSupplierDialog
        visible={showEditSupplierDialog}
        supplier={supplier}
        onHide={() => setShowEditSupplierDialog(false)}
        onSave={handleUpdateSupplier}
      />

      <ChangePasswordDialog
        visible={showPasswordDialog}
        onHide={() => setShowPasswordDialog(false)}
        onSave={handleChangePassword}
      />

      <DeleteAccountDialog
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
      />

      <div className="grid">
        <div className="col-12 lg:col-8 mx-auto">
          <Card className="mb-5">

             <div className="flex flex-column align-items-center mb-4">
                <Avatar
                  image={user.profilePictureUrl}
                  size="xlarge"
                  shape="circle"
                  className="mb-3"
                />
                <h2 className="text-2xl font-bold mb-2">{user?.name || 'Supplier Profile'}</h2>
                {supplier && (
                  <div className="flex gap-2">
                    <Tag
                      value={getServiceTypeLabel(supplier.serviceType)}
                      icon="pi pi-tag"
                    />
                  </div>
                )}
              </div>

            <Divider />

            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="mb-4">
                  <label className="text-gray-600 text-sm">Email Address</label>
                  <div className="flex align-items-center gap-2 mt-2">
                    <i className="pi pi-envelope text-primary"></i>
                    <span className="font-semibold">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div className="mb-4">
                  <label className="text-gray-600 text-sm">Phone Number</label>
                  <div className="flex align-items-center gap-2 mt-2">
                    <i className="pi pi-phone text-primary"></i>
                    <span className="font-semibold">{user.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div className="mb-4">
                  <label className="text-gray-600 text-sm">User ID</label>
                  <div className="flex align-items-center gap-2 mt-2">
                    <i className="pi pi-id-card text-primary"></i>
                    <span className="font-semibold text-sm">{userId}</span>
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            <div className="flex flex-column gap-3">
              <h3 className="text-xl font-semibold mb-2">Account Settings</h3>

              <Button
                label="Edit Profile"
                icon="pi pi-user-edit"
                className="p-button-outlined w-full"
                onClick={() => setShowEditUserDialog(true)}
                disabled={actionLoading}
              />

              <Button
                label="Change Password"
                icon="pi pi-lock"
                className="p-button-outlined w-full"
                onClick={() => setShowPasswordDialog(true)}
                disabled={actionLoading}
              />

              <Divider />

              <div className="p-3 bg-red-50 border-round">
                <h4 className="text-red-900 font-semibold mb-2">Danger Zone</h4>
                <p className="text-red-700 mb-3 text-sm">
                  Once you delete your account, there is no going back. This will also affect your bookings and supplier profile.
                </p>
                <Button
                  label="Delete Account"
                  icon="pi pi-trash"
                  className="p-button-danger w-full"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={actionLoading}
                />
              </div>
            </div>
          </Card>

          {user.role === 'SUPPLIER' && (
            <Card>
              <div className="flex flex-column align-items-center mb-4">
                 <h2 className="text-2xl font-bold mb-2">{user?.name || 'Provider Profile'}</h2>
              </div>

              <Divider />

              {loadingSupplier && (
                <p>Loading supplier profile...</p>
              )}

              {!loadingSupplier && !supplier && (
                <p>No supplier profile found for this account.</p>
              )}

              {!loadingSupplier && supplier && (
                <>
                  <div className="grid">
                    <div className="col-12 md:col-6">
                      <div className="mb-4">
                        <label className="text-gray-600 text-sm">City</label>
                        <div className="flex align-items-center gap-2 mt-2">
                          <i className="pi pi-map-marker text-primary"></i>
                          <span className="font-semibold">{supplier.city || 'Not set'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 md:col-6">
                      <div className="mb-4">
                        <label className="text-gray-600 text-sm">Provider ID</label>
                        <div className="flex align-items-center gap-2 mt-2">
                          <i className="pi pi-id-card text-primary"></i>
                          <span className="font-semibold text-sm">{supplier.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 md:col-6">
                      <div className="mb-4">
                        <label className="text-gray-600 text-sm">Description</label>
                        <p className="mt-2 text-gray-800 line-height-3">
                          {supplier.description || 'No description provided yet.'}
                        </p>
                      </div>
                    </div>
                    <div className="col-12 md:col-6">
                      <div className="mb-4">
                        <label className="text-gray-600 text-sm">Service Type</label>
                        <p className="mt-2 text-gray-800 line-height-3">
                          {supplier.serviceType}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Divider />

                  <Button
                    label="Edit Provider Profile"
                    icon="pi pi-pencil"
                    className="p-button-outlined w-full"
                    onClick={() => setShowEditSupplierDialog(true)}
                    disabled={actionLoading}
                  />
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
