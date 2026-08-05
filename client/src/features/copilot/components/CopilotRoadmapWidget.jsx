import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const CopilotRoadmapWidget = () => {
  const [weeks, setWeeks] = useState([
    {
      weekNum: 1,
      topic: 'React 19 & Next.js App Router',
      details: 'Master Server Components, Suspense boundaries, and custom hooks.',
      completed: true,
      tasks: ['Server Components', 'Custom Hooks', 'App Router Layouts'],
    },
    {
      weekNum: 2,
      topic: 'Node.js Microservices & Redis Caching',
      details: 'Build event-driven REST APIs and Redis pub/sub messaging queues.',
      completed: true,
      tasks: ['Express REST Architecture', 'Redis Caching Layer', 'JWT Auth Middleware'],
    },
    {
      weekNum: 3,
      topic: 'MongoDB Aggregations & Query Indexing',
      details: 'Optimize pipeline stages, compound index structures, and schema validation.',
      completed: false,
      tasks: ['Aggregation Pipeline', 'Compound Indexing', 'Schema Validation Rules'],
    },
    {
      weekNum: 4,
      topic: 'High-Scalability System Design',
      details: 'Architect load balancers, rate limiting, and database sharding patterns.',
      completed: false,
      tasks: ['Load Balancers & CDN', 'Rate Limiting Algorithms', 'Database Sharding'],
    },
  ]);

  const toggleTask = (weekIdx, taskIdx) => {
    setWeeks((prev) => {
      const updated = [...prev];
      updated[weekIdx].tasks[taskIdx] = updated[weekIdx].tasks[taskIdx].startsWith('✓ ')
        ? updated[weekIdx].tasks[taskIdx].replace('✓ ', '')
        : `✓ ${updated[weekIdx].tasks[taskIdx]}`;

      // Check if all tasks in week are done
      const allDone = updated[weekIdx].tasks.every((t) => t.startsWith('✓ '));
      updated[weekIdx].completed = allDone;
      return updated;
    });
    toast.success('Roadmap milestone updated!');
  };

  const completedWeeks = weeks.filter((w) => w.completed).length;
  const progressPct = Math.round((completedWeeks / weeks.length) * 100);

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personalized Learning Roadmap</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
          {progressPct}% Completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-cyan-500 to-brand-500 h-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Weeks Roadmap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {weeks.map((w, wIdx) => (
          <div
            key={w.weekNum}
            className={`p-3.5 rounded-xl border space-y-2 transition-all ${
              w.completed ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800 bg-slate-950/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Week {w.weekNum}</span>
              {w.completed ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                  <Clock className="w-3.5 h-3.5" /> In Progress
                </span>
              )}
            </div>

            <h4 className="text-xs font-bold text-white">{w.topic}</h4>
            <p className="text-[10px] text-slate-400 leading-snug">{w.details}</p>

            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              {w.tasks.map((task, tIdx) => {
                const isTaskDone = task.startsWith('✓ ');
                return (
                  <div
                    key={tIdx}
                    onClick={() => toggleTask(wIdx, tIdx)}
                    className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:text-white transition-colors"
                  >
                    {isTaskDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                    <span className={isTaskDone ? 'line-through text-slate-400' : 'text-slate-300'}>
                      {task.replace('✓ ', '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
