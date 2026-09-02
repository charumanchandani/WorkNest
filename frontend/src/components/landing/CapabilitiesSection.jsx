import React from 'react';
import {
  Users,
  Clock,
  Calendar,
  CheckSquare,
  FileText,
  Megaphone,
  Bell,
  BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '../ui';

export const CapabilitiesSection = () => {
  const capabilities = [
    {
      icon: Users,
      title: 'Employee Management',
      tag: 'People',
      description:
        'Centralize staff profiles, department hierarchies, contact details, and role assignments in one directory.',
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      tag: 'Time',
      description:
        'Streamline daily check-ins, remote attendance logging, shift timings, and automated work-hour calculations.',
    },
    {
      icon: Calendar,
      title: 'Leave Management',
      tag: 'Approvals',
      description:
        'Submit time-off requests with leave balances, manager review workflows, and shared holiday calendars.',
    },
    {
      icon: CheckSquare,
      title: 'Task Management',
      tag: 'Operations',
      description:
        'Assign duties, track priority deliverables, set due dates, and monitor team progress across departments.',
    },
    {
      icon: FileText,
      title: 'Document Hub',
      tag: 'Files',
      description:
        'Store and share employee handbooks, compliance policies, onboarding records, and official company assets.',
    },
    {
      icon: Megaphone,
      title: 'Announcements',
      tag: 'Communication',
      description:
        'Broadcast company-wide notices, urgent policy updates, and event schedules directly to staff feeds.',
    },
    {
      icon: Bell,
      title: 'Activity & Notifications',
      tag: 'Alerts',
      description:
        'Real-time alerts for leave approvals, task assignments, upcoming deadlines, and operational events.',
    },
    {
      icon: BarChart3,
      title: 'Operational Reports',
      tag: 'Analytics',
      description:
        'Export attendance logs, review leave trends, examine department headcounts, and analyze productivity.',
    },
  ];

  return (
    <section id="capabilities" className="py-16 md:py-24 bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" size="sm">
            Platform Capabilities
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything your workplace needs to run smoothly
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Eliminate fragmented tools and disconnected spreadsheets. WorkNest integrates all essential employee operations under one roof.
          </p>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="group hover:border-teal-500/50 hover:shadow-subtle transition-all duration-200"
              >
                <CardHeader className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="neutral" size="sm">
                      {item.tag}
                    </Badge>
                  </div>

                  <CardTitle className="text-base font-semibold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </CardTitle>

                  <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
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

export default CapabilitiesSection;
