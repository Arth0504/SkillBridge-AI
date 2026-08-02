import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }) => {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const listeners = {};

    const socketAdapter = {
      emit: (event, data) => {
        const customEvent = new CustomEvent(`socket:${event}`, { detail: data });
        window.dispatchEvent(customEvent);

        if (listeners[event]) {
          listeners[event].forEach((cb) => cb(data));
        }
      },
      on: (event, callback) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);

        const handleCustomEvent = (e) => callback(e.detail);
        window.addEventListener(`socket:${event}`, handleCustomEvent);
      },
      off: (event, callback) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((cb) => cb !== callback);
        }
      },
    };

    const handleSyncEvent = () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-applications'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
      queryClient.invalidateQueries({ queryKey: ['company-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['company-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['company-dashboard-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['company-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['company-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
    };

    window.addEventListener('socket:application:stage_updated', handleSyncEvent);
    window.addEventListener('socket:interview:status_updated', handleSyncEvent);
    window.addEventListener('socket:interview:scheduled', handleSyncEvent);
    window.addEventListener('socket:notification:new', handleSyncEvent);

    setSocket(socketAdapter);
    setIsConnected(true);

    return () => {
      window.removeEventListener('socket:application:stage_updated', handleSyncEvent);
      window.removeEventListener('socket:interview:status_updated', handleSyncEvent);
      window.removeEventListener('socket:interview:scheduled', handleSyncEvent);
      window.removeEventListener('socket:notification:new', handleSyncEvent);
    };
  }, [user, role, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
