import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavbarLanding } from '../features/landing/components/NavbarLanding';
import { FooterLanding } from '../features/landing/components/FooterLanding';
import { motion } from 'framer-motion';

export const LandingLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
      <NavbarLanding />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>
      <FooterLanding />
    </div>
  );
};
