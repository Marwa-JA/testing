import { useState, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { InputSwitch } from "primereact/inputswitch";
import { useAuth } from "../auth/AuthContext";
import { authService } from "../services/authService";
import { EditProfileDialog } from "../components/EditProfileDialog";
import { ChangePasswordDialog } from "../components/ChangePasswordDialog";
import { DeleteAccountDialog } from "../components/DeleteAccountDialog";
import { updatePassword } from "firebase/auth";
export const ProfilePage = () => {
  const { user, updateUser, logout, firebaseUser } = useAuth();
  const toast = useRef(null);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const userId = user?.id || user?.uid || null;

  const prefs = user?.notificationPreferences || {};
  const [notifPrefs, setNotifPrefs] = useState({
    bookingConfirmation: prefs.bookingConfirmation !== false,
    eventReminders: prefs.eventReminders !== false,
    eventUpdates: prefs.eventUpdates !== false,
  });

  const handleNotifChange = async (key, value) => {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    setNotifSaving(true);
    try {
      const updatedUser = await authService.updateNotificationPreferences(userId, updated);
      updateUser(updatedUser);
    } catch (error) {
      setNotifPrefs(notifPrefs); // revert on error
      toast.current?.show({ severity: "error", summary: "Error", detail: error.message });
    } finally {
      setNotifSaving(false);
    }
  };

  const handleUpdateUser = async (formData) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      const updatedUser = await authService.updateProfile(userId, formData);
      updateUser(updatedUser);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Profile updated successfully",
      });
      setShowEditUserDialog(false);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
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
        severity: "success",
        summary: "Success",
        detail: "Password changed successfully",
      });
      setShowPasswordDialog(false);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
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
      toast.current?.show({
        severity: "success",
        summary: "Account Deleted",
        detail: "Your account has been deleted successfully",
      });
      setShowDeleteDialog(false);
      setTimeout(() => {
        logout();
      }, 1000);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6 px-4">
        
        <Toast ref={toast} /> <p>You must be logged in to view this page.</p>
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
                style={{ width: "120px", height: "120px", fontSize: "3rem" }}
              />
              <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
            </div>
            <Divider />
            <div className="grid">
              
              <div className="col-12 md:col-6">
                
                <div className="mb-4">
                  
                  <label className="text-gray-600 text-sm">
                    Email Address
                  </label>
                  <div className="flex align-items-center gap-2 mt-2">
                    
                    <i className="pi pi-envelope text-primary"></i>
                    <span className="font-semibold">{user.email}</span>
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-6">
                
                <div className="mb-4">
                  
                  <label className="text-gray-600 text-sm">
                    Phone Number
                  </label>
                  <div className="flex align-items-center gap-2 mt-2">
                    
                    <i className="pi pi-phone text-primary"></i>
                    <span className="font-semibold">
                      {user.phoneNumber || "Not provided"}
                    </span>
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
              
              <h3 className="text-xl font-semibold mb-2">
                Account Settings
              </h3>
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
                
                <h4 className="text-red-900 font-semibold mb-2">
                  Danger Zone
                </h4>
                <p className="text-red-700 mb-3 text-sm">
                  
                  Once you delete your account, there is no going back. This
                  will also affect your bookings and Provider profile.
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
          <Card>
            <h3 className="text-xl font-semibold mb-1">Notification Preferences</h3>
            <p className="text-gray-500 text-sm mb-4">Control which emails you receive from us.</p>

            <div className="flex flex-column gap-4">
              <div className="flex align-items-center justify-content-between">
                <div>
                  <div className="font-medium">Booking Confirmations</div>
                  <div className="text-sm text-gray-500">Receive an email when a booking is confirmed</div>
                </div>
                <InputSwitch
                  checked={notifPrefs.bookingConfirmation}
                  onChange={(e) => handleNotifChange('bookingConfirmation', e.value)}
                  disabled={notifSaving}
                />
              </div>

              <Divider className="my-0" />

              <div className="flex align-items-center justify-content-between">
                <div>
                  <div className="font-medium">Event Reminders</div>
                  <div className="text-sm text-gray-500">Receive reminders before your upcoming events</div>
                </div>
                <InputSwitch
                  checked={notifPrefs.eventReminders}
                  onChange={(e) => handleNotifChange('eventReminders', e.value)}
                  disabled={notifSaving}
                />
              </div>

              <Divider className="my-0" />

              <div className="flex align-items-center justify-content-between">
                <div>
                  <div className="font-medium">Event Updates</div>
                  <div className="text-sm text-gray-500">Get notified when an event you booked is updated</div>
                </div>
                <InputSwitch
                  checked={notifPrefs.eventUpdates}
                  onChange={(e) => handleNotifChange('eventUpdates', e.value)}
                  disabled={notifSaving}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
