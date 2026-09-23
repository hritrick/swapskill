import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook: useSocket
 *
 * Opens a socket.io-client connection when the user is authenticated
 * and tears it down on logout / unmount. Joining the user's private room
 * is handled server-side (socket.join(userId) in the handshake middleware).
 *
 * Strengthens Experiment 2 — a new custom hook purpose-built for real-time
 * communication (Experiment 8).
 *
 * @param {string|null} token  JWT from AppContext; pass null when logged-out.
 * @returns {{ socket: import('socket.io-client').Socket|null, connected: boolean }}
 */
export function useSocket(token) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setConnected(false);
      return;
    }

    const s = io('/', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', (err) => {
      console.warn('[useSocket] connection error:', err.message);
      setConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [token]);

  return { socket, connected };
}
