import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { motion } from 'framer-motion';

export const CandidateLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B0F19]">
      <Sidebar
        role="candidate"
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Topbar />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};
