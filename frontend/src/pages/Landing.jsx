import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Wrench, CreditCard, MessagesSquare, ShieldCheck, Smartphone,
  CheckCircle2, User, Users2, Building, HardHat, Home as HomeIcon, Briefcase,
  Phone, Mail, MessageCircle, Send, MapPin, Eye, BellRing, Camera,
  ClipboardList, Radio, Zap, FileText, LayoutDashboard, BarChart3,
  KeyRound, CheckCheck, Loader2, ArrowRight, Menu, X,
} from 'lucide-react';
import '../styles/landing.css';

const WHATSAPP_NUMBER = '254701388400';
const PHONE_DISPLAY = '0701 388 400';
const FORM_ENDPOINT = 'https://formspree.io/f/xwpnwkoe';
const USD_RATE = 129; // KES per USD, used for the display toggle only
const TENANT_PORTAL_URL = import.meta.env.VITE_TENANT_PORTAL_URL || 'https://nesthub-tenants.vercel.app';

const CORE_MODULES = [
  { icon: Building2, label: 'Property Management' },
  { icon: Users2, label: 'Tenant Management' },
  { icon: Wrench, label: 'Maintenance' },
  { icon: CreditCard, label: 'Rent Collection' },
  { icon: MessagesSquare, label: 'Staff Communication' },
  { icon: ShieldCheck, label: 'Secure Access' },
];

const TRUST_BADGES = [
  { icon: Smartphone, label: 'Installs like an app' },
  { icon: Zap, label: 'Updates every 30 seconds' },
  { icon: CreditCard, label: 'M-Pesa reference tracking' },
  { icon: ShieldCheck, label: 'Role-based security' },
];

const STATS = [
 {value:'Owners',label:'Property workspace',body:'Units, residents, money and repairs in one place.'},
 {value:'Tenants',label:'A separate portal',body:'Balances, payment references, messages and repair requests.'},
 {value:'Staff',label:'Assigned work',body:'Managers and maintenance staff have different access.'},
 {value:'Mobile',label:'Installable PWA',body:'Use NestHub on a phone or laptop.'},
];

const CHAIN = [
  { label: 'Owner', body: 'Registers the workspace and adds properties.' },
  { label: 'Reception & maintenance', body: 'The owner creates their logins, scoped to a property.' },
  { label: 'Tenants', body: 'The owner creates a tenant account and assigns a vacant unit.' },
  { label: 'One shared dashboard', body: 'Each role sees its permitted records; open dashboards refresh every 30 seconds.' },
];

const FEATURES = [
  { icon: Building2, title: 'Properties & units', body: 'Add every building you manage, track units, and keep addresses and ownership in one place.' },
  { icon: Users2, title: 'Tenants', body: 'Keep tenant accounts, contact details, assigned homes and tenancy history together.' },
  { icon: Wrench, title: 'Maintenance tickets', body: 'Tenants report issues; management assigns staff, who update progress and completion.' },
  { icon: CreditCard, title: 'Rent & payments', body: 'Record M-Pesa, bank or cash payments. Management verifies references before balances and downloadable receipts update.' },
  { icon: MessagesSquare, title: 'Communications & community', body: 'Management emails registered tenants; residents connect through a private property community with photos and bios. SMS is ready for provider setup.' },
  { icon: ShieldCheck, title: 'Role-scoped access', body: 'Owners, reception, maintenance, and tenants each see only what their role needs.' },
];

const WHO_FOR = [
  { icon: User, title: 'Individual owners', body: 'Manage a few units or many — track rent, leases, and maintenance effortlessly.' },
  { icon: Building, title: 'Multi-property owners', body: 'Oversee several buildings from one workspace, scoped by property.' },
  { icon: Briefcase, title: 'Reception teams', body: 'Log tenant details, post notices, and keep the front desk paperless.' },
  { icon: HardHat, title: 'Maintenance staff', body: 'Pick up tickets, update status, and close jobs from a phone.' },
  { icon: HomeIcon, title: 'Tenants', body: 'Report issues and check rent status from a dedicated tenant app.' },
  { icon: Users2, title: 'Growing teams', body: 'Add staff as you grow, each scoped to exactly what they should see.' },
];

