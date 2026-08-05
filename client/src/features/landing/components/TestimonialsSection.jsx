import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Avatar } from '../../../components/common/Avatar';

export const TestimonialsSection = () => {
  const reviews = [
    {
      name: 'David Chen',
      role: 'VP of Engineering, CloudScale',
      type: 'Recruiter',
      rating: 5,
      comment:
        'SkillBridge AI cut our engineering hiring cycle from 5 weeks down to just 3 days. The automated AI coding evaluation and video screening filtered out non-qualifying candidates instantly.',
    },
    {
      name: 'Elena Rostova',
      role: 'Senior AI Engineer',
      type: 'Candidate',
      rating: 5,
      comment:
        'The ATS resume score breakdown and AI mock interview practice gave me total confidence. I received 3 enterprise job offers within two weeks of creating my candidate profile!',
    },
    {
      name: 'Marcus Vance',
      role: 'Head of Talent Acquisition, TechCorp',
      type: 'Recruiter',
      rating: 5,
      comment:
        'The Gemini AI scoring precision is unbelievable. Every candidate that passes SkillBridge coding tests demonstrates top 5% technical capability in actual production environments.',
    },
  ];

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [index]);

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Slider animation coordinates
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0
    })
  };

  const currentReview = reviews[index];

  return (
    <section className="py-24 bg-slate-50 dark:bg-dark-bg relative overflow-hidden transition-colors duration-300">
      {/* Background decoration orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-500/5 dark:bg-brand-500/3 blur-[90px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            User Success Stories
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans leading-[1.1]">
            Loved by Builders & Technical Leaders
          </h2>
          <p className="text-sm sm:text-base text-slate-650 dark:text-slate-400 font-sans">
            Real feedback from software developers and VP engineering managers using SkillBridge AI.
          </p>
        </div>

        {/* Carousel Slider Panel */}
        <div className="relative max-w-3xl mx-auto min-h-[300px] flex items-center justify-center">
          
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full glass-card p-8 sm:p-10 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-dark-card/95 shadow-2xl relative space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(currentReview.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.15 }}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <Badge variant={currentReview.type === 'Recruiter' ? 'purple' : 'success'}>
                    {currentReview.type}
                  </Badge>
                </div>

                <Quote className="w-9 h-9 text-brand-500/15" />

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-350 leading-relaxed font-sans italic font-medium">
                  "{currentReview.comment}"
                </p>
              </div>

              {/* Reviewer Details Footer */}
              <div className="flex items-center gap-3 pt-5 border-t border-slate-200/60 dark:border-slate-800/60">
                <Avatar name={currentReview.name} size="md" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-sans">{currentReview.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-semibold">{currentReview.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left Arrow Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-0 lg:-left-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 shadow-md hover:scale-105 transition-all z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Controls */}
          <button
            onClick={handleNext}
            className="absolute right-0 lg:-right-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 shadow-md hover:scale-105 transition-all z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};
