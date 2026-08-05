import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export const AnimatedCounter = ({ from = 0, to, duration = 2, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const currentVal = progress * (to - from) + from;
      setCount(decimals > 0 ? parseFloat(currentVal.toFixed(decimals)) : Math.floor(currentVal));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(to);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, from, to, duration, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}
      {suffix}
    </span>
  );
};
