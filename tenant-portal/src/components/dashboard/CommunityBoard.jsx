import { useState } from 'react';
import { Pin, Megaphone, Send } from 'lucide-react';
import { useStore } from '../../data/mockStore.jsx';

export default function CommunityBoard() {
  const { announcements, noticeBoard, postNotice, profile } = useStore();
  const [draft, setDraft] = useState('');
  const sorted = [...announcements].sort((a, b) => (b.pinned - a.pinned) || (b.postedAt > a.postedAt ? 1 : -1));

  function handlePost(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    postNotice(draft.trim());
    setDraft('');
  }

  return (
    <div className="db-page">
      <header className="db-page-header">
        <h1>Community</h1>
        <p className="tp-sub">Announcements from management and notes from your neighbours.</p>
      </header>

      <div className="db-panel">
        <div className="db-panel-header">
          <Megaphone size={18} strokeWidth={1.75} />
          <h2>Announcements</h2>
        </div>
        <div className="db-announce-list">
          {sorted.map((a) => (
            <div key={a.id} className="db-announce">
              {a.pinned && <span className="db-pin-tag"><Pin size={12} strokeWidth={2} /> Pinned</span>}
              <div className="db-announce-meta">
                <strong>{a.title}</strong>
                <span>{a.author} · {a.postedAt}</span>
              </div>
              <p>{a.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="db-panel">
        <div className="db-panel-header">
          <h2>Notice board</h2>
          <span className="tp-sub">Visible to your building only</span>
        </div>

        <form className="db-notice-form" onSubmit={handlePost}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Post something as Unit ${profile.unit}…`}
          />
          <button className="tp-btn db-notice-send" type="submit" aria-label="Post">
            <Send size={16} strokeWidth={1.75} />
          </button>
        </form>

        <div className="db-notice-list">
          {noticeBoard.map((n) => (
            <div key={n.id} className="db-notice">
              <span className="db-notice-unit">Unit {n.unit}</span>
              <p>{n.body}</p>
              <span className="db-notice-date">{n.postedAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
