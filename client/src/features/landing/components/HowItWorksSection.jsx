import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Sparkles, Cpu, Award, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const HowItWorksSection = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: '01',
      title: 'Register & Select Role',
      desc: 'Sign up in seconds as a Candidate seeking top tech jobs, or a Company Employer looking to automate technical recruitment.',
      icon: UserPlus,
      color: 'from-brand-500 to-brand-600',
    },
    {
      step: '02',
      title: 'Build AI-Enhanced Profile',
      desc: 'Upload your CV for automated Gemini ATS parsing or post active tech role specifications with desired skill requirements.',
      icon: Sparkles,
      color: 'from-accent-purple to-brand-600',
    },
    {
      step: '03',
      title: 'AI Evaluation & Screening',
      desc: 'Run multi-language coding challenges, interactive mock technical interviews, and webcam video screening evaluated by AI.',
      icon: Cpu,
      color: 'from-accent-cyan to-brand-500',
    },
    {
      step: '04',
      title: 'Match & Get Hired',
      desc: 'Top candidates receive verified skill badges and direct interview invites from verified enterprise tech employers.',
      icon: Award,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-[#0B0F19] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            Streamlined Hiring Journey
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How SkillBridge AI Works in 4 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A seamless automated workflow designed to connect talent with opportunities at lightning speed.
          </p>
        </div>

        {/* Timeline Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((st, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="glass-card p-8 rounded-3xl space-y-5 relative flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/50"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${st.color} text-white flex items-center justify-center shadow-lg`}>
                    <st.icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-3xl font-black text-slate-300 dark:text-slate-700">
                    {st.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {st.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-700">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button variant="primary" size="lg" onClick={() => navigate('/auth/register')}>
            Start Your Journey Now <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
