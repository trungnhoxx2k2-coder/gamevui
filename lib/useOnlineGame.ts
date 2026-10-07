'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Move } from './games/types';
import type { RoomSnapshot } from './protocol';
import { serverUrl } from './api';
import { usePlayer } from './player';

export function useOnlineGame(code: string) {
  const { id } = usePlayer();
  const [snap, setSnap] = useState<RoomSnapshot | null>(null);
  const [receivedAt, setReceivedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const sock = useRef<Socket | null>(null);

  useEffect(() => {
    if (!id) return;
    const s = io(serverUrl(), { reconnectionDelayMax: 3000 });
    sock.current = s;
    s.on('connect', () => { setConnected(true); s.emit('join-room', { code, playerId: id }); }); // cũng chạy khi tự kết nối lại
    s.on('disconnect', () => setConnected(false));
    s.on('room-state', (r: RoomSnapshot) => { setSnap(r); setReceivedAt(Date.now()); setError(null); });
    s.on('room-missing', (m: string) => setFatal(m));
    s.on('error-message', (m: string) => setError(m));
    return () => { s.removeAllListeners(); s.disconnect(); sock.current = null; }; // không để rò listener
  }, [code, id]);

  const emit = useCallback((ev: string, data?: unknown) => sock.current?.emit(ev, data), []);
  return {
    snap, receivedAt, error, fatal, connected,
    move: (m: Move) => emit('make-move', m),
    resign: () => emit('resign'),
    rematch: () => emit('rematch'),
    leave: () => emit('leave-room'),
    start: () => emit('start-game'),
  };
}
