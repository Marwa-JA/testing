import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { AuthCard } from '../components/authComponents/AuthCard';
import { FormInput } from '../components/authComponents/FormInput';
import { auth } from '../services/firebaseService'; 

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth,email);
      
      setSent(true);
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Password reset instructions sent to your email' 
      });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <Toast ref={toast} />
        <AuthCard title="Check Your Email">
          <div className="text-center">
            <i className="pi pi-envelope text-6xl text-primary mb-3"></i>
            <p className="text-gray-700 mb-4">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="text-gray-600 mb-4">
              Please check your inbox and follow the link to reset your password.
            </p>
            <Button 
              label="Back to Login" 
              className="w-full"
              onClick={() => navigate('/login')}
            />
          </div>
        </AuthCard>
      </>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <AuthCard title="Forgot Password">
        <p className="text-center text-gray-600 mb-4">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        <form onSubmit={handleSubmit}>
          <FormInput 
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />
          
          <Button label="Send Reset Instructions" type="submit" className="w-full mt-3" loading={loading} />
          
          <div className="text-center mt-3">
            <a className="text-primary cursor-pointer" onClick={() => navigate('/login')}>
              Back to Login
            </a>
          </div>
        </form>
      </AuthCard>
    </>
  );
};