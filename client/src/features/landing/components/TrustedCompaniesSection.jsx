import React from 'react';

export const TrustedCompaniesSection = () => {
  const companies = [
    { name: 'Google Cloud', logo: 'GOOGLE' },
    { name: 'Microsoft Azure', logo: 'MICROSOFT' },
    { name: 'Amazon Web Services', logo: 'AWS' },
    { name: 'Meta AI', logo: 'META' },
    { name: 'Stripe', logo: 'STRIPE' },
    { name: 'OpenAI Enterprise', logo: 'OPENAI' },
    { name: 'Vercel', logo: 'VERCEL' },
    { name: 'Linear', logo: 'LINEAR' },
  ];

  return (
    <section id="trusted-companies" className="py-12 border-y border-slate-200/60 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-900/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Trusted by 1,200+ Innovative Tech Enterprises & Global Scale-Ups
        </p>
      </div>

      {/* Infinite Ticker Container */}
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Left/Right Fade Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-slate-50 dark:from-[#0B0F19] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-slate-50 dark:from-[#0B0F19] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-12 shrink-0 animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] items-center">
          {[...companies, ...companies].map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-extrabold text-lg sm:text-xl tracking-tight opacity-70 hover:opacity-100 hover:text-brand-500 transition-all cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono text-xs font-black text-slate-700 dark:text-slate-300">
                {c.logo[0]}
              </div>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
