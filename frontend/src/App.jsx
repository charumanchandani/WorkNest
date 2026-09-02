import React, { useState } from 'react';
import {
  Layers,
  Sun,
  Moon,
  Plus,
  ArrowRight,
  Trash2,
  Mail,
  Search,
  CheckCircle2,
  FileText,
  UserCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from './hooks';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Divider,
  Modal,
  Spinner,
  Alert,
  EmptyState,
} from './components/ui';

export function App() {
  const { theme, toggleTheme } = useTheme();

  // Showcase state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [checkboxState, setCheckboxState] = useState(true);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [selectValue, setSelectValue] = useState('engineering');

  const departmentOptions = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'product', label: 'Product & Design' },
    { value: 'operations', label: 'People Operations' },
    { value: 'finance', label: 'Finance & Legal' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-subtle">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">WorkNest</span>
                <Badge variant="primary" size="sm" dot>
                  Design System
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                UI Foundation & Component Library &bull; Phase 1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              leftIcon={theme === 'dark' ? Sun : Moon}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="hidden sm:inline">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </Button>

            <Badge variant="neutral" size="sm">
              v1.0.0
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Intro Hero Section */}
        <section className="space-y-3 pb-6 border-b border-border">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            <span>Visual Foundations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            WorkNest Design System & UI Foundation
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Standardized, accessible, and theme-aware UI components built for the WorkNest
            employee operations platform. Designed with high contrast, crisp typography, and responsive layouts.
          </p>
        </section>

        {/* 1. Typography Hierarchy */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <span>1. Typography Scale</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Clear typographic hierarchy maintaining readability across all screen sizes.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline pb-4 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Page Title (H1)</span>
                <span className="md:col-span-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Workplace Management Overview
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline pb-4 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Section Title (H2)</span>
                <span className="md:col-span-3 text-xl font-semibold tracking-tight text-foreground">
                  Employee Directory & Organizations
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline pb-4 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subsection (H3)</span>
                <span className="md:col-span-3 text-base font-semibold text-foreground">
                  Active Department Requests
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline pb-4 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Body Text</span>
                <span className="md:col-span-3 text-sm text-foreground leading-relaxed">
                  WorkNest simplifies operational workflows, attendance logging, leave approvals, and employee performance tracking in a unified workspace.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Muted / Micro Text</span>
                <span className="md:col-span-3 text-xs text-muted-foreground">
                  Last synchronized on September 2, 2026 at 10:45 AM &bull; Automated audit log ID #8942
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. Buttons & Actions */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              2. Buttons & Interactive States
            </h2>
            <p className="text-xs text-muted-foreground">
              Button variants, sizes, icon combinations, loading spinners, and disabled states.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Semantic button styles for primary, secondary, destructive, and subtle actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Variants */}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" leftIcon={Plus}>
                  Primary Action
                </Button>
                <Button variant="secondary" leftIcon={Building2}>
                  Secondary Action
                </Button>
                <Button variant="outline" rightIcon={ExternalLink}>
                  Outline Button
                </Button>
                <Button variant="ghost">
                  Ghost Action
                </Button>
                <Button variant="destructive" leftIcon={Trash2}>
                  Delete Item
                </Button>
              </div>

              <Divider label="Sizes & Icon Placements" />

              {/* Sizes */}
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="primary">
                  Small Button
                </Button>
                <Button size="md" variant="primary">
                  Medium Button (Default)
                </Button>
                <Button size="lg" variant="primary" rightIcon={ArrowRight}>
                  Large Button
                </Button>
              </div>

              <Divider label="States" />

              {/* Dynamic Loading & Disabled States */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  isLoading={buttonLoading}
                  onClick={() => {
                    setButtonLoading(true);
                    setTimeout(() => setButtonLoading(false), 1500);
                  }}
                >
                  {buttonLoading ? 'Processing Request...' : 'Click to Test Loading State'}
                </Button>

                <Button variant="secondary" disabled>
                  Disabled Button
                </Button>

                <Button variant="outline" disabled leftIcon={Mail}>
                  Disabled with Icon
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. Form Controls & Inputs */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              3. Form Inputs & Form Controls
            </h2>
            <p className="text-xs text-muted-foreground">
              Input fields, select menus, multiline textareas, checkboxes, validation errors, and helper hints.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Employee Full Name"
                  placeholder="e.g. Alex Morgan"
                  helperText="Enter official name as listed in identity documents."
                  required
                />

                <Input
                  label="Work Email Address"
                  type="email"
                  placeholder="alex.morgan@worknest.io"
                  leftIcon={Mail}
                  helperText="Company domain credentials."
                />

                <Input
                  label="Employee ID Code"
                  defaultValue="EMP-99238"
                  error="This Employee ID is already assigned to another staff member."
                  required
                />

                <Input
                  label="Search Directory"
                  placeholder="Search by name, role, or team..."
                  leftIcon={Search}
                />

                <Select
                  label="Assigned Department"
                  options={departmentOptions}
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                  helperText="Select organizational unit."
                />

                <Input
                  label="Account Access Status"
                  defaultValue="System Read-Only"
                  disabled
                  helperText="Managed by corporate administrator."
                />
              </div>

              <div className="pt-2">
                <Textarea
                  label="Role Description & Operational Notes"
                  placeholder="Describe key responsibilities and department duties..."
                  rows={3}
                  helperText="Brief summary for team visibility (max 500 characters)."
                />
              </div>

              <Divider label="Checkboxes" />

              <div className="space-y-4">
                <Checkbox
                  label="Enable automatic weekly attendance summary"
                  description="Sends an email digest every Friday afternoon with attendance metrics."
                  checked={checkboxState}
                  onChange={(e) => setCheckboxState(e.target.checked)}
                />

                <Checkbox
                  label="Receive emergency system broadcasts"
                  description="Real-time critical announcements dispatched by human resources."
                  defaultChecked
                />

                <Checkbox
                  label="Restricted enterprise compliance permission"
                  description="Requires level 3 administrator elevation."
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Badges & Status Indicators */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              4. Badges & Status Indicators
            </h2>
            <p className="text-xs text-muted-foreground">
              Semantic badges for attendance, leave requests, employee statuses, and department tags.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Standard Badges
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <Badge variant="neutral">Neutral / Draft</Badge>
                  <Badge variant="primary">Active / Primary</Badge>
                  <Badge variant="success">Approved / On Track</Badge>
                  <Badge variant="warning">Pending Review</Badge>
                  <Badge variant="destructive">Rejected / Terminated</Badge>
                  <Badge variant="info">Information / Processing</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Status Indicator Badges (with dot)
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <Badge variant="neutral" dot>Offline</Badge>
                  <Badge variant="primary" dot>Operational</Badge>
                  <Badge variant="success" dot>Present</Badge>
                  <Badge variant="warning" dot>On Leave</Badge>
                  <Badge variant="destructive" dot>Critical Issue</Badge>
                  <Badge variant="info" dot>In Meeting</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  Icon & Small Size Badges
                </span>
                <div className="flex flex-wrap gap-2.5 items-center">
                  <Badge variant="primary" icon={UserCheck} size="sm">Verified Staff</Badge>
                  <Badge variant="success" icon={CheckCircle2} size="sm">Completed</Badge>
                  <Badge variant="neutral" icon={FileText} size="sm">Documentation</Badge>
                  <Badge variant="warning" size="sm">Action Required</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 5. Alerts & System Feedback */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              5. Alerts & System Feedback
            </h2>
            <p className="text-xs text-muted-foreground">
              Informative banners with dismiss actions, distinct icons, and accessible role representations.
            </p>
          </div>

          <div className="space-y-3">
            {!alertDismissed && (
              <Alert
                variant="info"
                title="System Maintenance Notice"
                onDismiss={() => setAlertDismissed(true)}
              >
                Scheduled database index optimization will occur this Sunday from 02:00 UTC to 03:00 UTC.
              </Alert>
            )}

            <Alert
              variant="success"
              title="Attendance Record Saved"
            >
              Check-in confirmed for September 2, 2026 at 09:00:14 AM. Location: HQ Office.
            </Alert>

            <Alert
              variant="warning"
              title="Pending Leave Approvals"
            >
              You have 3 employee leave requests awaiting manager sign-off before the payroll cutoff.
            </Alert>

            <Alert
              variant="destructive"
              title="Authentication Token Expired"
            >
              Your current session has timed out. Please sign in again to continue operations.
            </Alert>
          </div>
        </section>

        {/* 6. Cards & Surface Hierarchy */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              6. Cards & Surface Hierarchy
            </h2>
            <p className="text-xs text-muted-foreground">
              Structured container blocks with headers, content areas, and action footers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Engineering Department</CardTitle>
                  <Badge variant="primary">14 Members</Badge>
                </div>
                <CardDescription>Core product development and systems infrastructure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Responsible for web applications, backend APIs, data pipelines, and enterprise security standards.
                </p>
                <div className="flex items-center gap-2 text-xs text-foreground font-medium pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>All microservices operational &bull; 99.98% uptime</span>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-muted-foreground">Lead: Sarah Connor</span>
                <Button size="sm" variant="outline">
                  View Team
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>People & Culture</CardTitle>
                  <Badge variant="neutral">6 Members</Badge>
                </div>
                <CardDescription>Human resources, talent recruitment, and workplace policies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Manages employee onboarding cycles, benefits administration, holiday calendars, and compliance.
                </p>
                <div className="flex items-center gap-2 text-xs text-foreground font-medium pt-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Annual review cycle starts next month</span>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-muted-foreground">Lead: Marcus Vance</span>
                <Button size="sm" variant="outline">
                  View Team
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 7. Loading States & Empty State */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              7. Loading Spinners & Empty States
            </h2>
            <p className="text-xs text-muted-foreground">
              Zero-data views and non-blocking loading feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <Card>
              <CardHeader>
                <CardTitle>Activity Spinners</CardTitle>
                <CardDescription>Accessible SVGs with role="status" and text labels.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-around py-6 text-teal-600 dark:text-teal-400">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-muted-foreground">Small (16px)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <span className="text-xs text-muted-foreground">Medium (20px)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-xs text-muted-foreground">Large (28px)</span>
                </div>
              </CardContent>
            </Card>

            <EmptyState
              icon={FileText}
              title="No Pending Document Requests"
              description="There are currently no employee document or verification requests awaiting your action."
              action={
                <Button size="sm" variant="primary" leftIcon={Plus}>
                  Create New Request
                </Button>
              }
            />
          </div>
        </section>

        {/* 8. Interactive Modal / Dialog Showcase */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              8. Modal & Dialog Overlay
            </h2>
            <p className="text-xs text-muted-foreground">
              Accessible dialog with focus management, backdrop dismiss, and Escape key listener.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Interactive Dialog Demonstration
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click the button to preview modal layering, responsive dialog sizing, and keyboard control.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Open Demo Dialog
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Reusable Modal Instance for Testing */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Department Configuration"
        description="Modify properties for the selected workplace department."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-1">
          <Input
            label="Department Name"
            defaultValue="Engineering & Platform"
            required
          />
          <Select
            label="Department Head"
            options={[
              { value: 'sarah', label: 'Sarah Connor (Staff Engineer)' },
              { value: 'alex', label: 'Alex Morgan (Principal Architect)' },
            ]}
          />
          <Checkbox
            label="Allow cross-department task assignment"
            defaultChecked
          />
        </div>
      </Modal>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 text-center text-xs text-muted-foreground">
        <p>WorkNest Design System Foundation &bull; Ready for Phase 2</p>
      </footer>
    </div>
  );
}

export default App;
