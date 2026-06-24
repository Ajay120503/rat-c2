import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;
let listeners = new Map();

/**
 * Connect to the Socket.IO server with admin token.
 * @param {string} token JWT token from localStorage
 */
export function connectSocket(token) {
  if (socket?.connected) return;

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 3000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Admin connected');
  });

  socket.on('disconnect', () => {
    console.warn('[Socket] Admin disconnected');
  });

  // Re-emit all events to registered listeners
  const events = [
    'command:updated',
    'device:online',
    'device:offline',
    'photo:uploaded',
    'recording:uploaded',
  ];

  events.forEach((event) => {
    socket.on(event, (data) => {
      listeners.forEach((callback) => {
        try { callback(event, data); } catch (e) { /* noop */ }
      });
    });
  });
}

/**
 * Register a listener for real-time events.
 * @param {string} id Unique listener ID
 * @param {function} callback Called with (event, data)
 */
export function addSocketListener(id, callback) {
  listeners.set(id, callback);
}

/**
 * Remove a listener.
 * @param {string} id Listener ID
 */
export function removeSocketListener(id) {
  listeners.delete(id);
}

/**
 * Disconnect socket.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  listeners.clear();
}