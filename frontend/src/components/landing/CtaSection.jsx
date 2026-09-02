import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronUp, Layers } from 'lucide-react';
import { Button } from '../ui';

export const CtaSection = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-teal-500/30 bg-gradient-to-b from-teal-500/5 via-card to-card p-8 sm:p-12 md:p-16 text-center space-y-6 shadow-subtle overflow-hidden">
          {/* Subtle decorative background shape */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/5 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center mx-auto shadow-subtle">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Bring your workplace operations into one place.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Join modern organizations streamlining staff management, attendance, leave approvals, and daily tasks with WorkNest.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              rightIcon={ArrowRight}
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>

            <Button
              variant="outline"
              size="lg"
              rightIcon={ChevronUp}
              onClick={scrollToTop}
              className="w-full sm:w-auto"
            >
              Back to Top
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            Modular architecture &bull; Role-based security &bull; No complex training required
          </p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
