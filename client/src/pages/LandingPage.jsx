import React from 'react';
import { AnnouncementBar } from '../features/landing/components/AnnouncementBar';
import { NavbarLanding } from '../features/landing/components/NavbarLanding';
import { HeroSection } from '../features/landing/components/HeroSection';
import { TrustedCompaniesSection } from '../features/landing/components/TrustedCompaniesSection';
import { StatsSection } from '../features/landing/components/StatsSection';
import { FeaturesSection } from '../features/landing/components/FeaturesSection';
import { HowItWorksSection } from '../features/landing/components/HowItWorksSection';
import { AIShowcaseSection } from '../features/landing/components/AIShowcaseSection';
import { DashboardShowcaseSection } from '../features/landing/components/DashboardShowcaseSection';
import { WhyChooseSection } from '../features/landing/components/WhyChooseSection';
import { TestimonialsSection } from '../features/landing/components/TestimonialsSection';
import { PricingSection } from '../features/landing/components/PricingSection';
import { FAQSection } from '../features/landing/components/FAQSection';
import { CTASection } from '../features/landing/components/CTASection';
import { FooterLanding } from '../features/landing/components/FooterLanding';

export const LandingPage = () => {
  return (
    <div className="space-y-12 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* Main Content Sections */}
      <main className="flex-1 space-y-12">
        {/* 3. Hero Section */}
        <HeroSection />

        {/* 4. Trusted Companies */}
        <TrustedCompaniesSection />

        {/* 5. Platform Statistics */}
        <StatsSection />

        {/* 6. Features Section (12 Premium Cards) */}
        <FeaturesSection />

        {/* 7. How It Works */}
        <HowItWorksSection />

        {/* 8. AI Showcase */}
        <AIShowcaseSection />

        {/* 9. Dashboard Showcase */}
        <DashboardShowcaseSection />

        {/* 10. Why Choose SkillBridge AI */}
        <WhyChooseSection />

        {/* 11. Testimonials */}
        <TestimonialsSection />

        {/* 12. Pricing */}
        <PricingSection />

        {/* 13. FAQ */}
        <FAQSection />

        {/* 14. Call To Action */}
        <CTASection />
      </main>
    </div>
  );
};
