import { Routes, Route, Navigate } from 'react-router-dom';
import { getSession } from './api/client.js';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { useRobotsMeta } from './seo/useRobotsMeta.js';
import ForgotPassword from './pages/ForgotPassword.jsx';
import PropertyApp from './pages/operations/PropertyApp.jsx';

function RequireAuth({ children }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function Dashboard() {
  useRobotsMeta('noindex, nofollow');
  const session = getSession();
  if(!session||session.role==='tenant')return <Navigate to="/login" replace/>;
  return <PropertyApp session={session} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route
        path="/app/*"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
