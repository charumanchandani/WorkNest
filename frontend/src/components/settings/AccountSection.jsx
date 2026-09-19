import React from 'react';
import {
  User,
  Mail,
  Building2,
  Shield,
  Hash,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '../ui';
import { formatDate } from '../../utils/formatters';

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

export const AccountSection = ({ user }) => {
  if (!user) return null;

  const isActive = user.status === 'ACTIVE' || user.isActive !== false;

  return (
    <div className="space-y-6">
      {/* Account Overview Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Account Overview</h2>
        <p className="text-xs text-muted-foreground">
          View your enterprise identity, corporate assignment, and organizational status.
        </p>
      </div>

      {/* Primary Account Card */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-lg flex items-center justify-center shrink-0 border border-border">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{user.name}</h3>
                <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                  {user.role}
                </Badge>
                <Badge variant={isActive ? 'success' : 'neutral'} size="sm">
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>

          <Link to="/app/profile">
            <Button variant="outline" size="sm" className="text-xs">
              <User className="w-3.5 h-3.5 mr-1.5" />
              Edit Personal Profile
            </Button>
          </Link>
        </div>

        {/* Account Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Employee ID
            </span>
            <span className="font-mono font-semibold text-foreground block">{user.employeeId || 'N/A'}</span>
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Department
            </span>
            <span className="font-semibold text-foreground block">
              {user.department?.name || 'All Organization'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Job Designation
            </span>
            <span className="font-semibold text-foreground block">{user.jobTitle || 'Associate'}</span>
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Induction Date
            </span>
            <span className="font-semibold text-foreground block">
              {user.joiningDate ? formatDate(user.joiningDate) : 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Corporate Email Notice */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-subtle space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          Workplace Email Address
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your email address (<strong className="text-foreground">{user.email}</strong>) is your primary Single Sign-On and enterprise notification address. To prevent authentication disruption, email changes require IT administrator verification.
        </p>
      </div>

      {/* Account Deactivation / Administration Notice */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-subtle space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          Account Lifecycle & Deactivation
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          WorkNest operates under organization-managed account policies. If you are departing the organization or require temporary account deactivation, please contact your human resources or system administrator.
        </p>
      </div>
    </div>
  );
};

export default AccountSection;
