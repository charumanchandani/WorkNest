import React from 'react';
import {
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';

export const ProductPreview = () => {
  return (
    <div className="w-full rounded-2xl border border-border bg-card/95 shadow-dialog overflow-hidden">
      {/* Mock App Window Header */}
      <div className="px-4 py-3 bg-secondary/70 border-b border-border flex items-center justify-between gap-4">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          <span className="text-xs font-medium text-muted-foreground ml-2 hidden sm:inline">
            WorkNest Operations Workspace &bull; live view
          </span>
        </div>

        {/* Mock search & user info */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-background border border-border text-xs text-muted-foreground w-48">
            <Search className="w-3.5 h-3.5" />
            <span>Search staff, tasks...</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-foreground">HQ Operations</span>
          </div>
        </div>
      </div>

      {/* Mock Workspace Content Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 bg-background/50">
        {/* Column 1: Live Attendance & Team Status */}
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Today's Attendance</span>
                </CardTitle>
                <Badge variant="success" size="sm" dot>
                  96% Present
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-secondary/50 border border-border">
                  <span className="text-base font-bold text-foreground block">52</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">In Office</span>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50 border border-border">
                  <span className="text-base font-bold text-foreground block">14</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Remote</span>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50 border border-border">
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400 block">3</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">On Leave</span>
                </div>
              </div>

              {/* Sample Activity Line */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Elena Rostova</span>
                  <span className="text-[11px] text-muted-foreground">Checked in 08:58 AM</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">David Chen</span>
                  <span className="text-[11px] text-muted-foreground">Remote &bull; 09:02 AM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Widget */}
          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-foreground block">Total Personnel</span>
                <span className="text-[11px] text-muted-foreground">69 Active Employees across 5 Departments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Pending Leave Requests & Approvals */}
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Leave Approvals</span>
                </CardTitle>
                <Badge variant="warning" size="sm">
                  2 Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {/* Item 1 */}
              <div className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Sarah Jenkins</span>
                  <Badge variant="warning" size="sm">Annual Leave</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Sep 08 – Sep 11 (4 days) &bull; Engineering Team
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    className="flex-1 py-1 px-2 rounded bg-teal-600 text-white text-[11px] font-medium flex items-center justify-center gap-1 hover:bg-teal-700 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button
                    type="button"
                    className="py-1 px-2 rounded border border-border text-[11px] font-medium text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Marcus Vance</span>
                  <Badge variant="info" size="sm">Sick Leave</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Sep 03 (1 day) &bull; Product Operations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 3: Priority Tasks & Announcements */}
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Operations Tasks</span>
                </CardTitle>
                <Badge variant="neutral" size="sm">
                  Q3 Cycle
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2.5">
              <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <span className="text-xs font-medium text-foreground block line-through opacity-70">
                    Submit monthly payroll attendance log
                  </span>
                  <span className="text-[10px] text-muted-foreground">Completed by HR Admin</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                <div className="w-4 h-4 rounded border border-border shrink-0 mt-0.5 bg-background" />
                <div className="space-y-0.5 flex-1">
                  <span className="text-xs font-medium text-foreground block">
                    Verify new employee onboarding docs
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Due in 2 days</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                <div className="w-4 h-4 rounded border border-border shrink-0 mt-0.5 bg-background" />
                <div className="space-y-0.5 flex-1">
                  <span className="text-xs font-medium text-foreground block">
                    Publish revised workplace holiday calendar
                  </span>
                  <span className="text-[10px] text-muted-foreground">Draft review in progress</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Broadcast alert */}
          <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-800/80 bg-sky-50 dark:bg-sky-950/40 flex items-start gap-2.5 text-xs text-sky-900 dark:text-sky-200">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Company Policy Update</span>
              <p className="text-[11px] opacity-90 leading-tight">
                2026 Workplace Hybrid Guidelines document published.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
