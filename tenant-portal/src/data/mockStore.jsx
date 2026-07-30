import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  mockProfile, mockRent, mockTickets, mockAnnouncements,
  mockNoticeBoard, mockNotifications,
} from './mockData.js';

const STORE_KEY = 'nesthub_mock_store_v1';
const StoreContext = createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to defaults */ }
  return {
    profile: mockProfile,
    rent: mockRent,
    tickets: mockTickets,
    announcements: mockAnnouncements,
    noticeBoard: mockNoticeBoard,
    notifications: mockNotifications,
  };
}

let ticketSeq = 42;
let noticeSeq = 3;

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state]);

  const pushNotification = useCallback((type, text) => {
    setState((s) => ({
      ...s,
      notifications: [
        { id: `notif-${Date.now()}`, type, text, at: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    }));
  }, []);

  const payRent = useCallback((method) => {
    return new Promise((resolve) => {
      // Simulates an M-Pesa STK push round trip.
      setTimeout(() => {
        const today = new Date().toISOString().slice(0, 10);
        setState((s) => ({
          ...s,
          rent: {
            ...s.rent,
            status: 'paid',
            lastPaymentDate: today,
            lastPaymentAmount: s.rent.monthlyRent,
            history: [
              { id: `pay-${Date.now()}`, date: today, amount: s.rent.monthlyRent, method, receipt: `NH-${today.replace(/-/g, '')}` },
              ...s.rent.history,
            ],
          },
        }));
        pushNotification('payment', `Rent payment of KES ${state.rent.monthlyRent.toLocaleString()} confirmed via ${method}.`);
        resolve();
      }, 2200);
    });
  }, [pushNotification, state.rent.monthlyRent]);

  const createTicket = useCallback((ticket) => {
    ticketSeq += 1;
    const id = `TCK-${String(ticketSeq).padStart(3, '0')}`;
    const today = new Date().toISOString().slice(0, 10);
    setState((s) => ({
      ...s,
      tickets: [
        {
          id,
          category: ticket.category,
          title: ticket.title,
          description: ticket.description,
          status: 'open',
          createdAt: today,
          updates: [{ at: today, text: 'Ticket raised by tenant.' }],
        },
        ...s.tickets,
      ],
    }));
    pushNotification('ticket', `Ticket ${id} raised: ${ticket.title}.`);
    return id;
  }, [pushNotification]);

  const closeTicket = useCallback((id) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((s) => ({
      ...s,
      tickets: s.tickets.map((t) => t.id === id
        ? { ...t, status: 'closed', updates: [...t.updates, { at: today, text: 'Closed by tenant.' }] }
        : t),
    }));
    pushNotification('ticket', `Ticket ${id} closed.`);
  }, [pushNotification]);

  const postNotice = useCallback((body) => {
    noticeSeq += 1;
    const today = new Date().toISOString().slice(0, 10);
    setState((s) => ({
      ...s,
      noticeBoard: [
        { id: `note-${noticeSeq}`, unit: s.profile.unit, postedAt: today, body },
        ...s.noticeBoard,
      ],
    }));
  }, []);

  const markNotificationRead = useCallback((id) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const updateProfile = useCallback((patch) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  }, []);

  const value = {
    ...state,
    payRent,
    createTicket,
    closeTicket,
    postNotice,
    markNotificationRead,
    markAllNotificationsRead,
    updateProfile,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
