import React, { useState } from 'react';
import {
  User,
  Users,
  Shield,
  CheckCircle2,
  Clock,
  Calendar,
  CheckSquare,
  FileText,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../ui';

export const RoleExperienceSection = () => {
  const [activeRole, setActiveRole] = useState('employee');

  const roles = [
    {
      id: 'employee',
      name: 'Employee',
      icon: User,
      badge: 'Individual Contributor',
      tagline: 'Self-service workspace designed for clarity and focus',
      description:
        'Employees get a clean personal portal to log daily attendance, submit leave requests with live balance tracking, manage assigned tasks, and access company resources.',
      highlights: [
        { icon: Clock, text: 'One-click daily attendance check-in and remote shift logging' },
        { icon: Calendar, text: 'Time-off requests with real-time leave balance calculations' },
        { icon: CheckSquare, text: 'Personal task queue with priority tags and due date reminders' },
        { icon: FileText, text: 'Direct access to company handbooks, policies, and internal docs' },
      ],
    },
    {
      id: 'manager',
      name: 'Manager',
      icon: Users,
      badge: 'Team Lead & Supervisor',
      tagline: 'Team oversight, fast approvals, and operational visibility',
      description:
        'Managers receive actionable dashboards to supervise department attendance, approve or reject leave requests with a single click, and delegate team tasks.',
      highlights: [
        { icon: Users, text: 'Live team attendance roster and daily availability status' },
        { icon: Calendar, text: 'Streamlined approval queue for pending employee leave' },
        { icon: CheckSquare, text: 'Task assignment and operational progress tracking across projects' },
        { icon: TrendingUp, text: 'Team workload balance and department productivity overview' },
      ],
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: Shield,
      badge: 'HR & Organization Lead',
      tagline: 'Complete organizational control and enterprise governance',
      description:
        'Administrators configure organizational hierarchies, provision user roles, enforce workplace policies, broadcast announcements, and generate compliance reports.',
      highlights: [
        { icon: Settings, text: 'Department structures, job positions, and permission matrix management' },
        { icon: Users, text: 'Employee lifecycle management from onboarding to role transitions' },
        { icon: FileText, text: 'Global announcement broadcasts and document management policies' },
        { icon: TrendingUp, text: 'Exportable payroll logs, attendance audit trails, and leave reports' },
      ],
    },
  ];

  const currentRole = roles.find((r) => r.id === activeRole) || roles[0];
  const CurrentIcon = currentRole.icon;

  return (
    <section id="roles" className="py-16 md:py-24 bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" size="sm">
            Role-Based Access
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Tailored experiences for every level of your team
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            WorkNest provides dedicated interfaces configured for individual employees, team managers, and enterprise administrators.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-xl bg-secondary/70 border border-border gap-1 sm:gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRole(r.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected
                      ? 'bg-card text-foreground shadow-subtle border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600 dark:text-teal-400' : ''}`} />
                  <span>{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Role View Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-teal-500/30 shadow-subtle">
            <CardHeader className="p-6 sm:p-8 pb-4 border-b border-border space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <CurrentIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {currentRole.name} Experience
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {currentRole.tagline}
                    </p>
                  </div>
                </div>

                <Badge variant="primary" size="md">
                  {currentRole.badge}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                {currentRole.description}
              </p>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Key Platform Capabilities for {currentRole.name}s:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentRole.highlights.map((h, i) => {
                  const HIcon = h.icon;
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-border bg-secondary/30 flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                        <HIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-foreground font-medium leading-tight">
                        {h.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RoleExperienceSection;
