import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';

export const DeleteAccountDialog = ({ visible, onHide, onConfirm }) => {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    onConfirm(password);
    setPassword('');
  };

  const footer = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button 
        label="Delete Account" 
        icon="pi pi-trash" 
        onClick={handleConfirm} 
        className="p-button-danger"
        disabled={!password}
      />
    </div>
  );

  return (
    <Dialog 
      header="Delete Account" 
      visible={visible} 
      style={{ width: '500px' }} 
      onHide={onHide}
      footer={footer}
    >
      <div className="flex flex-column gap-3">
        <div className="p-3 bg-red-100 text-red-900 border-round">
          <i className="pi pi-exclamation-triangle text-2xl mr-2"></i>
          <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
        </div>

        <p className="text-gray-700">
          Please enter your password to confirm account deletion:
        </p>

        <div>
          <label className="block text-900 font-medium mb-2">Password</label>
          <Password 
            className="w-full"
            inputClassName="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            feedback={false}
            toggleMask
            placeholder="Enter your password"
          />
        </div>
      </div>
    </Dialog>
  );
};