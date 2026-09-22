import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutGrid, Wallet, Wrench, Users, Bell, UserRound, LogOut, Menu, X,
} from 'lucide-react';
import { clearSession } from '../../api/client.js';
import { useStore } from '../../data/mockStore.jsx';

const NAV = [
  { to: '/app', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/app/rent', label: 'Rent & Payments', icon: Wallet },
  { to: '/app/tickets', label: 'Maintenance', icon: Wrench },
  { to: '/app/community', label: 'Community', icon: Users },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { profile, notifications } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const initials = profile.name.split(' ').map((p) => p[0]).slice(0, 2).join('');

  function handleLogout() {
    clearSession();
    navigate('/login');
  }

  return (
    <div className="db-shell">
      <button className="db-mobile-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <button
          className="db-nav-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside className={`db-sidebar ${mobileOpen ? 'db-sidebar-open' : ''}`} aria-label="Tenant navigation">
        <div className="db-brand">
          <span className="tp-mark">n</span>
          <span>NestHub</span>
        </div>

        <nav className="db-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `db-nav-item ${isActive ? 'db-nav-item-active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{label}</span>
              {label === 'Notifications' && unread > 0 && <span className="db-nav-badge">{unread}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-mini-profile">
            <span className="db-avatar">{initials}</span>
            <div>
              <strong>{profile.name}</strong>
              <span>Unit {profile.unit}</span>
            </div>
          </div>
          <button className="db-logout" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.75} /> Log out
          </button>
        </div>
      </aside>

      <main className="db-main">
        <Outlet />
      </main>
    </div>
  );
}
