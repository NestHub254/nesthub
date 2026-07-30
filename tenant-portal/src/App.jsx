import { Routes, Route, Navigate } from 'react-router-dom';
import { getSession } from './api/client.js';
import { StoreProvider } from './data/mockStore.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';
import Overview from './components/dashboard/Overview.jsx';
import RentPayments from './components/dashboard/RentPayments.jsx';
import MaintenanceTickets from './components/dashboard/MaintenanceTickets.jsx';
import CommunityBoard from './components/dashboard/CommunityBoard.jsx';
import Notifications from './components/dashboard/Notifications.jsx';
import Profile from './components/dashboard/Profile.jsx';

function RequireAuth({ children }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <StoreProvider>
              <DashboardLayout />
            </StoreProvider>
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="rent" element={<RentPayments />} />
        <Route path="tickets" element={<MaintenanceTickets />} />
        <Route path="community" element={<CommunityBoard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
