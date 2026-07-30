import { Wrench, Wallet, Megaphone, Check, CheckCheck } from 'lucide-react';
import { useStore } from '../../data/mockStore.jsx';

const ICONS = { ticket: Wrench, payment: Wallet, announcement: Megaphone };

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="db-page">
      <header className="db-page-header db-page-header-row">
        <div>
          <h1>Notifications</h1>
          <p className="tp-sub">{unreadCount === 0 ? 'All caught up.' : `${unreadCount} unread`}</p>
        </div>
        {unreadCount > 0 && (
          <button className="tp-btn tp-btn-ghost db-header-btn" onClick={markAllNotificationsRead}>
            <CheckCheck size={16} strokeWidth={1.75} /> Mark all read
          </button>
        )}
      </header>

      <div className="db-panel db-notif-list">
        {notifications.map((n) => {
          const Icon = ICONS[n.type] ?? Megaphone;
          return (
            <div key={n.id} className={`db-notif ${n.read ? '' : 'db-notif-unread'}`}>
              <span className="db-notif-icon"><Icon size={16} strokeWidth={1.75} /></span>
              <div className="db-notif-body">
                <p>{n.text}</p>
                <span>{relativeTime(n.at)}</span>
              </div>
              {!n.read && (
                <button className="db-icon-btn" onClick={() => markNotificationRead(n.id)} aria-label="Mark as read">
                  <Check size={16} strokeWidth={1.75} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
