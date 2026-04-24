import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';

export const ChangePasswordDialog = ({ visible, onHide, onSave }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    onSave(formData);
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const footer = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Change Password" icon="pi pi-check" onClick={handleSubmit} />
    </div>
  );

  return (
    <Dialog 
      header="Change Password" 
      visible={visible} 
      style={{ width: '500px' }} 
      onHide={onHide}
      footer={footer}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-column gap-3">
          {error && (
            <div className="p-3 bg-red-100 text-red-900 border-round">
              <i className="pi pi-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          <div>
            <label className="block text-900 font-medium mb-2">Current Password</label>
            <Password 
              className="w-full"
              inputClassName="w-full"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              feedback={false}
              toggleMask
              required
            />
          </div>

          <div>
            <label className="block text-900 font-medium mb-2">New Password</label>
            <Password 
              className="w-full"
              inputClassName="w-full"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              toggleMask
              required
            />
          </div>

          <div>
            <label className="block text-900 font-medium mb-2">Confirm New Password</label>
            <Password 
              className="w-full"
              inputClassName="w-full"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              feedback={false}
              toggleMask
              required
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};