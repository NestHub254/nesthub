import AppShell from '../../components/AppShell.jsx';

export default function MaintenanceHome({ session }) {
  return (
    <AppShell session={session} title="My work">
      <section className="empty">
        <p className="eyebrow">COMING IN PHASE 4</p>
        <p>Open/claimed tickets and staff chat will render here.</p>
      </section>
    </AppShell>
  );
}
