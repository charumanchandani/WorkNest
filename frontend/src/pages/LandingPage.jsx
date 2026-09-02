import React from 'react';
import {
  Navbar,
  HeroSection,
  TrustStrip,
  CapabilitiesSection,
  WorkflowSection,
  RoleExperienceSection,
  OperationsOverviewSection,
  BenefitsSection,
  CtaSection,
  Footer,
} from '../components/landing';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 flex flex-col">
      {/* 1. Navbar */}
      <Navbar />

      {/* Main Content Flow */}
      <main className="flex-1">
        {/* 2. Hero Section & Product Visual */}
        <HeroSection />

        {/* 3. Trust & Credibility Strip */}
        <TrustStrip />

        {/* 4. Core Capabilities (8 Cards) */}
        <CapabilitiesSection />

        {/* 5. How WorkNest Works (3-Step Workflow) */}
        <WorkflowSection />

        {/* 6. Role-Based Experience (Employee, Manager, Admin) */}
        <RoleExperienceSection />

        {/* 7. Workplace Operations Overview (Connected Pipeline) */}
        <OperationsOverviewSection />

        {/* 8. Product Benefits */}
        <BenefitsSection />

        {/* 9. Conversion CTA Section */}
        <CtaSection />
      </main>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
