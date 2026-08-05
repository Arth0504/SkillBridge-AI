import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken = localStorage.getItem('accessToken') || null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken') || null;
  }
  return accessToken;
};

// Request Interceptor: Attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Refresh Token Queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If the request was to login or register, do not try to refresh
      if (originalRequest.url?.includes('/auth/candidate/login') || 
          originalRequest.url?.includes('/auth/company/login') ||
          originalRequest.url?.includes('/auth/candidate/register') ||
          originalRequest.url?.includes('/auth/company/register')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const userRole = localStorage.getItem('userRole') || 'candidate';
      const refreshEndpoint = userRole === 'company' 
        ? '/auth/company/refresh-token' 
        : '/auth/candidate/refresh-token';

      const apiBase = import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
        : '/api/v1';

      try {
        const { data } = await axios.post(`${apiBase}${refreshEndpoint}`, {}, { withCredentials: true });
        const newAccessToken = data.data?.accessToken || data.accessToken;
        if (!newAccessToken) throw new Error('No access token returned from refresh endpoint');
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        localStorage.removeItem('userRole');
        
        // Redirect to login if session expired
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login?sessionExpired=true';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden gracefully
    if (error.response?.status === 403) {
      console.warn('Access Forbidden (403): User lacks required role permissions for this endpoint.');
    }

    return Promise.reject(error);
  }
);

export default api;
