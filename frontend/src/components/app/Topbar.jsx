import React from 'react';
import { Menu, Sun, Moon, CalendarDays } from 'lucide-react';
import { useTheme } from '../../hooks';
import { Button } from '../ui';
import UserMenu from './UserMenu';
import NotificationPopover from './NotificationPopover';

export const Topbar = ({ onOpenMobileMenu, onShowModuleNotice }) => {
  const { theme, toggleTheme } = useTheme();

  // Current formatted date string
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-border bg-card/85 backdrop-blur-md transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Area: Mobile Trigger & Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open mobile navigation"
            className="md:hidden p-2 rounded-lg border border-border bg-background hover:bg-secondary text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm sm:text-base font-bold text-foreground leading-tight">
              Employee Dashboard
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{todayFormatted}</span>
              <span className="opacity-50">&bull;</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Active Workday
              </span>
            </div>
          </div>
        </div>

        {/* Right Area: Notifications, Theme Toggle & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Popover */}
          <NotificationPopover />

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            leftIcon={theme === 'dark' ? Sun : Moon}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          />

          {/* User Profile Menu */}
          <UserMenu onShowModuleNotice={onShowModuleNotice} />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
