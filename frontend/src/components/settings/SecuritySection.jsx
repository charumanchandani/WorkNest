import React from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import PasswordChangeForm from './PasswordChangeForm';
import { Badge } from '../ui';

export const SecuritySection = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Security & Authentication</h2>
        <p className="text-xs text-muted-foreground">
          Manage your credentials, password security, and active session protection.
        </p>
      </div>

      {/* Password Change Form */}
      <PasswordChangeForm />

      {/* Security Status Overview Card */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-foreground">Authentication & Session Security</h3>
          </div>
          <Badge variant="success" size="sm">
            Protected
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Session Mechanism
            </span>
            <span className="font-semibold text-foreground block">
              HttpOnly Secure JWT Cookie
            </span>
            <span className="text-[10px] text-muted-foreground">
              Protects against Cross-Site Scripting (XSS) token theft
            </span>
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Access Authorization
            </span>
            <span className="font-semibold text-foreground block">
              Role-Based Access Control ({user?.role})
            </span>
            <span className="text-[10px] text-muted-foreground">
              Strictly enforced on every backend API route
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/50 text-xs text-teal-800 dark:text-teal-200 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>
            Your account is safeguarded by bcrypt password hashing and token-based state validation. If you suspect unauthorized activity, change your password immediately.
          </span>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
