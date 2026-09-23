import { useContext, useState, useRef, useEffect } from 'react';
import { SwapsContext } from '../context/SwapsContext.jsx';

export default function NotificationBell() {
  const { notifications, acceptNotification, declineNotification, socketConnected } =
    useContext(SwapsContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close the dropdown on outside click (Experiment 2 — useEffect)
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-black/5"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.66V5a2 2 0 1 0-4 0v.34A6 6 0 0 0 6 11v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
          />
        </svg>

        {/* Notification count badge */}
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-mustard text-ink text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}

        {/* Socket.IO connection-status indicator (Experiment 8 + Experiment 1 interactive UI) */}
        <span
          title={socketConnected ? 'Real-time connected' : 'Real-time disconnected'}
          className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white ${
            socketConnected ? 'bg-green-400' : 'bg-gray-300'
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-paper border-2 border-ink rounded-xl shadow-[4px_4px_0_#1F6F6B] z-50 overflow-hidden">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 px-4 pt-3 pb-2">
            Incoming swap requests
          </p>
          {notifications.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-ink/50">You&apos;re all caught up.</p>
          ) : (
            <ul className="divide-y divide-line">
              {notifications.map((n) => (
                <li key={n.id} className="px-4 py-3">
                  <p className="text-sm">
                    <span className="font-semibold">{n.from}</span> wants to swap for{' '}
                    <span className="font-medium">{n.skill}</span>
                  </p>
                  {n.offeredSkill && (
                    <p className="text-xs text-ink/50 mt-0.5">
                      offering: <span className="font-medium">{n.offeredSkill}</span>
                    </p>
                  )}
                  <p className="text-xs text-ink/50 mt-0.5">worth {n.hours} hrs credit</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => acceptNotification(n.id)}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-teal text-paper"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineNotification(n.id)}
                      className="text-xs font-semibold px-3 py-1 rounded-full border border-line"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
