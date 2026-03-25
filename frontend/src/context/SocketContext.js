import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import AuthContext from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user?._id) {
      // In production use VITE_API_URL; in dev fall back to localhost (Vite proxy doesn't cover WS)
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const s = io(backendUrl, { transports: ['websocket'] });
      socketRef.current = s;
      setSocket(s);

      // Join the user's personal room so they receive messages targeting them
      s.emit('join', user._id);

      return () => {
        s.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    }
  }, [user?._id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
