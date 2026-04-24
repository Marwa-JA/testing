import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useAuth } from '../auth/AuthContext';
import { authService } from '../services/authService';
import { supplierService } from '../services/supplierService';
import { AuthCard } from '../components/authComponents/AuthCard';
import { FormInput } from '../components/authComponents/FormInput';
import { FormPassword } from '../components/authComponents/FormPassword';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    description: '',
    serviceType: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const roleOptions = [
    { label: 'User/Attendee', value: 'USER' },
    { label: 'Provider', value: 'SUPPLIER' }
  ];

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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const user = await authService.register({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role
      });

      if (user.role === 'SUPPLIER') {
        await supplierService.registerSupplier({
          userId: user.id,
          name: formData.name,
          description: formData.description,
          serviceType: formData.serviceType,
          city: formData.city,
          contactEmail: formData.email,
          contactPhone: formData.phoneNumber,
          logoUrl: null,
          portfolioImageUrls: [],
          isActive: true,
          isVerified: false
        });
      }

      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Registration successful' });

      const mockToken = 'mock-firebase-token-' + Date.now();
      login(mockToken, user);

      setTimeout(() => {
        if (user.role === 'SUPPLIER') {
          navigate('/supplier/dashboard');
        } else {
          navigate('/events');
        }
      }, 1000);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <AuthCard title="Create Account" width="lg:w-6">
        <form onSubmit={handleSubmit}>
          <div className="grid">
            <FormInput
              label="Full Name"
              value={formData.name}
              onChange={(val) => handleChange('name', val)}
              required
              className="col-12"
            />

            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(val) => handleChange('email', val)}
              required
              className="col-12 md:col-6"
            />

            <FormInput
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(val) => handleChange('phoneNumber', val)}
              required
              className="col-12 md:col-6"
            />

            <div className="col-12">
              <label className="block text-900 font-medium mb-2">Role</label>
              <Dropdown
                className="w-full"
                value={formData.role}
                options={roleOptions}
                onChange={(e) => handleChange('role', e.value)}
              />
            </div>

            <FormPassword
              label="Password"
              value={formData.password}
              onChange={(val) => handleChange('password', val)}
              className="col-12 md:col-6"
            />

            <FormPassword
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(val) => handleChange('confirmPassword', val)}
              feedback={false}
              className="col-12 md:col-6"
            />

            {formData.role === 'SUPPLIER' && (
              <>
                <div className="col-12 mt-4">
                  <h3 className="text-xl font-semibold mb-2">Provider Details</h3>
                  <p className="text-600 text-sm mb-3">
                    Tell us more about your service so clients can find you.
                  </p>
                </div>

                <div className="col-12 md:col-6">
                  <label className="block text-900 font-medium mb-2">City</label>
                  <Dropdown
                    className="w-full"
                    value={formData.city}
                    options={cityOptions}
                    onChange={(e) => handleChange('city', e.value)}
                    placeholder="Select city"
                  />
                </div>

                <div className="col-12 md:col-6">
                  <label className="block text-900 font-medium mb-2">Service Type</label>
                  <Dropdown
                    className="w-full"
                    value={formData.serviceType}
                    options={serviceTypeOptions}
                    onChange={(e) => handleChange('serviceType', e.value)}
                    placeholder="Select a service"
                  />
                </div>

                <div className="col-12">
                  <label className="block text-900 font-medium mb-2">Description</label>
                  <textarea
                    className="w-full p-inputtext p-component"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <Button label="Register" type="submit" className="w-full mt-3" loading={loading} />

          <div className="text-center mt-3">
            <span className="text-600">Already have an account? </span>
            <a className="text-primary cursor-pointer" onClick={() => navigate('/login')}>
              Sign In
            </a>
          </div>
        </form>
      </AuthCard>
    </>
  );
};
