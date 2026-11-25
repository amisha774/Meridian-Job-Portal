import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  addRealtimeNotification,
  clearNotifications,
  fetchNotifications,
} from '../redux/notificationSlice';
import { NotificationItem } from '../types';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((s) => s.auth);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      dispatch(clearNotifications());
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    dispatch(fetchNotifications());

    const instance = io('/', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    instance.on('connect', () => {
      setConnected(true);
    });

    instance.on('disconnect', () => {
      setConnected(false);
    });

    instance.on('notification:new', (payload: NotificationItem) => {
      dispatch(addRealtimeNotification(payload));
      toast(payload.title, {
        duration: 4500,
      });
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
      setConnected(false);
    };
  }, [isAuthenticated, token, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
