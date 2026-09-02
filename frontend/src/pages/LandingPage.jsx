import React, { useState } from 'react';
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
import { Modal, Button, Badge } from '../components/ui';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export const LandingPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 flex flex-col">
      {/* 1. Navbar */}
      <Navbar onOpenAuthPlaceholder={() => setAuthModalOpen(true)} />

      {/* Main Content Flow */}
      <main className="flex-1">
        {/* 2. Hero Section & Product Visual */}
        <HeroSection onOpenAuthPlaceholder={() => setAuthModalOpen(true)} />

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
        <CtaSection onOpenAuthPlaceholder={() => setAuthModalOpen(true)} />
      </main>

      {/* 10. Footer */}
      <Footer />

      {/* Accessible Non-Breaking Auth Phase Placeholder Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Workplace Access Notice"
        size="md"
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAuthModalOpen(false)}
          >
            Understood
          </Button>
        }
      >
        <div className="space-y-3 py-1">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Phase 2 Active &bull; Public Experience
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Secure Authentication (JWT, bcrypt, and Role-Based Authorization for Employees, Managers, and Admins) is scheduled for <strong>Phase 3</strong>.
          </p>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs text-foreground space-y-1">
            <span className="font-semibold block text-teal-600 dark:text-teal-400">
              Upcoming in Phase 3:
            </span>
            <p className="text-muted-foreground">
              User registration, secure credentials authentication, role permissions, and protected dashboard routing.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;
