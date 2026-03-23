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
      // Connect directly to backend (bypasses Vite proxy for WebSockets)
      const s = io('http://localhost:5001', { transports: ['websocket'] });
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
