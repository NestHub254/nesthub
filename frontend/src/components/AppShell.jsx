import { useNavigate } from 'react-router-dom';
import { clearSession } from '../api/client.js';
import {
  LayoutDashboard, Wallet, Wrench, MessageSquare, User, Users,
  ClipboardList, Megaphone, LogOut, Building2
} from 'lucide-react';

const navByRole = {
  tenant: [
    ['Overview', LayoutDashboard],
    ['Payments', Wallet],
    ['Maintenance', Wrench],
    ['Community', MessageSquare],
    ['Profile', User]
  ],
  owner: [
    ['Overview', LayoutDashboard],
    ['Properties', Building2],
    ['Financials', Wallet],
    ['Tickets', Wrench],
    ['Staff chat', MessageSquare],
    ['Profile', User]
  ],
  manager: [
    ['Overview', LayoutDashboard],
    ['Tenants', Users],
    ['Ticket queue', ClipboardList],
    ['Announcements', Megaphone],
    ['Profile', User]
  ],
  maintenance: [
    ['My work', Wrench],
    ['Open tickets', ClipboardList],
    ['Staff chat', MessageSquare],
    ['Profile', User]
  ]
};

export default function AppShell({ session, title, children }) {
  const navigate = useNavigate();

  function logout() {
    clearSession();
    navigate('/');
  }

  return (
    <>
      <header className="app-header">
        <span className="brand"><span>n</span>NestHub</span>
        <div className="app-actions">
          <span className="user-menu">
            <span>{session.fullName.split(' ').map(p => p[0]).slice(0, 2).join('')}</span>
            <i>{session.fullName}</i>
          </span>
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <nav>
            {(navByRole[session.role] || []).map(([label, Icon]) => (
              <button key={label}><Icon size={16} /> {label}</button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <span>{session.role}</span>
            <button onClick={logout}><LogOut size={14} /> Sign out</button>
          </div>
        </aside>
        <main className="content">
          <section className="page-head">
            <div>
              <p className="eyebrow">{title.toUpperCase()}</p>
              <h1>Good to see you, {session.fullName.split(' ')[0]}.</h1>
            </div>
          </section>
          {children}
        </main>
      </div>
    </>
  );
}
