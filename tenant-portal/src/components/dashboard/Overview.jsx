import { Link } from 'react-router-dom';
import { Wallet, Wrench, Bell, ArrowUpRight, CircleCheck, CircleAlert, Clock } from 'lucide-react';
import { useStore } from '../../data/mockStore.jsx';

const STATUS_META = {
  paid: { label: 'Paid up', icon: CircleCheck, tone: 'good' },
  due: { label: 'Due soon', icon: Clock, tone: 'warn' },
  overdue: { label: 'Overdue', icon: CircleAlert, tone: 'bad' },
};

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Overview() {
  const { profile, rent, tickets, notifications, announcements } = useStore();
  const openTickets = tickets.filter((t) => t.status !== 'closed');
  const unread = notifications.filter((n) => !n.read);
  const statusMeta = STATUS_META[rent.status];
  const StatusIcon = statusMeta.icon;
  const firstName = profile.name.split(' ')[0];
  const pinned = announcements.find((a) => a.pinned);

  return (
    <div className="db-page">
      <div className="db-hero">
        <svg className="db-hero-roofline" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 90 L0 55 L60 15 L120 55 L120 90" />
          <path d="M160 90 L160 40 L220 5 L280 40 L280 90" />
          <path d="M320 90 L320 60 L370 30 L400 48 L400 90" />
        </svg>
        <div className="db-hero-content">
          <p className="tp-eyebrow">{timeGreeting()}</p>
          <h1>Hey {firstName}, here's how Unit {profile.unit} looks today.</h1>
          <p className="tp-sub">{profile.building}</p>
        </div>
      </div>

      <div className="db-grid">
        <Link to="/app/rent" className={`db-card db-card-stat tone-${statusMeta.tone}`}>
          <div className="db-card-icon"><Wallet size={20} strokeWidth={1.75} /></div>
          <div className="db-card-body">
            <span className="db-card-label">Rent status</span>
            <strong className="db-card-value">
              <StatusIcon size={16} strokeWidth={2} /> {statusMeta.label}
            </strong>
            <span className="db-card-sub">KES {rent.monthlyRent.toLocaleString()} due on the {rent.dueDay}th</span>
          </div>
          <ArrowUpRight size={16} className="db-card-arrow" />
        </Link>

        <Link to="/app/tickets" className="db-card db-card-stat">
          <div className="db-card-icon"><Wrench size={20} strokeWidth={1.75} /></div>
          <div className="db-card-body">
            <span className="db-card-label">Open tickets</span>
            <strong className="db-card-value">{openTickets.length}</strong>
            <span className="db-card-sub">
              {openTickets.length === 0 ? 'Nothing outstanding' : openTickets[0].title}
            </span>
          </div>
          <ArrowUpRight size={16} className="db-card-arrow" />
        </Link>

        <Link to="/app/notifications" className="db-card db-card-stat">
          <div className="db-card-icon"><Bell size={20} strokeWidth={1.75} /></div>
          <div className="db-card-body">
            <span className="db-card-label">Notifications</span>
            <strong className="db-card-value">{unread.length} unread</strong>
            <span className="db-card-sub">{unread[0]?.text ?? 'You are all caught up'}</span>
          </div>
          <ArrowUpRight size={16} className="db-card-arrow" />
        </Link>
      </div>

      {pinned && (
        <div className="db-panel db-pinned-announcement">
          <span className="db-pin-tag">Pinned announcement</span>
          <h3>{pinned.title}</h3>
          <p>{pinned.body}</p>
          <Link to="/app/community" className="tp-link">View community board →</Link>
        </div>
      )}
    </div>
  );
}