const ROLE_TABS = [
  {
    key: 'tenant', label: 'Tenant', icon: HomeIcon,
    tagline: 'Everything a tenant needs, from their phone.',
    features: [
      { icon: LayoutDashboard, title: 'Dashboard', body: 'Rent status, last payment date, next due date, and any open tickets at a glance.' },
      { icon: CreditCard, title: 'Pay rent', body: 'Pay externally by M-Pesa or bank transfer, submit a reference, and download a receipt after management confirms it.' },
      { icon: Wrench, title: 'Maintenance tickets', body: 'Describe a repair, set its urgency, and follow management and staff updates.' },
      { icon: MessagesSquare, title: 'Tenant community', body: 'Chat with neighbours in your property, add a profile photo and share a short bio.' },
      { icon: User, title: 'My home', body: 'See your assigned unit, monthly rent and tenancy dates.' },
      { icon: BellRing, title: 'Notifications', body: 'Read payment and repair updates in NestHub; management notices can also arrive by email.' },
    ],
  },
  {
    key: 'owner', label: 'Owner', icon: Briefcase,
    tagline: 'One dashboard for every property you own.',
    features: [
      { icon: Building, title: 'Multi-property view', body: 'Switch between your properties to view occupancy, income and open repairs.' },
      { icon: BarChart3, title: 'Financials', body: 'Revenue by month or property, expected vs collected rent, and outstanding arrears.' },
      { icon: Users2, title: 'Tenant management', body: 'A full directory with lease info, payment history, and contact details.' },
      { icon: ShieldCheck, title: 'Staff management', body: 'Create property manager and maintenance logins with predefined access permissions.' },
      { icon: FileText, title: 'Reports', body: 'View monthly cash and billed results, occupancy and unpaid bills; print or save the report as PDF.' },
      { icon: KeyRound, title: 'Settings', body: 'Set tenancy rent and due dates during move-in, and share payment instructions with residents.' },
    ],
  },
  {
    key: 'reception', label: 'Reception', icon: User,
    tagline: 'The front desk, minus the paperwork.',
    features: [
      { icon: Users2, title: 'Tenant directory', body: 'Every tenant per property, with unit, payment status, and lease end date.' },
      { icon: ClipboardList, title: 'Ticket queue', body: 'See open repairs, assign a staff member and follow progress.' },
      { icon: CreditCard, title: 'Rent tracking', body: "See who has paid, check unpaid bills, and prepare an email or SMS payment reminder." },
      { icon: MessagesSquare, title: 'Email & SMS notices', body: 'Choose one tenant or everyone, review registered contacts and send email. SMS needs a connected provider.' },
      { icon: Radio, title: 'Building communication', body: 'Use private team chat and repair updates to coordinate the building team.' },
    ],
  },
  {
    key: 'maintenance', label: 'Maintenance', icon: HardHat,
    tagline: 'Pick up jobs and close them from a phone.',
    features: [
      { icon: ClipboardList, title: 'My tickets', body: 'See repair jobs assigned to your account.' },
      { icon: Wrench, title: 'Assigned jobs', body: "Management assigns the job to one responsible staff member." },
      { icon: CheckCheck, title: 'Status updates', body: 'Update progress and mark completion with a note that the tenant can read.' },
      { icon: Camera, title: 'Repair photos & notes', body: 'Attach private photos of the problem or completed work, alongside progress notes.' },
      { icon: Radio, title: 'Team communication', body: 'Coordinate privately with management in team chat and keep residents informed through repair updates.' },
    ],
  },
];

