import { useState } from 'react';
import { Plus, X, Paperclip, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../data/mockStore.jsx';
import { ticketCategories } from '../../data/mockData.js';

const STEPS = ['open', 'in_progress', 'awaiting_parts', 'done', 'closed'];
const STEP_LABELS = {
  open: 'Raised',
  in_progress: 'In progress',
  awaiting_parts: 'Awaiting parts',
  done: 'Done',
  closed: 'Closed',
};

function TicketStepper({ status }) {
  const currentIndex = STEPS.indexOf(status);
  return (
    <div className="db-stepper">
      {STEPS.map((step, i) => (
        <div key={step} className={`db-step ${i <= currentIndex ? 'db-step-done' : ''}`}>
          <span className="db-step-dot" />
          <span className="db-step-label">{STEP_LABELS[step]}</span>
        </div>
      ))}
    </div>
  );
}

function NewTicketModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ category: ticketCategories[0], title: '', description: '' });
  const [fileName, setFileName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate(form);
    onClose();
  }

  return (
    <div className="db-modal-backdrop" onClick={onClose}>
      <div className="db-modal" onClick={(e) => e.stopPropagation()}>
        <div className="db-modal-header">
          <h2>Raise a ticket</h2>
          <button className="db-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="db-form">
          <label>Category
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {ticketCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Bathroom tap won't shut off"
              required
            />
          </label>
          <label>Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Add any details that will help maintenance fix it faster."
            />
          </label>
          <label className="db-file-label">
            <Paperclip size={15} strokeWidth={1.75} />
            <span>{fileName || 'Attach a photo (optional)'}</span>
            <input type="file" accept="image/*" hidden onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
          </label>
          <button className="tp-btn" type="submit">Submit ticket</button>
        </form>
      </div>
    </div>
  );
}

export default function MaintenanceTickets() {
  const { tickets, createTicket, closeTicket } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="db-page">
      <header className="db-page-header db-page-header-row">
        <div>
          <h1>Maintenance</h1>
          <p className="tp-sub">Raise a ticket and track it in real time.</p>
        </div>
        <button className="tp-btn db-header-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} strokeWidth={2} /> New ticket
        </button>
      </header>

      <div className="db-ticket-list">
        {tickets.map((t) => (
          <div key={t.id} className={`db-panel db-ticket ${expanded === t.id ? 'db-ticket-open' : ''}`}>
            <button className="db-ticket-summary" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
              <div>
                <span className="db-ticket-id">{t.id}</span>
                <span className="db-ticket-title">{t.title}</span>
              </div>
              <span className={`db-badge db-badge-${t.status}`}>{STEP_LABELS[t.status]}</span>
            </button>

            {expanded === t.id && (
              <div className="db-ticket-details">
                <p className="db-ticket-desc">{t.description}</p>
                <TicketStepper status={t.status} />
                <ul className="db-ticket-updates">
                  {t.updates.map((u, i) => (
                    <li key={i}><span>{u.at}</span>{u.text}</li>
                  ))}
                </ul>
                {t.status !== 'closed' && t.status === 'done' && (
                  <button className="tp-btn tp-btn-ghost db-confirm-close" onClick={() => closeTicket(t.id)}>
                    <CheckCircle2 size={15} strokeWidth={1.75} /> Confirm fixed & close
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <NewTicketModal onClose={() => setShowModal(false)} onCreate={createTicket} />
      )}
    </div>
  );
}
