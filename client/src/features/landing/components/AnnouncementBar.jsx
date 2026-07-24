import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnnouncementBar = () => {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-brand-600 via-accent-purple to-brand-700 text-white text-xs font-semibold py-2 px-4 relative z-50 overflow-hidden shadow-md"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center justify-center gap-2 w-full text-center sm:text-left">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-extrabold animate-pulse">
              <Sparkles className="w-3 h-3" /> NEW v2.4
            </span>
            <span className="hidden sm:inline">🚀 Next-Gen Enterprise AI Hiring Platform Powered by Gemini AI</span>
            <span className="sm:hidden">🚀 AI Hiring Powered by Gemini AI</span>
            <button
              onClick={() => navigate('/jobs')}
              className="inline-flex items-center gap-1 underline underline-offset-4 hover:opacity-90 transition-opacity ml-2"
            >
              Explore Features <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded-md hover:bg-white/20 transition-colors text-white shrink-0"
            aria-label="Close Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
