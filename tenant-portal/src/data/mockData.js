// Mock data standing in for Supabase queries. Every dashboard widget reads
// from here through the small "store" in src/data/mockStore.js so swapping
// in real API calls later means changing that one file, not the components.

export const mockProfile = {
  name: 'Amina Wanjiru',
  unit: '4B',
  building: 'Nest Court, Kilimani',
  leaseStart: '2025-02-01',
  leaseEnd: '2026-01-31',
  email: 'amina.w@example.com',
  phone: '+254712345678',
  emergencyContact: 'Peter Wanjiru — +254722345678',
  documents: [
    { id: 'doc-1', name: 'Signed lease agreement.pdf', uploadedAt: '2025-02-01' },
    { id: 'doc-2', name: 'National ID copy.pdf', uploadedAt: '2025-02-01' },
  ],
};

export const mockRent = {
  monthlyRent: 32000,
  currency: 'KES',
  dueDay: 5,
  lastPaymentDate: '2026-06-04',
  lastPaymentAmount: 32000,
  status: 'due', // 'paid' | 'due' | 'overdue'
  history: [
    { id: 'pay-1', date: '2026-06-04', amount: 32000, method: 'M-Pesa', receipt: 'NH-2026-0604' },
    { id: 'pay-2', date: '2026-05-05', amount: 32000, method: 'M-Pesa', receipt: 'NH-2026-0505' },
    { id: 'pay-3', date: '2026-04-06', amount: 32000, method: 'Card', receipt: 'NH-2026-0406' },
    { id: 'pay-4', date: '2026-03-05', amount: 32000, method: 'M-Pesa', receipt: 'NH-2026-0305' },
  ],
};

export const mockTickets = [
  {
    id: 'TCK-041',
    category: 'Plumbing',
    title: 'Kitchen sink draining slowly',
    description: 'Water pools in the sink for a few minutes before draining.',
    status: 'in_progress', // open | in_progress | awaiting_parts | done | closed
    createdAt: '2026-07-20',
    updates: [
      { at: '2026-07-20', text: 'Ticket raised by tenant.' },
      { at: '2026-07-21', text: 'Claimed by maintenance — Mark.' },
    ],
  },
  {
    id: 'TCK-036',
    category: 'WiFi',
    title: 'Router disconnects every evening',
    description: 'Connection drops around 7–9pm most nights.',
    status: 'awaiting_parts',
    createdAt: '2026-07-10',
    updates: [
      { at: '2026-07-10', text: 'Ticket raised by tenant.' },
      { at: '2026-07-11', text: 'Claimed by maintenance — James.' },
      { at: '2026-07-13', text: 'Needs a replacement router, ordered.' },
    ],
  },
  {
    id: 'TCK-029',
    category: 'Electrical',
    title: 'Bathroom light flickers',
    description: 'Flickers on and off, especially after rain.',
    status: 'closed',
    createdAt: '2026-06-15',
    updates: [
      { at: '2026-06-15', text: 'Ticket raised by tenant.' },
      { at: '2026-06-16', text: 'Claimed by maintenance — Mark.' },
      { at: '2026-06-17', text: 'Rewired the fixture connection. Resolved.' },
      { at: '2026-06-17', text: 'Closed by tenant.' },
    ],
  },
];

export const ticketCategories = ['Plumbing', 'Electrical', 'WiFi', 'Appliance', 'Pest control', 'Other'];

export const mockAnnouncements = [
  {
    id: 'ann-1',
    author: 'Grounds Manager',
    pinned: true,
    postedAt: '2026-07-25',
    title: 'Water tank cleaning — Sat 2 Aug',
    body: 'Water supply will pause 9am–1pm while the tanks are cleaned. Please store some water in advance.',
  },
  {
    id: 'ann-2',
    author: 'Property Owner',
    pinned: false,
    postedAt: '2026-07-18',
    title: 'New gym equipment in the common room',
    body: 'Two new benches and a rack have been added. Open 5am–10pm daily.',
  },
];

export const mockNoticeBoard = [
  { id: 'note-1', unit: '2A', postedAt: '2026-07-22', body: 'Giving away a small sofa, still in good shape — ping me if interested.' },
  { id: 'note-2', unit: '6C', postedAt: '2026-07-19', body: 'Anyone up for a weekend football game at the court? Saturdays 4pm.' },
];

export const mockNotifications = [
  { id: 'notif-1', type: 'ticket', text: 'Ticket TCK-041 updated: claimed by Mark.', at: '2026-07-21T09:12:00', read: false },
  { id: 'notif-2', type: 'announcement', text: 'New announcement: Water tank cleaning — Sat 2 Aug.', at: '2026-07-25T08:00:00', read: false },
  { id: 'notif-3', type: 'payment', text: 'Rent payment of KES 32,000 confirmed for June.', at: '2026-06-04T14:03:00', read: true },
  { id: 'notif-4', type: 'ticket', text: 'Ticket TCK-029 closed.', at: '2026-06-17T16:40:00', read: true },
];
