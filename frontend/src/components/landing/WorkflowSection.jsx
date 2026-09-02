import React from 'react';
import { Building, Activity, LineChart, ArrowRight } from 'lucide-react';
import { Badge } from '../ui';

export const WorkflowSection = () => {
  const steps = [
    {
      step: '01',
      icon: Building,
      title: 'Set up your workplace',
      description:
        'Structure company departments, establish role permissions, invite team members, and configure leave & attendance policies.',
    },
    {
      step: '02',
      icon: Activity,
      title: 'Manage daily operations',
      description:
        'Employees log attendance and submit requests; managers review approvals and delegate tasks in one frictionless workspace.',
    },
    {
      step: '03',
      icon: LineChart,
      title: 'Track and improve performance',
      description:
        'Access real-time operational reports, identify workload bottlenecks, ensure regulatory compliance, and optimize workforce output.',
    },
  ];

  return (
    <section id="workflow" className="py-16 md:py-24 bg-secondary/30 border-y border-border scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" size="sm">
            Simple Workflow
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            How WorkNest powers your organization
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Get up and running in minutes with a structured 3-step operations cycle.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col p-6 rounded-2xl bg-card border border-border shadow-subtle space-y-4"
              >
                {/* Step Top Bar */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-teal-600/40 dark:text-teal-400/40 tracking-wider">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Step connector indicator on desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 z-10">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
