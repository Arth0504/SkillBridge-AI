import toast from 'react-hot-toast';

export const useNotification = () => {
  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);
  const notifyInfo = (message) => toast(message, { icon: 'ℹ️' });
  const notifyWarning = (message) => toast(message, { icon: '⚠️' });

  return {
    success: notifySuccess,
    error: notifyError,
    info: notifyInfo,
    warning: notifyWarning,
    toast,
  };
};
