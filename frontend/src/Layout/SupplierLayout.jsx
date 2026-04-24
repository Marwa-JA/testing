import { Link, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useAuth } from '../auth/AuthContext';
import { ChatBot } from '../components/ChatBot';

export const SupplierLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const items = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: () => navigate('/supplier/dashboard')
    },
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => navigate('/supplier/profile')
    }
  ];

  const start = (
    <Link to="/supplier/dashboard" className="flex align-items-center text-decoration-none">
      <span className="text-2xl font-bold gradient-text">Provider Panel</span>
    </Link>
  );

  const end = (
    <div className="flex align-items-center gap-2">
      <span className="text-gray-700">{user?.name}</span>
      <Button 
        icon="pi pi-sign-out" 
        className="p-button-text"
        onClick={() => {
          logout();
          navigate('/');
        }}
        tooltip="Logout"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-column">
      <Menubar model={items} start={start} end={end} />
      <main className="flex-1">
        {children}
      </main>
      <ChatBot />
    </div>
  );
};