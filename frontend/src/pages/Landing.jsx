import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Wrench, CreditCard, MessagesSquare, ShieldCheck, Smartphone,
  CheckCircle2, User, Users2, Building, HardHat, Home as HomeIcon, Briefcase,
  Phone, Mail, MessageCircle, Send, MapPin, Eye, BellRing, Camera,
  ClipboardList, Radio, Zap, FileText, LayoutDashboard, BarChart3,
  KeyRound, CheckCheck, Loader2, ArrowRight,
} from 'lucide-react';
import '../styles/landing.css';

const WHATSAPP_NUMBER = '254701388400';
const PHONE_DISPLAY = '0701 388 400';
const FORM_ENDPOINT = 'https://formspree.io/f/xwpnwkoe';
const USD_RATE = 129; // KES per USD, used for the display toggle only

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
  { icon: Zap, label: 'Real-time updates' },
  { icon: CreditCard, label: 'M-Pesa ready' },
  { icon: ShieldCheck, label: 'Role-based security' },
];

const STATS = [
  { value: '250+', label: 'Properties', body: 'Apartment blocks, hostels, bedsitters and mixed developments, all in one place.' },
  { value: '15K+', label: 'Tenants', body: 'Every tenant, lease, payment and maintenance request on one dashboard.' },
  { value: '99.9%', label: 'Platform uptime', body: 'Cloud powered, real-time, and available whenever you need it.' },
  { value: '24/7', label: 'Support', body: 'Owners, staff and tenants stay connected around the clock.' },
];

const CHAIN = [
  { label: 'Owner', body: 'Registers the workspace and adds properties.' },
  { label: 'Reception & maintenance', body: 'The owner creates their logins, scoped to a property.' },
  { label: 'Tenants', body: 'Reception creates tenant logins for each unit.' },
  { label: 'One shared dashboard', body: 'Everyone sees only what their role is scoped to, updated in real time.' },
];

const FEATURES = [
  { icon: Building2, title: 'Properties & units', body: 'Add every building you manage, track units, and keep addresses and ownership in one place.' },
  { icon: Users2, title: 'Tenants', body: 'Keep verified tenant records, contacts, lease history, and documents in sync.' },
  { icon: Wrench, title: 'Maintenance tickets', body: 'Tenants report issues, maintenance claims and closes them — no lost paper slips.' },
  { icon: CreditCard, title: 'Rent & payments', body: 'M-Pesa STK push and card payments, with receipts sent automatically the moment they land.' },
  { icon: MessagesSquare, title: 'Announcements & staff chat', body: 'Reception posts building-wide notices; staff coordinate without leaving the app.' },
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
      { icon: CreditCard, title: 'Pay rent', body: 'M-Pesa STK push or card payment, with an automatic receipt by email and in-app.' },
      { icon: Wrench, title: 'Maintenance tickets', body: 'Raise a ticket with a category, description, and photo, then track it live.' },
      { icon: MessagesSquare, title: 'Community board', body: 'Announcements from management and building notices in one feed.' },
      { icon: User, title: 'My profile', body: 'Unit number, lease dates, emergency contacts, and document uploads.' },
      { icon: BellRing, title: 'Notifications', body: 'Push alerts for payment confirmations, ticket updates, and announcements.' },
    ],
  },
  {
    key: 'owner', label: 'Owner', icon: Briefcase,
    tagline: 'One dashboard for every property you own.',
    features: [
      { icon: Building, title: 'Multi-property view', body: 'A card-based overview of every property — occupancy, revenue, and open issues.' },
      { icon: BarChart3, title: 'Financials', body: 'Revenue by month or property, expected vs collected rent, and outstanding arrears.' },
      { icon: Users2, title: 'Tenant management', body: 'A full directory with lease info, payment history, and contact details.' },
      { icon: ShieldCheck, title: 'Staff management', body: 'Add or remove reception and maintenance logins, and set what each can see.' },
      { icon: FileText, title: 'Reports', body: 'One-click PDF reports for financials, occupancy, and maintenance history.' },
      { icon: KeyRound, title: 'Settings', body: 'Property details, rent amounts, due dates, and announcement permissions.' },
    ],
  },
  {
    key: 'reception', label: 'Reception', icon: User,
    tagline: 'The front desk, minus the paperwork.',
    features: [
      { icon: Users2, title: 'Tenant directory', body: 'Every tenant per property, with unit, payment status, and lease end date.' },
      { icon: ClipboardList, title: 'Ticket queue', body: 'See every open ticket, assign it directly, or leave it open for maintenance to claim.' },
      { icon: CreditCard, title: 'Rent tracking', body: "See who's paid and who's in arrears, and send reminders automatically." },
      { icon: MessagesSquare, title: 'Announcements', body: 'Push a notice to the whole building or a single unit.' },
      { icon: Radio, title: 'Staff chat', body: 'Coordinate with maintenance and the owner in one internal channel.' },
    ],
  },
  {
    key: 'maintenance', label: 'Maintenance', icon: HardHat,
    tagline: 'Pick up jobs and close them from a phone.',
    features: [
      { icon: ClipboardList, title: 'My tickets', body: 'See every open ticket in your category, ready to claim.' },
      { icon: Wrench, title: 'Claim & work', body: "Claim a ticket to own it, so two people don't turn up for the same job." },
      { icon: CheckCheck, title: 'Status updates', body: 'Move a job from in progress to awaiting parts to done — the tenant is notified at each step.' },
      { icon: Camera, title: 'Before & after photos', body: 'Document the fix directly on the ticket.' },
      { icon: Radio, title: 'Staff chat', body: 'Coordinate fixes and confirm resolutions with the team in real time.' },
    ],
  },
];

