import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { PublicLayout } from './Layout/PublicLayout';
import { OrganizerLayout } from './Layout/OrganizerLayout';
import { SupplierLayout } from './Layout/SupplierLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { EventsListPage } from './pages/EventsListPage';
import { ProfilePage } from './pages/ProfilePage';
import { SupplierProfilePage } from './pages/SupplierProfilePage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { BookingFormPage } from './pages/BookingFormPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { OrganizerEventsPage } from './pages/OrganizerEventsPage';
import { CreateEditEventPage } from './pages/CreateEditEventPage';
import {OrganizerDashboard} from './pages/OrganizerDashboard';
import {OrganizerBookingsPage} from './pages/OrganizerBookingsPage';
import {SupplierDirectoryPage} from './pages/SupplierDirectoryPage';
import {SupplierDashboard} from './pages/SupplierDashboard';
import {AiEventPlannerPage} from './pages/AiEventPlannerPage';
import {ProviderDetailPage} from './pages/ProviderDetailPage';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
          
          {/* Events Routes */}
          <Route path="/events" element={<PublicLayout><EventsListPage /></PublicLayout>} />
          <Route path="/events/:eventId" element={<PublicLayout><EventsListPage /></PublicLayout>} />
          
          {/* Suppliers Route */}
          <Route path="/suppliers" element={<PublicLayout><SupplierDirectoryPage/></PublicLayout>} />
          <Route path="/suppliers/:supplierId" element={<PublicLayout><ProviderDetailPage/></PublicLayout>} />
          
          {/* Protected User Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <PublicLayout><ProfilePage /></PublicLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/bookings" element={
            <ProtectedRoute>
              <PublicLayout><MyBookingsPage /></PublicLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/booking/:eventId" element={
            <ProtectedRoute>
              <PublicLayout><BookingFormPage /></PublicLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/booking-confirmation/:bookingId" element={
            <ProtectedRoute>
              <PublicLayout><BookingConfirmationPage /></PublicLayout>
            </ProtectedRoute>
          } />
          
          {/* Organizer Routes */}
          <Route path="/organizer/dashboard" element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <OrganizerLayout><OrganizerDashboard/></OrganizerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/organizer/events" element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <OrganizerLayout><div className='px-5'><OrganizerEventsPage /></div></OrganizerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/organizer/events/create" element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <OrganizerLayout><CreateEditEventPage /></OrganizerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/organizer/events/edit/:eventId" element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <OrganizerLayout><CreateEditEventPage /></OrganizerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/organizer/bookings" element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <OrganizerLayout><OrganizerBookingsPage/></OrganizerLayout>
            </ProtectedRoute>
          } />

          <Route path="/organizer/suppliers" element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <OrganizerLayout><SupplierDirectoryPage/></OrganizerLayout>
            </ProtectedRoute>
          } />

          <Route path="/organizer/suppliers/:supplierId" element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <OrganizerLayout><ProviderDetailPage/></OrganizerLayout>
            </ProtectedRoute>
          } />

          <Route path="/ai-planner" element={
            <ProtectedRoute>
              <PublicLayout><AiEventPlannerPage /></PublicLayout>
            </ProtectedRoute>
          } />
          
          {/* Supplier Routes */}
          <Route path="/supplier/dashboard" element={
            <ProtectedRoute allowedRoles={['SUPPLIER']}>
              <SupplierLayout><SupplierDashboard /></SupplierLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/supplier/profile" element={
            <ProtectedRoute allowedRoles={['SUPPLIER']}>
              <SupplierLayout><SupplierProfilePage /></SupplierLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;