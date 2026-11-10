import { Routes, Route, Navigate } from 'react-router-dom';
import { getSession } from './api/client.js';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import TenantHome from './pages/tenant/TenantHome.jsx';
import OwnerHome from './pages/owner/OwnerHome.jsx';
import ManagerHome from './pages/manager/ManagerHome.jsx';
import MaintenanceHome from './pages/maintenance/MaintenanceHome.jsx';
import { useRobotsMeta } from './seo/useRobotsMeta.js';

const roleHome = {
  tenant: TenantHome,
  owner: OwnerHome,
  manager: ManagerHome,
  maintenance: MaintenanceHome
};

function RequireAuth({ children }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function Dashboard() {
  useRobotsMeta('noindex, nofollow');
  const session = getSession();
  const Home = roleHome[session?.role] || TenantHome;
  return <Home session={session} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
