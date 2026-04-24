import { useState, useRef } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useAuth } from '../auth/AuthContext';
import { AuthCard } from '../components/authComponents/AuthCard';
import { FormInput } from '../components/authComponents/FormInput';
import { FormPassword } from '../components/authComponents/FormPassword';
import {authService} from '../services/authService';
import {auth} from '../services/firebaseService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      const response = await authService.verifyToken(idToken);

      const backendUser = response.user;
      login(idToken, backendUser);
    
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Login successful',
      });

      if (backendUser?.role === 'ORGANIZER') {
        navigate('/organizer/dashboard');
      } else if (backendUser?.role === 'SUPPLIER') {
        navigate('/supplier/dashboard');
      } else {
        navigate('/events');
      }
    } catch (error) {

      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Login failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <AuthCard title="Sign In">
        <form onSubmit={handleLogin}>
          <FormInput 
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />
          
          <FormPassword 
            label="Password"
            value={password}
            onChange={setPassword}
            feedback={false}
          />
          
          <div className="flex align-items-center justify-content-between mb-3 pt-3">
            <a className="text-primary cursor-pointer" onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </a>
          </div>
          
          <Button label="Sign In" type="submit" className="w-full" loading={loading} />
          
          <div className="text-center mt-3">
            <span className="text-600">Don't have an account? </span>
            <a className="text-primary cursor-pointer" onClick={() => navigate('/register')}>
              Register
            </a>
          </div>
        </form>
      </AuthCard>
    </>
  );
};