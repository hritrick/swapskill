import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from './AppContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

/**
 * SwapsContext — manages everything swap-request-related:
 *   • Incoming notifications (swap proposals where you are the recipient)
 *   • The "propose a swap" modal target
 *   • Real-time updates via Socket.IO (useSocket hook)
 *
 * Experiment 3 (Context API): dedicated context so AppContext stays slim.
 * Experiment 8 (WebSockets): socket events push live data into React state.
 */
export const SwapsContext = createContext(null);

export function SwapsProvider({ children }) {
  const { user, setCredits } = useContext(AppContext);

  // ─── Socket.IO ────────────────────────────────────────────────────────────
  const { socket, connected } = useSocket(user?.token ?? null);

  // ─── Notifications (incoming swap proposals) ──────────────────────────────
  const [notifications, setNotifications] = useState([]);

  // Fetch pending incoming swaps from the API on login
  useEffect(() => {
    if (!user?.token) {
      setNotifications([]);
      return;
    }
    fetch('/api/swaps/me?role=received&status=pending', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          // Normalise to the shape NotificationBell expects
          setNotifications(
            data.data.map((s) => ({
              id: s._id,
              from: s.fromUser?.name ?? 'Someone',
              skill: s.skill?.title ?? 'a skill',
              offeredSkill: s.offeredSkill,
              hours: s.hours,
            }))
          );
        }
      })
      .catch((err) => console.warn('[SwapsContext] failed to fetch notifications:', err));
  }, [user?.token]);

  // Live: new swap proposal arrives while the tab is open
  useEffect(() => {
    if (!socket) return;
    const handleSwapNew = (payload) => {
      setNotifications((prev) => [
        {
          id: payload._id,
          from: payload.from,
          skill: payload.skill,
          offeredSkill: payload.offeredSkill,
          hours: payload.hours,
        },
        ...prev,
      ]);
    };
    socket.on('swap:new', handleSwapNew);
    return () => socket.off('swap:new', handleSwapNew);
  }, [socket]);

  // Live: a swap you sent was accepted/declined
  useEffect(() => {
    if (!socket) return;
    const handleSwapUpdated = (payload) => {
      // Credit is updated server-side; update local UI from the event payload
      if (payload.recipientCreditsAdded && setCredits) {
        setCredits((c) => Math.round((c + payload.recipientCreditsAdded) * 10) / 10);
      }
    };
    socket.on('swap:updated', handleSwapUpdated);
    return () => socket.off('swap:updated', handleSwapUpdated);
  }, [socket, setCredits]);

  // ─── Accept / Decline ─────────────────────────────────────────────────────
  const acceptNotification = useCallback(
    async (id) => {
      const note = notifications.find((n) => n.id === id);
      if (!note || !user?.token) return;
      try {
        const res = await fetch(`/api/swaps/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ status: 'accepted' }),
        });
        const data = await res.json();
        if (res.ok) {
          // Credit update comes from server response
          setCredits((c) => Math.round((c + note.hours) * 10) / 10);
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        } else {
          console.error('[SwapsContext] accept failed:', data.message);
        }
      } catch (err) {
        console.error('[SwapsContext] accept error:', err);
      }
    },
    [notifications, user?.token, setCredits]
  );

  const declineNotification = useCallback(
    async (id) => {
      if (!user?.token) return;
      try {
        const res = await fetch(`/api/swaps/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ status: 'declined' }),
        });
        if (res.ok) {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }
      } catch (err) {
        console.error('[SwapsContext] decline error:', err);
      }
    },
    [user?.token]
  );

  // ─── Proposal modal ───────────────────────────────────────────────────────
  const [proposalTarget, setProposalTarget] = useState(null);
  const openProposal = useCallback((skill) => setProposalTarget(skill), []);
  const closeProposal = useCallback(() => setProposalTarget(null), []);

  const value = {
    notifications,
    acceptNotification,
    declineNotification,
    proposalTarget,
    openProposal,
    closeProposal,
    socketConnected: connected,
  };

  return <SwapsContext.Provider value={value}>{children}</SwapsContext.Provider>;
}