const LIFECYCLE = [
  { icon: FileText, label: 'Raised', body: 'Title, description and urgency — logged in seconds.' },
  { icon: Eye, label: 'Seen', body: 'Appears on the property repair board.' },
  { icon: Wrench, label: 'Assigned', body: 'Management assigns a responsible staff member.' },
  { icon: ClipboardList, label: 'In progress', body: 'Staff update progress and explain the next step.' },
  { icon: CheckCheck, label: 'Closed', body: 'Maintenance marks it resolved and logs what was done.' },
  { icon: BellRing, label: 'Notified', body: 'The update appears in the tenant’s repairs and messages.' },
];

const PRICING_PLANS = [
 {key:'basic',name:'Basic',kes:1500,tagline:'Proposed: one small property.',features:['1 property, up to 10 units','Tenant accounts & manual payments','Repairs & in-app messages','Email password recovery on every plan']},
 {key:'standard',name:'Standard',kes:2500,popular:true,tagline:'Proposed: growing property teams.',features:['Up to 5 properties, unlimited units','Manager & maintenance accounts','Expenses & monthly reports','Provider integrations when connected']},
 {key:'enterprise',name:'Enterprise',kes:5000,tagline:'Proposed: larger portfolios.',features:['Unlimited properties & units','Portfolio reports & CSV exports','Custom roles & integrations (planned)','Onboarding scope agreed separately']},
];

const FAQS = [
  { q: 'Who can create an account here?', a: 'Only property owners self-register. Every other login — reception, maintenance, tenants — is created by someone already inside the workspace.' },
  { q: 'How do tenants get access?', a: 'The owner moves a tenant into a vacant unit and creates their login. Tenants use the separate tenant portal.' },
  { q: 'Is my data isolated from other owners?', a: 'Yes. Every property, user, and ticket is checked against your owner or property permissions by the server.' },
  { q: 'Is rent collected through M-Pesa?', a: 'Tenants pay externally by M-Pesa or bank transfer and submit a reference. Management verifies it before confirming. STK push, card collection and automatic reconciliation are not connected yet.' },
  { q: 'Can I switch between KES and USD?', a: 'Yes. USD is an approximate display conversion. Prices are proposed in KES; paid subscriptions and checkout are not active yet.' },
  { q: 'What happens after I request a demo?', a: "We'll get back to you within one business day by email or phone to schedule a walkthrough suited to your portfolio." },
];

function formatPrice(kes, currency) {
  if (currency === 'USD') return `$${Math.round(kes / USD_RATE)}`;
  return `KES ${kes.toLocaleString('en-KE')}`;
}

/** Fades sections in as they scroll into view. */
function useReveal() {
  const rootRef = useRef(null);
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.reveal, .reveal-stagger') || [];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return rootRef;
}

