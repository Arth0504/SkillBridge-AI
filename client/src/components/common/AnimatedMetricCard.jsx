import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

export const AnimatedMetricCard = ({ label, value, icon: Icon, color, bg, className = '' }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [highlightClass, setHighlightClass] = useState('');
  const controls = useAnimation();
  const isFirstRender = useRef(true);

  // Parse numeric values
  const parseNum = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (value !== prevValue) {
      const curNum = parseNum(value);
      const prevNum = parseNum(prevValue);

      if (curNum > prevNum) {
        // Increased: emerald green highlight with subtle pulse and glow
        setHighlightClass('border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-500/5 dark:bg-emerald-500/10 transition-all duration-300');
      } else if (curNum < prevNum) {
        // Decreased: rose red highlight with subtle pulse and glow
        setHighlightClass('border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] bg-rose-500/5 dark:bg-rose-500/10 transition-all duration-300');
      } else {
        // Changed non-numerically (e.g. text/status changes): brand blue glow
        setHighlightClass('border-brand-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300');
      }

      // Smooth bounce scaling transition
      controls.start({
        scale: [1, 1.04, 0.98, 1],
        transition: { duration: 0.5, ease: 'easeInOut' }
      });

      // Reset style to original state after 1.5s
      const timer = setTimeout(() => {
        setHighlightClass('');
      }, 1500);

      setPrevValue(value);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue, controls]);

  const hasDecimals = typeof value === 'string' && value.includes('.');
  const displayValue = typeof value === 'number' ? (
    <AnimatedCounter from={parseNum(prevValue)} to={value} decimals={hasDecimals ? 1 : 0} />
  ) : typeof value === 'string' && !isNaN(parseNum(value)) ? (
    <AnimatedCounter from={parseNum(prevValue)} to={parseNum(value)} suffix={value.replace(/[0-9.]/g, '')} decimals={hasDecimals ? 1 : 0} />
  ) : (
    value
  );

  return (
    <motion.div
      animate={controls}
      className={`glass-card p-6 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-slate-800 hover:shadow-xl transition-all duration-500 ${highlightClass} ${className}`}
    >
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 flex items-center gap-1">
          {displayValue}
        </h3>
      </div>
      <div className={`p-3.5 rounded-2xl ${bg} ${color} shadow-inner`}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
};
