import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Badge } from '../ui';

export const UserMenu = ({ onShowModuleNotice }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

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

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePlaceholderClick = (moduleName, phase) => {
    setIsOpen(false);
    if (onShowModuleNotice) {
      onShowModuleNotice(moduleName, phase);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User profile menu"
        className="flex items-center gap-2 p-1.5 rounded-lg border border-border bg-background hover:bg-secondary/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none"
      >
        <div className="w-7 h-7 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-border">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="text-xs font-semibold text-foreground hidden sm:inline max-w-[120px] truncate">
          {user?.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="User Account Options"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card text-card-foreground shadow-dialog z-50 p-1.5 space-y-1 animate-in zoom-in-95 duration-150"
        >
          {/* Identity Header */}
          <div className="p-3 border-b border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground truncate block">
                {user?.name}
              </span>
              <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
                {user?.role}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground truncate block">
              {user?.email}
            </span>
          </div>

          {/* Role Indicator Info */}
          <div className="px-3 py-1.5 flex items-center gap-2 text-[11px] text-muted-foreground bg-secondary/30 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Role-Based Access: {user?.role}</span>
          </div>

          {/* Menu Options */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handlePlaceholderClick('My Profile', 'Phase 14')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Profile Information</span>
            </div>
            <span className="text-[10px] text-muted-foreground/80 font-mono">Phase 14</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => handlePlaceholderClick('Settings', 'Phase 14')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Account Settings</span>
            </div>
            <span className="text-[10px] text-muted-foreground/80 font-mono">Phase 14</span>
          </button>

          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span>Public Landing Page</span>
            </div>
          </Link>

          {/* Sign Out Action */}
          <div className="pt-1 border-t border-border">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
