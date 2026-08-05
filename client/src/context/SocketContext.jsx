import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

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
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    console.log(`🔌 [Socket.IO] Connecting to gateway at: ${socketUrl}`);

    const socketInstance = io(socketUrl, {
      auth: (cb) => {
        const latestToken = localStorage.getItem('accessToken');
        cb({ token: latestToken });
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketInstance.io.on('reconnect_attempt', () => {
      const latestToken = localStorage.getItem('accessToken');
      if (!latestToken) {
        console.warn('🔌 [Socket.IO] Reconnect attempt aborted: No valid access token.');
        socketInstance.disconnect();
        return;
      }
      console.log('🔌 [Socket.IO] Reconnecting with newest JWT access token...');
      socketInstance.auth = { token: latestToken };
    });

    socketInstance.on('connect', () => {
      console.log(`🔌 [Socket.IO] Connected: ${socketInstance.id} | User: ${user?._id} (${role})`);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.IO] Disconnected. Reason: ${reason}`);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('🔌 [Socket.IO] Connection Error:', err.message);
      if (err.message?.includes('Authentication Error') || err.message?.includes('expired') || err.message?.includes('token')) {
        const latestToken = localStorage.getItem('accessToken');
        if (latestToken && latestToken !== socketInstance.auth?.token) {
          console.log('🔌 [Socket.IO] Updating auth with fresh JWT access token after error...');
          socketInstance.auth = { token: latestToken };
          socketInstance.connect();
        }
      }
    });

    // Enterprise Real-Time Sync Event Handlers
    const setupSyncListeners = () => {
      // 1. Jobs Synchronization
      const handleJobUpdate = (data) => {
        console.log('⚡ [Sync Event] Job update received:', data);
        queryClient.invalidateQueries({ queryKey: ['company-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['company-job-performance'] });
        queryClient.invalidateQueries({ queryKey: ['company-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
        queryClient.invalidateQueries({ queryKey: ['job'] });
        queryClient.invalidateQueries({ queryKey: ['admin-system-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['candidate-saved-jobs'] });
        if (data?.title) {
          toast.success(`Position updated: "${data.title}" updated in real-time.`, { id: `job-${data._id || 'update'}` });
        }
      };
      socketInstance.on('job:created', handleJobUpdate);
      socketInstance.on('job:updated', handleJobUpdate);
      socketInstance.on('job:deleted', handleJobUpdate);

      // 2. Applications & Hiring Funnel Synchronization
      const handleApplicationUpdate = (data) => {
        console.log('⚡ [Sync Event] Application update received:', data);
        queryClient.invalidateQueries({ queryKey: ['candidate-applications'] });
        queryClient.invalidateQueries({ queryKey: ['candidate-recent-applications'] });
        queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['company-applications'] });
        queryClient.invalidateQueries({ queryKey: ['company-recent-applications'] });
        queryClient.invalidateQueries({ queryKey: ['company-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['company-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-system-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-analytics'] });
        if (data?.stage) {
          toast.success(`Application updated in real-time: Stage is now "${data.stage}".`, { id: `app-${data._id || 'update'}` });
        }
      };
      socketInstance.on('application:created', handleApplicationUpdate);
      socketInstance.on('application:updated', handleApplicationUpdate);
      socketInstance.on('application:deleted', handleApplicationUpdate);

      // 3. Profiles Synchronization
      socketInstance.on('candidate:updated', (data) => {
        console.log('⚡ [Sync Event] Candidate profile updated:', data);
        queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['candidate-profile-completion'] });
        queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
        queryClient.invalidateQueries({ queryKey: ['admin-system-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      });

      socketInstance.on('company:updated', (data) => {
        console.log('⚡ [Sync Event] Company profile updated:', data);
        queryClient.invalidateQueries({ queryKey: ['company-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['company-profile'] });
        queryClient.invalidateQueries({ queryKey: ['admin-system-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      });

      // 4. Interviews Synchronization
      const handleInterviewUpdate = (data) => {
        console.log('⚡ [Sync Event] Interview update received:', data);
        queryClient.invalidateQueries({ queryKey: ['candidate-upcoming-interviews'] });
        queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['company-dashboard-interviews'] });
        queryClient.invalidateQueries({ queryKey: ['company-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['company-interviews'] });
        queryClient.invalidateQueries({ queryKey: ['company-calendar'] });
        queryClient.invalidateQueries({ queryKey: ['admin-system-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-analytics'] });
        if (data?.title) {
          toast.success(`Interview Preparation updated: "${data.title}".`, { id: `int-${data._id || 'update'}` });
        }
      };
      socketInstance.on('interview:scheduled', handleInterviewUpdate);
      socketInstance.on('interview:started', handleInterviewUpdate);
      socketInstance.on('interview:completed', handleInterviewUpdate);
      socketInstance.on('interview:cancelled', handleInterviewUpdate);

      // 5. Offer Letters Synchronization
      const handleOfferUpdate = (data) => {
        console.log('⚡ [Sync Event] Offer letter update received:', data);
        queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['candidate-applications'] });
        queryClient.invalidateQueries({ queryKey: ['company-dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['company-applications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-system-metrics'] });
        if (data?.status) {
          toast.success(`Offer Letter status update: "${data.status}".`, { id: `offer-${data._id || 'update'}` });
        }
      };
      socketInstance.on('offer:sent', handleOfferUpdate);
      socketInstance.on('offer:accepted', handleOfferUpdate);
      socketInstance.on('offer:rejected', handleOfferUpdate);

      // 6. Real-Time System & Audit Logs / Timeline / Feed
      const handleTelemetryUpdate = (data) => {
        console.log('⚡ [Sync Event] Audit log telemetry received:', data);
        queryClient.invalidateQueries({ queryKey: ['admin-system-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      };
      socketInstance.on('timeline:created', handleTelemetryUpdate);
      socketInstance.on('activity:new', handleTelemetryUpdate);

      // 7. Push Notifications Synchronization
      socketInstance.on('notification:new', (data) => {
        console.log('⚡ [Sync Event] Push notification received:', data);
        queryClient.invalidateQueries({ queryKey: ['candidate-recent-notifications'] });
        queryClient.invalidateQueries({ queryKey: ['candidate-notifications'] });
        queryClient.invalidateQueries({ queryKey: ['company-notifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        if (data?.title) {
          toast(data.title, {
            icon: '🔔',
            duration: 4000,
            id: `notif-${data._id || Date.now()}`
          });
        }
      });

      // 8. General Analytics updates
      socketInstance.on('analytics:updated', () => {
        queryClient.invalidateQueries({ queryKey: ['company-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['company-job-performance'] });
        queryClient.invalidateQueries({ queryKey: ['admin-system-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-analytics'] });
      });

      // 9. Force Dashboard Refresh
      socketInstance.on('dashboard:refresh', () => {
        queryClient.invalidateQueries();
      });
    };

    setupSyncListeners();
    setSocket(socketInstance);

    return () => {
      console.log('🔌 [Socket.IO] Cleaning up listener and disconnecting...');
      socketInstance.disconnect();
    };
  }, [user, role, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
