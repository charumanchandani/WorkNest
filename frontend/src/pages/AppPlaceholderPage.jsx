import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  LogOut,
  User,
  Mail,
  Shield,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth, useTheme } from '../hooks';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Divider } from '../components/ui';

export const AppPlaceholderPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'MANAGER':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-subtle">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground">
                WorkNest
              </span>
              <span className="text-[11px] text-muted-foreground ml-2 hidden sm:inline">
                Authentication & RBAC Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              leftIcon={theme === 'dark' ? Sun : Moon}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            />

            <Button
              variant="outline"
              size="sm"
              leftIcon={LogOut}
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6 w-full">
        {/* Success Banner */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 flex items-start gap-3 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Authentication & RBAC Verified</h2>
            <p className="text-xs opacity-90 leading-relaxed">
              Your session was authenticated securely via signed HttpOnly cookie. Role-based access control is actively protecting this workspace.
            </p>
          </div>
        </div>

        {/* User Identity Card */}
        <Card className="shadow-dialog border-border">
          <CardHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <CardTitle className="text-lg">{user?.name}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>

              <Badge
                variant={getRoleBadgeVariant(user?.role)}
                size="md"
                dot
              >
                {user?.role}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Session & Authorization Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-secondary/40 border border-border flex items-center gap-2.5">
                <User className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <div>
                  <span className="text-muted-foreground block">User ID</span>
                  <span className="font-mono font-medium text-foreground">{user?.id || '—'}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/40 border border-border flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <div>
                  <span className="text-muted-foreground block">Authorized Role</span>
                  <span className="font-medium text-foreground">{user?.role}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/40 border border-border flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <div>
                  <span className="text-muted-foreground block">Account Status</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {user?.isActive ? 'Active & Verified' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/40 border border-border flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <div>
                  <span className="text-muted-foreground block">Phase Milestone</span>
                  <span className="font-medium text-foreground">Phase 3 Complete</span>
                </div>
              </div>
            </div>

            <Divider label="Roadmap Notice" />

            <div className="p-3.5 rounded-lg bg-secondary/30 border border-border text-xs text-muted-foreground space-y-1 leading-relaxed">
              <p className="font-semibold text-foreground">
                Next: Phase 4 — Application Shell + Employee Dashboard
              </p>
              <p>
                Full operational dashboards for Employees, Managers, and Admins will be constructed in Phase 4 and beyond.
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-border mt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Landing Page</span>
            </Link>

            <Button
              variant="destructive"
              size="sm"
              leftIcon={LogOut}
              onClick={logout}
            >
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AppPlaceholderPage;
