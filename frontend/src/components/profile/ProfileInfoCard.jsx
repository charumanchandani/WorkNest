import React from 'react';
import {
  Building2,
  Calendar,
  Shield,
  Briefcase,
  Hash,
  Mail,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';
import { Badge } from '../ui';
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

export const ProfileInfoCard = ({ user }) => {
  if (!user) return null;

  const isActive = user.status === 'ACTIVE' || user.isActive !== false;

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-subtle space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Organizational Employment Record
          </h2>
          <p className="text-xs text-muted-foreground">
            Official enterprise credentials maintained by organization leadership.
          </p>
        </div>
        <Badge variant={isActive ? 'success' : 'neutral'} size="sm">
          {isActive ? 'Active Member' : 'Deactivated'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Employee ID */}
        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Employee ID
            </span>
          </div>
          <span className="font-mono text-sm font-bold text-foreground block">
            {user.employeeId || 'N/A'}
          </span>
          <p className="text-[10px] text-muted-foreground">Immutable company identifier</p>
        </div>

        {/* Role & Access Scope */}
        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              System Role
            </span>
            <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
              {user.role}
            </Badge>
          </div>
          <span className="text-xs font-semibold text-foreground block">
            {user.role === 'ADMIN'
              ? 'Full Organization Administration'
              : user.role === 'MANAGER'
              ? 'Department & Team Management'
              : 'Standard Staff Self-Service'}
          </span>
          <p className="text-[10px] text-muted-foreground">Access authorization level</p>
        </div>

        {/* Department */}
        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Department Assignment
            </span>
          </div>
          <span className="text-xs font-semibold text-foreground block">
            {user.department?.name || 'All Organization (Global)'}
          </span>
          <p className="text-[10px] text-muted-foreground">
            {user.department?.code ? `Code: ${user.department.code}` : 'Cross-departmental'}
          </p>
        </div>

        {/* Job Title */}
        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Official Job Designation
            </span>
          </div>
          <span className="text-xs font-semibold text-foreground block">
            {user.jobTitle || 'Associate'}
          </span>
          <p className="text-[10px] text-muted-foreground">Assigned title</p>
        </div>

        {/* Joining Date */}
        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Employment Start Date
            </span>
          </div>
          <span className="text-xs font-semibold text-foreground block">
            {user.joiningDate ? formatDate(user.joiningDate) : 'Not specified'}
          </span>
          <p className="text-[10px] text-muted-foreground">Recorded induction date</p>
        </div>

        {/* Account Email */}
        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Corporate Identity
            </span>
          </div>
          <span className="text-xs font-semibold text-foreground block truncate">
            {user.email}
          </span>
          <p className="text-[10px] text-muted-foreground">Primary SSO / Authentication address</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoCard;
