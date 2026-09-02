import React from 'react';
import { ArrowRight, ChevronDown, ShieldCheck, Zap, Users } from 'lucide-react';
import { Button, Badge } from '../ui';
import ProductPreview from './ProductPreview';

export const HeroSection = ({ onOpenAuthPlaceholder }) => {
  const scrollToCapabilities = () => {
    const element = document.querySelector('#capabilities');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Subtle background glow effect (restrained) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/5 dark:bg-teal-500/10 blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Text Content */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" dot>
              Employee operations, simplified
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Manage people, attendance, leave, tasks and workplace operations from{' '}
            <span className="text-teal-600 dark:text-teal-400">one connected platform.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            WorkNest brings daily HR workflows, team operations, and organization management into a single, intuitive workspace built for growing companies.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              rightIcon={ArrowRight}
              onClick={onOpenAuthPlaceholder}
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>

            <Button
              variant="outline"
              size="lg"
              rightIcon={ChevronDown}
              onClick={scrollToCapabilities}
              className="w-full sm:w-auto"
            >
              Explore Platform
            </Button>
          </div>

          {/* Credibility highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Role-Based Permissions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Real-Time Operational Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Intuitive Employee Self-Service</span>
            </div>
          </div>
        </div>

        {/* Product Visual Container */}
        <div className="pt-4 max-w-5xl mx-auto">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
