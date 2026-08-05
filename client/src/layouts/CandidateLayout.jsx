import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { motion } from 'framer-motion';

export const CandidateLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg print:h-auto print:overflow-visible">
      <div className="no-print">
        <Sidebar
          role="candidate"
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      <div className="flex flex-col flex-1 h-screen overflow-hidden print:h-auto print:overflow-visible">
        <div className="no-print">
          <Topbar />
        </div>

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-6 flex flex-col justify-between print:overflow-visible print:p-0"
        >
          <div>
            <Outlet />
          </div>
          <footer className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/30 text-center text-xs text-slate-400 dark:text-slate-500 no-print">
            Made with ❤️ by <span className="font-bold text-brand-500/80">LB Infotech</span> • © 2026 SkillBridge AI. All Rights Reserved.
          </footer>
        </motion.main>
      </div>
    </div>
  );
};
