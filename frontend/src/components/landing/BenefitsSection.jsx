import React from 'react';
import {
  Layers,
  Zap,
  Eye,
  CheckCircle2,
  FileSearch,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '../ui';

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: Layers,
      title: 'One Connected Workspace',
      description:
        'Eliminate disparate tools. Manage team members, daily attendance, time off, and duties from a single, unified interface.',
    },
    {
      icon: Zap,
      title: 'Less Operational Friction',
      description:
        'Standardize request and approval cycles with direct supervisor routing, automated validation, and instant notifications.',
    },
    {
      icon: Eye,
      title: 'Clear Team Visibility',
      description:
        'Instantly check who is in office, working remotely, or on approved leave across all organizational departments.',
    },
    {
      icon: CheckCircle2,
      title: 'Consistent Workplace Processes',
      description:
        'Ensure company leave policies, onboarding procedures, and document verification steps are uniformly applied.',
    },
    {
      icon: FileSearch,
      title: 'Better Access to Information',
      description:
        'Provide employees self-service access to policy handbooks, emergency announcements, and personal attendance history.',
    },
    {
      icon: ShieldCheck,
      title: 'Scalable Enterprise Foundation',
      description:
        'Built with robust role-based access control, secure authentication architecture, and reliable MongoDB data storage.',
    },
  ];

  return (
    <section id="benefits" className="py-16 md:py-24 bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" size="sm">
            Operational Value
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Why organizations choose WorkNest
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Designed to bring predictability, efficiency, and clarity to daily workplace operations.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="hover:border-teal-500/40 hover:shadow-subtle transition-all duration-150"
              >
                <CardHeader className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>

                  <CardTitle className="text-base font-semibold text-foreground">
                    {benefit.title}
                  </CardTitle>

                  <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