export default function Landing() {
  const [activeRole, setActiveRole] = useState(ROLE_TABS[0].key);
  const [currency, setCurrency] = useState('KES');
  const [demoStatus, setDemoStatus] = useState('idle'); // idle | sending | sent | error
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeTab = ROLE_TABS.find((r) => r.key === activeRole);
  const pageRef = useReveal();

  async function handleDemoSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    setDemoStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setDemoStatus('sent');
        form.reset();
      } else {
        setDemoStatus('error');
      }
    } catch {
      setDemoStatus('error');
    }
  }

  return (
    <div className="lp-page" ref={pageRef}>
      <header className={`lp-nav${mobileNavOpen ? ' lp-nav-open' : ''}`}>
        <span className="lp-brand"><img src="/brand/owner-mark.svg" alt="" width="36" height="36" style={{display:'block',flexShrink:0,borderRadius:9}}/>NestHub</span>
        <button className="lp-mobile-menu" type="button" aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}>
          {mobileNavOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className="lp-nav-links" id="landing-navigation">
          <a href="#how-it-works" onClick={() => setMobileNavOpen(false)}>How it works</a>
          <a href="#features" onClick={() => setMobileNavOpen(false)}>Features</a>
          <a href="#who" onClick={() => setMobileNavOpen(false)}>Who it's for</a>
          <a href="#pricing" onClick={() => setMobileNavOpen(false)}>Pricing</a>
          <a href="#faqs" onClick={() => setMobileNavOpen(false)}>FAQs</a>
          <a href="#contact" onClick={() => setMobileNavOpen(false)}>Contact</a>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-btn lp-btn-ghost lp-tenant-link" href={TENANT_PORTAL_URL}>Tenant portal</a>
          <Link className="lp-btn lp-btn-ghost" to="/login" onClick={() => setMobileNavOpen(false)}>Log in</Link>
          <Link className="lp-btn lp-btn-solid" to="/register" onClick={() => setMobileNavOpen(false)}>Create account</Link>
        </div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="lp-hero">
          <span className="lp-hero-blob lp-hero-blob-a" />
          <span className="lp-hero-blob lp-hero-blob-b" />

          <div className="lp-hero-copy reveal" data-reveal="left">
            <div className="lp-eyebrow">Property Management • Reimagined</div>
            <h1>Manage every <span>property</span> without the paperwork.</h1>
            <p className="lp-lead">
              NestHub is a modern rental management platform built for property owners,
              apartments, hostels, gated communities, and property management companies.
              Collect rent, manage tenants, assign maintenance, and run every property
              from one beautiful dashboard.
            </p>
            <div className="lp-hero-actions">
              <Link to="/register" className="lp-btn lp-btn-solid lp-btn-lg">
                Get started <ArrowRight size={18} />
              </Link>
              <a href="#demo" className="lp-btn lp-btn-ghost lp-btn-lg">Book a demo</a>
            </div>
            <ul className="lp-badges">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <li key={label}><Icon size={17} />{label}</li>
              ))}
            </ul>
          </div>

          <div className="lp-hero-visual reveal" data-reveal="right">
            <div className="lp-hero-frame">
              <img
                src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80"
                alt="Apartment building facade representing multi-unit rental property management in Kenya"
                width="1200"
                height="800"
                loading="lazy"
              />
            </div>

            <div className="lp-hero-panel">
              <p className="lp-hero-panel-eyebrow">Core modules</p>
              <ul className="lp-module-list">
                {CORE_MODULES.map(({ icon: Icon, label }) => (
                  <li key={label}><Icon size={17} />{label}</li>
                ))}
              </ul>
            </div>

            <div className="lp-floating-card">
              <span className="lp-floating-ring"><CheckCircle2 size={18} /></span>
              <div>
                <h4>98%</h4>
                <span>Occupancy rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section className="lp-stats reveal-stagger">
          {STATS.map((s) => (
            <div className="lp-stat" key={s.label}>
              <h2>{s.value}</h2>
              <h4>{s.label}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how-it-works" className="lp-section text-center">
          <div className="lp-eyebrow lp-eyebrow-center">How it works</div>
          <h2 className="lp-section-title">One workspace, four roles, zero confusion.</h2>
          <p className="lp-lead">
            Access flows from the top down — every login is created inside the workspace,
            scoped to exactly what that person should see.
          </p>
          <div className="lp-chain reveal-stagger">
            {CHAIN.map((c, i) => (
              <div className="lp-chain-step" key={c.label}>
                <span className="lp-chain-num">{i + 1}</span>
                <h4>{c.label}</h4>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ HIGHLIGHT / DASHBOARD MOCKUP ============ */}
        <section className="lp-highlight">
          <div className="lp-highlight-content reveal" data-reveal="left">
            <div className="lp-eyebrow">Everything in one place</div>
            <h2 className="lp-section-title">Your entire rental business, one dashboard.</h2>
            <p>
              Stop switching between spreadsheets, WhatsApp, notebooks and receipts.
              NestHub gives owners one workspace for every property, every tenant,
              every payment, and every maintenance request.
            </p>
            <div className="lp-check-grid">
              <div className="lp-check">
                <CheckCircle2 size={20} />
                <div><h5>Multi-property management</h5><p>Apartments, hostels, rentals, and gated communities.</p></div>
              </div>
              <div className="lp-check">
                <CheckCircle2 size={20} />
                <div><h5>Rent tracking & confirmation</h5><p>Payment checkout, approved receipts, email reminders and reports.</p></div>
              </div>
              <div className="lp-check">
                <CheckCircle2 size={20} />
                <div><h5>Maintenance tracking</h5><p>Raise, assign, monitor and close repair requests.</p></div>
              </div>
              <div className="lp-check">
                <CheckCircle2 size={20} />
                <div><h5>Building conversations</h5><p>Owners, reception, maintenance and tenants stay connected.</p></div>
              </div>
            </div>
          </div>

          <div className="lp-highlight-image reveal" data-reveal="right">
            <img
              src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80"
              alt="Laptop showing a property management dashboard for rental operations"
              width="1200"
              height="800"
              loading="lazy"
            />
            <span className="lp-dashboard-note">Illustrative dashboard · sample figures</span>
            <div className="lp-dashboard-card large card-revenue">
              <h5>Monthly revenue</h5>
              <h2>KES 4.8M</h2>
              <div className="lp-mini-chart">
                <span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div className="lp-dashboard-card small card-occupancy">
              <h5>Occupancy</h5>
              <div className="lp-progress"><span></span></div>
              <p>94% occupied</p>
            </div>
            <div className="lp-dashboard-card small card-maintenance">
              <h5>Maintenance</h5>
              <h2>21</h2>
              <p>Open tickets</p>
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section id="features" className="lp-section text-center">
          <div className="lp-eyebrow lp-eyebrow-center">Features</div>
          <h2 className="lp-section-title">Built around how rental businesses actually work.</h2>
          <p className="lp-lead">
            Real apartments, real tenants, real maintenance teams, and real property
            owners who need everything in one secure place.
          </p>
          <div className="lp-feature-grid reveal-stagger">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div className="lp-feature-card" key={title}>
                <span className="lp-feature-icon"><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ ROLE TABS ============ */}
        <section id="roles" className="lp-section lp-section-muted text-center">
          <div className="lp-eyebrow lp-eyebrow-center">A view for every role</div>
          <h2 className="lp-section-title">See what each person actually gets.</h2>
          <div className="lp-role-tabs">
            {ROLE_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`lp-role-tab${activeRole === key ? ' active' : ''}`}
                onClick={() => setActiveRole(key)}
              >
                <Icon size={16} />{label}
              </button>
            ))}
          </div>
          <p className="lp-role-tagline">{activeTab.tagline}</p>
          <div className="lp-role-grid">
            {activeTab.features.map(({ icon: Icon, title, body }) => (
              <div className="lp-role-card" key={title}>
                <Icon size={20} />
                <div><h4>{title}</h4><p>{body}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ TICKET LIFECYCLE ============ */}
        <section className="lp-section text-center">
          <div className="lp-eyebrow lp-eyebrow-center">Maintenance, tracked</div>
          <h2 className="lp-section-title">Every ticket, from raised to resolved.</h2>
          <div className="lp-lifecycle reveal-stagger">
            {LIFECYCLE.map(({ icon: Icon, label, body }) => (
              <div className="lp-life-step" key={label}>
                <span className="lp-life-icon"><Icon size={20} /></span>
                <h5>{label}</h5>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ WHO IT'S FOR ============ */}
        <section id="who" className="lp-section lp-section-muted text-center">
          <div className="lp-eyebrow lp-eyebrow-center">Who it's for</div>
          <h2 className="lp-section-title">Built for everyone around a property.</h2>
          <div className="lp-who-grid reveal-stagger">
            {WHO_FOR.map(({ icon: Icon, title, body }) => (
              <div className="lp-who-card" key={title}>
                <span className="lp-who-icon"><Icon size={20} /></span>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section id="pricing" className="lp-section text-center">
          <div className="lp-eyebrow lp-eyebrow-center">Pricing</div>
          <h2 className="lp-section-title">Proposed plans for a growing portfolio.</h2>
          <p className="lp-lead">MVP access is currently unmetered. These are proposed packages; checkout, billing and plan limits are not active yet.</p>
          <div className="lp-pricing-toggle">
            <button
              type="button"
              className={`lp-toggle-btn${currency === 'KES' ? ' active' : ''}`}
              onClick={() => setCurrency('KES')}
            >KES</button>
            <button
              type="button"
              className={`lp-toggle-btn${currency === 'USD' ? ' active' : ''}`}
              onClick={() => setCurrency('USD')}
            >USD</button>
          </div>
          <div className="lp-pricing-grid">
            {PRICING_PLANS.map((plan) => (
              <div className={`lp-price-card${plan.popular ? ' popular' : ''}`} key={plan.key}>
                {plan.popular && <span className="lp-price-badge">Proposed Standard</span>}
                <h3>{plan.name}</h3>
                <p className="lp-price-tagline">{plan.tagline}</p>
                <div className="lp-price-amount">
                  <strong>{formatPrice(plan.kes, currency)}</strong>
                  <span>/ month</span>
                </div>
                <ul className="lp-price-features">
                  {plan.features.map((f) => (
                    <li key={f}><CheckCircle2 size={16} />{f}</li>
                  ))}
                </ul>
                <Link
                  className={`lp-btn ${plan.popular ? 'lp-btn-solid' : 'lp-btn-ghost'} lp-btn-lg`}
                  to="/register"
                >
                  Explore {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ============ DEMO REQUEST ============ */}
        <section id="demo" className="lp-section lp-section-muted">
          <div className="lp-demo-grid">
            <div className="reveal" data-reveal="left">
              <div className="lp-eyebrow">Book a demo</div>
              <h2 className="lp-section-title">See NestHub with your own portfolio in mind.</h2>
              <p className="lp-lead lp-lead-left">
                Tell us a little about your properties and we'll walk you through the parts
                that matter most to you.
              </p>
              <ul className="lp-demo-list">
                <li><CheckCircle2 size={18} /> A guided tour of rent, tenants, and maintenance.</li>
                <li><CheckCircle2 size={18} /> Answers to your specific questions.</li>
                <li><CheckCircle2 size={18} /> Guidance on setting up your first properties.</li>
              </ul>
              <Link className="lp-btn lp-btn-solid" to="/register">Or skip ahead — set up now</Link>
            </div>

            <form className="lp-form reveal" data-reveal="right" onSubmit={handleDemoSubmit}>
              <input type="hidden" name="_subject" value="New NestHub demo request" />
              <label className="lp-form-field">
                <span>Full name*</span>
                <input type="text" name="name" required placeholder="Jane Wanjiru" />
              </label>
              <div className="lp-form-row">
                <label className="lp-form-field">
                  <span>Email*</span>
                  <input type="email" name="email" required placeholder="you@example.com" />
                </label>
                <label className="lp-form-field">
                  <span>Phone number</span>
                  <input type="tel" name="phone" placeholder="+254 700 000000" />
                </label>
              </div>
              <label className="lp-form-field">
                <span>Property name</span>
                <input type="text" name="property" placeholder="ABC Apartments" />
              </label>
              <label className="lp-form-field">
                <span>What would you like to cover?</span>
                <textarea name="message" rows={4} placeholder="Share your goals, portfolio size, or questions."></textarea>
              </label>
              <button className="lp-btn lp-btn-solid lp-btn-lg lp-form-submit" type="submit" disabled={demoStatus === 'sending'}>
                {demoStatus === 'sending' ? <Loader2 size={16} className="lp-spin" /> : <Send size={16} />}
                {demoStatus === 'sending' ? 'Sending…' : 'Request a demo'}
              </button>
              <p className="lp-form-status">Your details are sent to Formspree to handle this demo request. See our <a href="/privacy/">Privacy notice</a>.</p>
              {demoStatus === 'sent' && <p className="lp-form-status lp-form-status-ok"><CheckCircle2 size={15} /> Thanks — we'll be in touch within one business day.</p>}
              {demoStatus === 'error' && <p className="lp-form-status lp-form-status-error">Something went wrong. Please call or WhatsApp us instead.</p>}
            </form>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faqs" className="lp-section text-center">
          <div className="lp-eyebrow lp-eyebrow-center">FAQs</div>
          <h2 className="lp-section-title">Common questions.</h2>
          <div className="lp-faq-list">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="lp-faq-item">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section id="contact" className="lp-contact-band reveal">
          <div className="lp-contact-heading">
            <div className="lp-eyebrow">Talk to us</div>
            <h2 className="lp-section-title">Prefer to speak to someone directly?</h2>
            <p className="lp-lead lp-lead-left">Call, WhatsApp, or email — we usually reply the same day.</p>
          </div>
          <div className="lp-contact-grid">
            <a className="lp-contact-card" href="tel:+254701388400">
              <span className="lp-contact-icon"><Phone size={18} /></span>
              <div><strong>Call us</strong><p>{PHONE_DISPLAY}</p></div>
            </a>
            <a className="lp-contact-card" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
              <span className="lp-contact-icon"><MessageCircle size={18} /></span>
              <div><strong>WhatsApp</strong><p>{PHONE_DISPLAY}</p></div>
            </a>
            <a className="lp-contact-card" href="#contact">
              <span className="lp-contact-icon"><Mail size={18} /></span>
              <div><strong>Request an email reply</strong><p>Use the contact form below.</p></div>
            </a>
            <span className="lp-contact-card lp-contact-card-static">
              <span className="lp-contact-icon"><MapPin size={18} /></span>
              <div><strong>Based in</strong><p>Nairobi, Kenya</p></div>
            </span>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="lp-cta">
          <div className="lp-cta-inner reveal">
            <div>
              <h2>Ready to set up your workspace?</h2>
              <p>Register as an owner, add your first property, and hand out staff logins in minutes.</p>
            </div>
            <div className="lp-cta-actions">
              <Link className="lp-btn lp-btn-solid lp-btn-lg" to="/register">Set up as an owner <ArrowRight size={16} /></Link>
              <a className="lp-btn lp-btn-ghost-invert lp-btn-lg" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div className="lp-footer-col lp-footer-brand">
            <span className="lp-brand"><img src="/brand/owner-mark.svg" alt="" width="36" height="36" style={{display:'block',flexShrink:0,borderRadius:9}}/>NestHub</span>
            <p>Rental management workspace for owners, reception, maintenance, and tenants — everything scoped to who should see it.</p>
            <div className="lp-footer-contact">
              <a className="lp-btn lp-btn-ghost lp-btn-sm" href="tel:+254701388400"><Phone size={14} /> Call</a>
              <a className="lp-btn lp-btn-ghost lp-btn-sm" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a>
              <a className="lp-btn lp-btn-ghost lp-btn-sm" href="#contact"><Mail size={14} /> Email</a>
            </div>
          </div>

          <div className="lp-footer-col">
            <h4>Quick links</h4>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#who">Who it's for</a>
            <a href="#pricing">Pricing</a>
            <a href="#faqs">FAQs</a>
          </div>

          <div className="lp-footer-col">
            <h4>Product</h4>
            <a href="#features">Properties &amp; units</a>
            <a href="#features">Maintenance tickets</a>
            <a href="#features">Rent &amp; payments</a>
            <a href="#features">Announcements</a>
          </div>

          <div className="lp-footer-col">
            <h4>Account</h4>
            <Link to="/register">Create an owner account</Link>
            <Link to="/login">Staff / owner log in</Link>
            <a href="#demo">Book a demo</a>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <div className="lp-footer-bottom-copy">
            <span>© {new Date().getFullYear()} NestHub · Rental living, simplified.</span>
            <span className="lp-footer-partner">
              Technology partnership: NestHub ×{' '}
              <a
                href="https://sionaglobal.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                SIONA Technologies Limited
              </a>
              .
            </span>
          </div>
          <div className="lp-footer-legal">
            <a href="/privacy/">Privacy Policy</a>
            <a href="/terms/">Terms of Service</a>
            <a href="/data-deletion/">Data Deletion</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
