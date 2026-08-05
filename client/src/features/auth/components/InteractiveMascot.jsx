import React from 'react';
import { motion } from 'framer-motion';

export const InteractiveMascot = ({ state = 'idle' }) => {
  // SVG Motion Variant Definitions for different parts of Bridgey the Robot

  // Body Hover/Breathing
  const bodyVariants = {
    idle: {
      y: [0, -6, 0],
      transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
    },
    looking: {
      y: 0,
      x: -4,
      rotate: -2,
      transition: { duration: 0.3 },
    },
    covering: {
      y: 4,
      x: 0,
      rotate: 0,
      transition: { duration: 0.3 },
    },
    success: {
      y: [0, -10, 0],
      x: 0,
      rotate: [0, 2, -2, 0],
      transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
    },
    failure: {
      y: [0, 4, 0],
      x: [0, -3, 3, 0],
      rotate: 4,
      transition: { duration: 0.4 },
    },
  };

  // Eyes Movement (Pupils)
  const pupilVariants = {
    idle: { x: 0, y: 0, scaleY: [1, 1, 0.1, 1, 1], transition: { repeat: Infinity, repeatDelay: 4, duration: 0.25 } },
    looking: { x: -8, y: 8, scaleY: 1, transition: { duration: 0.25 } },
    covering: { scaleY: 0.1, transition: { duration: 0.2 } },
    success: { scaleY: 1, transition: { duration: 0.2 } },
    failure: { y: 2, scaleY: 0.6, transition: { duration: 0.3 } },
  };

  // Left Arm (Mascot's Left / Screen Right)
  const leftArmVariants = {
    idle: { rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } },
    looking: { rotate: -10, transition: { duration: 0.3 } },
    covering: { y: -58, x: -28, rotate: 135, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    success: { rotate: [0, -80, 0], transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } },
    failure: { rotate: 20, transition: { duration: 0.3 } },
  };

  // Right Arm (Mascot's Right / Screen Left)
  const rightArmVariants = {
    idle: { rotate: [0, -5, 0], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } },
    looking: { rotate: 5, transition: { duration: 0.3 } },
    covering: { y: -58, x: 28, rotate: -135, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    success: { rotate: [0, 80, 0], transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } },
    failure: { rotate: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center relative select-none">
      {/* Dynamic Ambient Background Glow */}
      <div className={`absolute inset-0 rounded-full blur-[80px] opacity-25 transition-all duration-700 ${
        state === 'success' ? 'bg-emerald-500' :
        state === 'failure' ? 'bg-rose-500' :
        state === 'covering' ? 'bg-purple-500' : 'bg-brand-500'
      }`} />

      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]"
      >
        {/* MASCOT ROBOT BODY */}
        <motion.g animate={state} variants={bodyVariants}>
          {/* Main Chest/Base */}
          <rect x="50" y="110" width="100" height="70" rx="20" fill="url(#bodyGradient)" stroke="url(#borderGradient)" strokeWidth="2.5" />
          {/* Chest Screen Logo */}
          <rect x="75" y="130" width="50" height="28" rx="8" fill="#0A0F1D" opacity="0.4" />
          <path d="M90 144L96 150L110 138" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Neck */}
          <rect x="90" y="96" width="20" height="20" rx="4" fill="#64748B" />

          {/* Head Outer Frame */}
          <rect x="42" y="32" width="116" height="74" rx="28" fill="url(#headGradient)" stroke="url(#borderGradient)" strokeWidth="2.5" />

          {/* Ear Antennae */}
          <rect x="34" y="54" width="8" height="28" rx="4" fill="#475569" />
          <circle cx="38" cy="50" r="4" fill="#A855F7" />

          {/* Right Antenna */}
          <rect x="158" y="54" width="8" height="28" rx="4" fill="#475569" />
          <circle cx="162" cy="50" r="4" fill="#A855F7" />

          {/* Head Screen Face (Obsidian Glass) */}
          <rect x="50" y="40" width="100" height="58" rx="20" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />

          {/* EXPRESSION RENDERING ON FACE */}

          {/* Success Face: Happy eyes and smiling mouth */}
          {state === 'success' && (
            <>
              {/* Happy Left Eye */}
              <path d="M68 62C68 56 78 56 78 62" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              {/* Happy Right Eye */}
              <path d="M122 62C122 56 132 56 132 62" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              {/* Happy Smile */}
              <path d="M90 78C95 83 105 83 110 78" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {/* Failure Face: Squiggly eyes and sad mouth */}
          {state === 'failure' && (
            <>
              {/* Crossed/Squiggly Left Eye */}
              <path d="M68 56L76 64M76 56L68 64" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" />
              {/* Crossed/Squiggly Right Eye */}
              <path d="M124 56L132 64M132 56L124 64" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" />
              {/* Sad/Confused Squiggle Mouth */}
              <path d="M92 78C95 76 99 80 102 78C105 76 108 78 108 78" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {/* Standard Eyes (Idle, Looking, Covering) */}
          {state !== 'success' && state !== 'failure' && (
            <>
              {/* Left Eye Socket */}
              <circle cx="74" cy="60" r="10" fill="#1E293B" />
              {/* Right Eye Socket */}
              <circle cx="126" cy="60" r="10" fill="#1E293B" />

              {/* Left Pupil (Animated Position) */}
              <motion.circle
                cx="74"
                cy="60"
                r="5"
                fill={state === 'covering' ? '#A855F7' : '#6366F1'}
                variants={pupilVariants}
                animate={state}
              />

              {/* Right Pupil (Animated Position) */}
              <motion.circle
                cx="126"
                cy="60"
                r="5"
                fill={state === 'covering' ? '#A855F7' : '#6366F1'}
                variants={pupilVariants}
                animate={state}
              />

              {/* Subtle mouth light indicator */}
              <path
                d="M94 76H106"
                stroke={state === 'covering' ? '#A855F7' : '#6366F1'}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </>
          )}
        </motion.g>

        {/* LEFT ARM (Waves on success, covers on password) */}
        <motion.g
          animate={state}
          variants={leftArmVariants}
          style={{ originX: '155px', originY: '135px' }}
        >
          {/* Arm connector link */}
          <path d="M148 135H162" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
          {/* Main Arm */}
          <rect x="156" y="132" width="10" height="42" rx="5" fill="url(#armGradient)" stroke="url(#borderGradient)" strokeWidth="1.5" />
          {/* Hand joint */}
          <circle cx="161" cy="176" r="6" fill="#A855F7" />
        </motion.g>

        {/* RIGHT ARM (Waves on success, covers on password) */}
        <motion.g
          animate={state}
          variants={rightArmVariants}
          style={{ originX: '45px', originY: '135px' }}
        >
          {/* Arm connector link */}
          <path d="M52 135H38" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
          {/* Main Arm */}
          <rect x="34" y="132" width="10" height="42" rx="5" fill="url(#armGradient)" stroke="url(#borderGradient)" strokeWidth="1.5" />
          {/* Hand joint */}
          <circle cx="39" cy="176" r="6" fill="#A855F7" />
        </motion.g>

        {/* GRADIENT DEFINITIONS */}
        <defs>
          <linearGradient id="bodyGradient" x1="50" y1="110" x2="150" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="headGradient" x1="42" y1="32" x2="158" y2="106" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="armGradient" x1="156" y1="132" x2="166" y2="174" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          <linearGradient id="borderGradient" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
