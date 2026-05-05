import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);
const socketURL = import.meta.env.VITE_SOCKET_URL || (
  import.meta.env.PROD ? '' : `${window.location.protocol}//${window.location.hostname}:5000`
);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user || !socketURL) {
      setSocket(null);
      return undefined;
    }

    const instance = io(socketURL, {
      transports: ['websocket']
    });

    setSocket(instance);
    return () => instance.disconnect();
  }, [user]);

  const value = useMemo(() => ({ socket }), [socket]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
