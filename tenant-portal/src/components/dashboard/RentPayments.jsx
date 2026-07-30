import { useState } from 'react';
import { Smartphone, CreditCard, Receipt, CircleCheck, Loader2 } from 'lucide-react';
import { useStore } from '../../data/mockStore.jsx';

export default function RentPayments() {
  const { rent, payRent } = useStore();
  const [paying, setPaying] = useState(null); // null | 'M-Pesa' | 'Card'
  const [justPaid, setJustPaid] = useState(false);

  async function handlePay(method) {
    setPaying(method);
    await payRent(method);
    setPaying(null);
    setJustPaid(true);
    setTimeout(() => setJustPaid(false), 4000);
  }

  return (
    <div className="db-page">
      <header className="db-page-header">
        <h1>Rent & Payments</h1>
        <p className="tp-sub">Pay your rent and review your payment history.</p>
      </header>

      <div className="db-panel db-rent-summary">
        <div>
          <span className="db-card-label">Monthly rent</span>
          <strong className="db-rent-amount">KES {rent.monthlyRent.toLocaleString()}</strong>
          <span className="db-card-sub">Due on the {rent.dueDay}th • Status: {rent.status === 'paid' ? 'Paid up' : rent.status === 'due' ? 'Due soon' : 'Overdue'}</span>
        </div>

        {justPaid ? (
          <div className="db-pay-success">
            <CircleCheck size={20} strokeWidth={1.75} /> Payment confirmed
          </div>
        ) : (
          <div className="db-pay-actions">
            <button className="tp-btn db-pay-btn" disabled={!!paying} onClick={() => handlePay('M-Pesa')}>
              {paying === 'M-Pesa' ? <Loader2 size={16} className="db-spin" /> : <Smartphone size={16} strokeWidth={1.75} />}
              {paying === 'M-Pesa' ? 'Awaiting M-Pesa PIN…' : 'Pay with M-Pesa'}
            </button>
            <button className="tp-btn tp-btn-ghost db-pay-btn" disabled={!!paying} onClick={() => handlePay('Card')}>
              {paying === 'Card' ? <Loader2 size={16} className="db-spin" /> : <CreditCard size={16} strokeWidth={1.75} />}
              {paying === 'Card' ? 'Processing…' : 'Pay with card'}
            </button>
          </div>
        )}
      </div>

      {paying === 'M-Pesa' && (
        <div className="db-panel db-stk-note">
          <Smartphone size={16} strokeWidth={1.75} />
          <span>An STK push has been sent to your phone. Enter your M-Pesa PIN to confirm KES {rent.monthlyRent.toLocaleString()}.</span>
        </div>
      )}

      <div className="db-panel">
        <div className="db-panel-header">
          <Receipt size={18} strokeWidth={1.75} />
          <h2>Payment history</h2>
        </div>
        <table className="db-table">
          <thead>
            <tr><th>Date</th><th>Method</th><th>Amount</th><th>Receipt</th></tr>
          </thead>
          <tbody>
            {rent.history.map((p) => (
              <tr key={p.id}>
                <td>{p.date}</td>
                <td>{p.method}</td>
                <td>KES {p.amount.toLocaleString()}</td>
                <td className="db-receipt">{p.receipt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
