import AppShell from '../../components/AppShell.jsx';

export default function TenantHome({ session }) {
  return (
    <AppShell session={session} title="Home">
      <section className="empty">
        <p className="eyebrow">COMING IN PHASE 2</p>
        <p>Rent status, payments, and maintenance tickets will render here once the
          properties/leases/tickets endpoints are built on the backend.</p>
      </section>
    </AppShell>
  );
}
