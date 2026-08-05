import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, User, Sparkles, Globe, Video, Code2, Briefcase, FileText, CheckCircle2 } from 'lucide-react';

export const SuperAdminLiveFeed = () => {
  const [events, setEvents] = useState([
    { id: 1, type: 'user_register', title: 'New Candidate Registered', detail: 'John Doe (john.doe@example.com)', time: 'Just now', icon: User, color: 'text-brand-400' },
    { id: 2, type: 'resume_built', title: 'AI Resume Synchronized', detail: 'Arth Prajapati exported Modern ATS PDF', time: '2m ago', icon: Sparkles, color: 'text-purple-400' },
    { id: 3, type: 'portfolio_created', title: 'Portfolio Website Generated', detail: 'Full Stack Gradient template exported', time: '5m ago', icon: Globe, color: 'text-emerald-400' },
    { id: 4, type: 'interview_started', title: 'AI Video Interview Initiated', detail: 'TechFlow Systems • Senior Full Stack Role', time: '8m ago', icon: Video, color: 'text-cyan-400' },
    { id: 5, type: 'coding_completed', title: 'Coding Assessment Passed', detail: 'Score 85/100 (JavaScript & Data Structures)', time: '12m ago', icon: Code2, color: 'text-amber-400' },
  ]);

  // Simulate real-time Socket.IO event push
  useEffect(() => {
    const timer = setInterval(() => {
      const sampleEvents = [
        { title: 'New Application Submitted', detail: 'Candidate applied to TechFlow Systems', icon: FileText, color: 'text-pink-400' },
        { title: 'AI Resume Grammar Scan', detail: 'Candidate ran 100% grammar review', icon: Sparkles, color: 'text-purple-400' },
        { title: 'New Job Posted', detail: 'Cognitive AI Labs posted AI Engineer Role', icon: Briefcase, color: 'text-blue-400' },
      ];
      const randomEvt = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      const newEvtObj = {
        id: Date.now(),
        type: 'live_stream',
        title: randomEvt.title,
        detail: randomEvt.detail,
        time: 'Just now',
        icon: randomEvt.icon,
        color: randomEvt.color,
      };

      setEvents((prev) => [newEvtObj, ...prev.slice(0, 7)]);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Socket.IO Event Stream</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Realtime Active
        </span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {events.map((evt) => {
            const Icon = evt.icon;
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <Icon className={`w-4 h-4 ${evt.color}`} />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{evt.title}</span>
                    <span className="text-[10px] text-slate-400">{evt.detail}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-500 shrink-0">{evt.time}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
