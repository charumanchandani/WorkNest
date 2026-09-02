import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Layers,
  LayoutDashboard,
  Clock,
  Calendar,
  CheckSquare,
  FileText,
  Megaphone,
  Bell,
  User,
  Settings,
  X,
  Users,
  Building2,
  CalendarCheck2,
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { Badge } from '../ui';

export const Sidebar = ({ isOpen, onClose, onShowModuleNotice }) => {
  const { user } = useAuth();
  const location = useLocation();

  const mainNavItems = [
    {
      name: 'Overview',
      path: '/app',
      icon: LayoutDashboard,
      active: location.pathname === '/app',
      phase: null,
    },
    {
      name: 'My Attendance',
      path: '/app/attendance',
      icon: Clock,
      active: location.pathname === '/app/attendance',
      phase: null,
    },
    {
      name: 'My Leave',
      path: null,
      icon: Calendar,
      phase: 'Phase 8',
    },
    {
      name: 'My Tasks',
      path: null,
      icon: CheckSquare,
      phase: 'Phase 9',
    },
    {
      name: 'Documents',
      path: null,
      icon: FileText,
      phase: 'Phase 10',
    },
    {
      name: 'Announcements',
      path: null,
      icon: Megaphone,
      phase: 'Phase 10',
    },
    {
      name: 'Notifications',
      path: null,
      icon: Bell,
      phase: 'Phase 11',
    },
  ];

  // Role-aware management navigation items
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  const handleItemClick = (item) => {
    if (item.path) {
      if (onClose) onClose();
    } else {
      if (onShowModuleNotice) {
        onShowModuleNotice(item.name, item.phase);
      }
    }
  };

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

  const isEmployeesActive = location.pathname.startsWith('/app/employees');
  const isDepartmentsActive = location.pathname.startsWith('/app/departments');
  const isAttendanceManageActive = location.pathname === '/app/attendance/manage';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border text-card-foreground">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-border flex items-center justify-between">
        <Link
          to="/app"
          onClick={onClose}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-subtle group-hover:bg-teal-700 transition-colors">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-foreground block leading-none">
              WorkNest
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Workspace
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar navigation"
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Employee Operations */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Employee Workspace
          </span>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            if (item.path) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200/60 dark:border-teal-800/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            }

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group text-muted-foreground hover:text-foreground hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>{item.name}</span>
                </div>

                {item.phase && (
                  <span className="text-[10px] text-muted-foreground/80 bg-secondary/80 px-1.5 py-0.5 rounded font-mono">
                    {item.phase}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Role-aware management section (Admin & Manager) */}
        {isManagerOrAdmin && (
          <div className="space-y-1 pt-2 border-t border-border">
            <span className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              {isAdmin ? 'Organization Admin' : 'Team Management'}
            </span>

            {/* Attendance Monitoring Route */}
            <Link
              to="/app/attendance/manage"
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isAttendanceManageActive
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200/60 dark:border-teal-800/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarCheck2
                  className={`w-4 h-4 transition-colors ${
                    isAttendanceManageActive
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <span>Attendance Logs</span>
              </div>
            </Link>

            {/* Live Employee Directory Route */}
            <Link
              to="/app/employees"
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isEmployeesActive
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200/60 dark:border-teal-800/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users
                  className={`w-4 h-4 transition-colors ${
                    isEmployeesActive
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <span>Employees</span>
              </div>
            </Link>

            {/* Live Departments & Org Route */}
            <Link
              to="/app/departments"
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isDepartmentsActive
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200/60 dark:border-teal-800/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2
                  className={`w-4 h-4 transition-colors ${
                    isDepartmentsActive
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <span>Departments</span>
              </div>
            </Link>
          </div>
        )}

        {/* System & Settings section */}
        <div className="space-y-1 pt-2 border-t border-border">
          <span className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Account & System
          </span>

          <button
            type="button"
            onClick={() => onShowModuleNotice && onShowModuleNotice('Profile Details', 'Phase 14')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>My Profile</span>
            </div>
            <span className="text-[10px] text-muted-foreground/80 bg-secondary/80 px-1.5 py-0.5 rounded font-mono">
              Phase 14
            </span>
          </button>

          <button
            type="button"
            onClick={() => onShowModuleNotice && onShowModuleNotice('Settings', 'Phase 14')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Workplace Settings</span>
            </div>
            <span className="text-[10px] text-muted-foreground/80 bg-secondary/80 px-1.5 py-0.5 rounded font-mono">
              Phase 14
            </span>
          </button>
        </div>
      </div>

      {/* User Info Footer in Sidebar */}
      <div className="p-3.5 border-t border-border bg-secondary/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center shrink-0 border border-border">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-foreground truncate block leading-tight">
              {user?.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate block">
              {user?.email}
            </span>
          </div>
        </div>

        <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
          {user?.role}
        </Badge>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (w-64) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Sheet) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          className="fixed inset-0 z-50 md:hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-dialog z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
