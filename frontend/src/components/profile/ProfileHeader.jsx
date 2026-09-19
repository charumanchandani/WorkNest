import React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
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

export const ProfileHeader = ({ user }) => {
  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const isActive = user.status === 'ACTIVE' || user.isActive !== false;

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
      <div className="flex items-start md:items-center gap-4 min-w-0">
        {/* Large Initials Avatar */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-sm border-2 border-white/20">
          {initials}
        </div>

        {/* User Identity Details */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {user.name}
            </h1>
            <Badge variant={getRoleBadgeVariant(user.role)} size="md">
              {user.role}
            </Badge>
            <Badge variant={isActive ? 'success' : 'neutral'} size="md">
              {isActive ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Account
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Inactive
                </span>
              )}
            </Badge>
          </div>

          <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span>{user.jobTitle || 'Team Member'}</span>
            {user.department && (
              <>
                <span>•</span>
                <span className="text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {user.department.name || user.department}
                </span>
              </>
            )}
            <span>•</span>
            <span className="font-mono text-xs text-muted-foreground">{user.employeeId}</span>
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              {user.email}
            </span>
            {user.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {user.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {user.location || 'Remote'}
            </span>
            {user.joiningDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Joined {formatDate(user.joiningDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
