import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { AIHRAssistantWidget } from '../components/common/AIHRAssistantWidget';
import { motion } from 'framer-motion';

export const CompanyLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B0F19]">
      <Sidebar
        role="company"
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
          className="flex-1 overflow-y-auto p-6 flex flex-col justify-between"
        >
          <div>
            <Outlet />
          </div>
          <footer className="mt-8 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
            Made with ❤️ by <span className="font-bold text-brand-500">LB Infotech</span> • © 2026 SkillBridge AI. All Rights Reserved.
          </footer>
        </motion.main>
      </div>

      {/* Floating Recruiter AI HR Assistant Chatbot */}
      <AIHRAssistantWidget />
    </div>
  );
};
