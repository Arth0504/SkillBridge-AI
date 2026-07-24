import { useState } from 'react';

// Lightweight application UI state manager for modals, drawers, and global active items
export const useAppStore = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const openModal = (modalId) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);
  const openDrawer = (drawerId) => setActiveDrawer(drawerId);
  const closeDrawer = () => setActiveDrawer(null);

  return {
    activeModal,
    activeDrawer,
    globalFilter,
    setGlobalFilter,
    openModal,
    closeModal,
    openDrawer,
    closeDrawer,
  };
};