const LIFECYCLE = [
  { icon: FileText, label: 'Raised', body: 'Category, description, and a photo — logged in seconds.' },
  { icon: Eye, label: 'Seen', body: 'Lands in the reception queue and posts to staff chat instantly.' },
  { icon: Wrench, label: 'Claimed', body: 'Maintenance claims it — one owner, no duplicated jobs.' },
  { icon: ClipboardList, label: 'In progress', body: 'Status moves from in progress to awaiting parts.' },
  { icon: CheckCheck, label: 'Closed', body: 'Maintenance marks it resolved and logs what was done.' },
  { icon: BellRing, label: 'Notified', body: 'The tenant gets an automatic update the moment it is finished.' },
];

const PRICING_PLANS = [
  {
    key: 'basic', name: 'Basic', kes: 1500,
    tagline: 'For a single property just getting off spreadsheets.',
    features: ['1 property, up to 10 units', 'Maintenance ticketing', 'Tenant messaging & announcements', 'Rent status tracking', 'Email support'],
  },
  {
    key: 'standard', name: 'Standard', kes: 2500, popular: true,
    tagline: 'For owners running several properties.',
    features: ['Up to 5 properties, unlimited units', 'M-Pesa rent collection & receipts', 'Reception & maintenance logins', 'Real-time staff chat', 'Monthly PDF reports', 'Priority support'],
  },
  {
    key: 'enterprise', name: 'Enterprise', kes: 5000,
    tagline: 'For portfolios and property management companies.',
    features: ['Unlimited properties & units', 'Multi-property analytics dashboard', 'Custom roles & permissions', 'Dedicated onboarding & data migration', 'API & integration support', 'Dedicated account manager'],
  },
];

const FAQS = [
  { q: 'Who can create an account here?', a: 'Only property owners self-register. Every other login — reception, maintenance, tenants — is created by someone already inside the workspace.' },
  { q: 'How do tenants get access?', a: 'Reception creates a tenant login from their dashboard once a lease starts. Tenants use a separate tenant app to sign in.' },
  { q: 'Is my data isolated from other owners?', a: 'Yes. Every property, user, and ticket is scoped to the owner and property it belongs to at the database level.' },
  { q: 'Is rent collected through M-Pesa?', a: 'Yes — tenants pay by M-Pesa STK push or card, and a receipt is issued automatically the moment payment lands.' },
  { q: 'Can I switch between KES and USD?', a: 'Yes, use the currency toggle on the pricing section. Billing runs in Kenyan shillings; USD is shown for reference.' },
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
      <header className="lp-nav">
        <span className="lp-brand"><span className="lp-mark">n</span>NestHub</span>
        <nav className="lp-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#who">Who it's for</a>
          <a href="#pricing">Pricing</a>
          <a href="#faqs">FAQs</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="lp-nav-actions">
          <Link className="lp-btn lp-btn-ghost" to="/login">Log in</Link>
          <Link className="lp-btn lp-btn-solid" to="/register">Create account</Link>
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
                <div><h5>Automatic rent collection</h5><p>M-Pesa payments, receipts, reminders, and reports.</p></div>
              </div>
              <div className="lp-check">
                <CheckCircle2 size={20} />
                <div><h5>Maintenance tracking</h5><p>Raise, assign, monitor, and close tickets in real time.</p></div>
              </div>
              <div className="lp-check">
                <CheckCircle2 size={20} />
                <div><h5>Real-time communication</h5><p>Owners, reception, maintenance and tenants stay connected.</p></div>
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
          <h2 className="lp-section-title">Simple pricing that scales with your portfolio.</h2>
          <p className="lp-lead">No hidden fees. Cancel anytime.</p>
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
                {plan.popular && <span className="lp-price-badge">Most popular</span>}
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
                  Choose {plan.name}
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
            <a className="lp-contact-card" href="mailto:hello@nesthub.app">
              <span className="lp-contact-icon"><Mail size={18} /></span>
              <div><strong>Email</strong><p>hello@nesthub.app</p></div>
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
            <span className="lp-brand"><span className="lp-mark">n</span>NestHub</span>
            <p>Rental management workspace for owners, reception, maintenance, and tenants — everything scoped to who should see it.</p>
            <div className="lp-footer-contact">
              <a className="lp-btn lp-btn-ghost lp-btn-sm" href="tel:+254701388400"><Phone size={14} /> Call</a>
              <a className="lp-btn lp-btn-ghost lp-btn-sm" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a>
              <a className="lp-btn lp-btn-ghost lp-btn-sm" href="mailto:hello@nesthub.app"><Mail size={14} /> Email</a>
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
            <a href="/data-deletion/">Data Deletion</a>
          </div>
        </div>
      </footer>
    </div>
  );
}