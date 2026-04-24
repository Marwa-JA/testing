import { Link, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useAuth } from '../auth/AuthContext';
import { ChatBot } from '../components/ChatBot';

export const OrganizerLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const items = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: () => navigate('/organizer/dashboard')
    },
    {
      label: 'Events',
      icon: 'pi pi-calendar',
      command: () => navigate('/organizer/events')
    },
    {
      label: 'Bookings',
      icon: 'pi pi-ticket',
      command: () => navigate('/organizer/bookings')
    },
    {
      label: 'Providers',
      icon: 'pi pi-users',
      command: () => navigate('/organizer/suppliers')
    }
  ];

  const start = (
    <Link to="/organizer/dashboard" className="flex align-items-center text-decoration-none">
      <span className="text-2xl font-bold gradient-text">Organizer Panel</span>
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