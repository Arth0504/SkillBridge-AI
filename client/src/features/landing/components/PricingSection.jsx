import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const PricingSection = () => {
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free Candidate',
      priceMonthly: '$0',
      priceAnnual: '$0',
      desc: 'Everything job seekers need to optimize their CV and practice technical interviews.',
      popular: false,
      features: [
        'Unlimited Job Search & Applications',
        '3 Gemini AI Resume Audits / mo',
        '5 AI Technical Mock Interviews',
        'Basic Coding Test Sandbox',
        'Personal Career Dashboard',
      ],
      cta: 'Sign Up Free',
      variant: 'outline',
    },
    {
      name: 'Pro Tech Recruiter',
      priceMonthly: '$149',
      priceAnnual: '$119',
      desc: 'Ideal for growing engineering teams automating candidate screening.',
      popular: true,
      features: [
        'Up to 15 Active Job Postings',
        'Unlimited AI Resume Screening',
        'Automated Multi-Language Coding Tests',
        'Asynchronous Video Interview Suite',
        'Recruitment Analytics & Insights',
        'Team Member Invitations (5 Seats)',
      ],
      cta: 'Start 14-Day Free Trial',
      variant: 'primary',
    },
    {
      name: 'Enterprise Custom',
      priceMonthly: '$499',
      priceAnnual: '$399',
      desc: 'Custom SLA, dedicated Gemini fine-tuned models, and SSO compliance for large scale-ups.',
      popular: false,
      features: [
        'Unlimited Active Job Postings',
        'Custom Gemini Model Fine-Tuning',
        'Dedicated Account Manager & 24/7 SLA',
        'SAML SSO & Custom Audit Metrics',
        'Prometheus & Security API Access',
        'Custom Legal & SOC2 Compliance',
      ],
      cta: 'Contact Enterprise Sales',
      variant: 'outline',
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-dark-bg relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            Transparent Enterprise Pricing
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans leading-[1.1]">
            Simple Plans for Candidates & Employers
          </h2>
          <p className="text-sm sm:text-base text-slate-650 dark:text-slate-400 font-sans">
            Choose the plan that fits your career goals or hiring scale.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs sm:text-sm font-semibold font-sans ${!annual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-800 p-1 relative transition-colors focus:outline-none"
            >
              <div
                className={`w-6 h-6 rounded-full bg-brand-600 shadow-md transition-transform ${
                  annual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs sm:text-sm font-semibold font-sans flex items-center gap-1.5 ${annual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              Annual Billing
              <Badge variant="success" size="sm">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`glass-card p-8 rounded-3xl space-y-6 relative flex flex-col justify-between border hover:shadow-2xl transition-all duration-300 ${
                p.popular
                  ? 'border-brand-500 shadow-xl shadow-brand-500/10 bg-slate-900 dark:bg-dark-card text-white'
                  : 'border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-dark-card/90'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-accent-purple text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <h3 className={`text-xl font-bold font-sans ${p.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{p.name}</h3>
                <p className={`text-xs font-medium font-sans ${p.popular ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{p.desc}</p>

                <div className="flex items-baseline gap-1 pt-2">
                  <span className={`text-4xl sm:text-5xl font-black font-sans ${p.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {annual ? p.priceAnnual : p.priceMonthly}
                  </span>
                  <span className={`text-xs font-semibold font-sans ${p.popular ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>/ month</span>
                </div>

                <div className={`pt-4 border-t space-y-3 ${p.popular ? 'border-slate-800' : 'border-slate-200/60 dark:border-slate-800/60'}`}>
                  {p.features.map((feat, i) => (
                    <div key={i} className={`flex items-center gap-2.5 text-xs font-medium font-sans ${p.popular ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  variant={p.popular ? 'primary' : 'outline'}
                  className={`w-full h-11 text-xs font-bold ${
                    p.popular ? 'shadow-lg shadow-brand-500/20' : 'text-slate-800 border-slate-300/80 hover:bg-slate-100 dark:text-white dark:border-slate-800 dark:hover:bg-slate-900/60'
                  }`}
                  onClick={() => navigate('/auth/register')}
                >
                  {p.cta} <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
};
