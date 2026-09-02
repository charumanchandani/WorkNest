import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, UserCheck, UserX, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { Badge, Button } from '../ui';

export const EmployeeTable = ({
  employees = [],
  onEdit,
  onToggleStatus,
  canManage = false,
}) => {
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

  const getStatusBadge = (status) => {
    const isAct = status === 'ACTIVE';
    return (
      <Badge variant={isAct ? 'success' : 'outline'} size="sm" dot={isAct}>
        {isAct ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Desktop Table View (Hidden on mobile / tablet < md) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-subtle">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              <th scope="col" className="py-3.5 px-4">Employee</th>
              <th scope="col" className="py-3.5 px-4">Employee ID</th>
              <th scope="col" className="py-3.5 px-4">Role</th>
              <th scope="col" className="py-3.5 px-4">Job Title</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4">Joining Date</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-secondary/30 transition-colors group"
              >
                {/* Employee info */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-border shrink-0">
                      {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/app/employees/${emp.id}`}
                        className="font-semibold text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors block truncate"
                      >
                        {emp.name}
                      </Link>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {emp.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Employee ID */}
                <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                  {emp.employeeId || '—'}
                </td>

                {/* Role Badge */}
                <td className="py-3.5 px-4">
                  <Badge variant={getRoleBadgeVariant(emp.role)} size="sm">
                    {emp.role}
                  </Badge>
                </td>

                {/* Job Title & Location */}
                <td className="py-3.5 px-4">
                  <span className="font-medium text-foreground block truncate max-w-[180px]">
                    {emp.jobTitle}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    {emp.location || 'Remote'}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4">
                  {getStatusBadge(emp.status)}
                </td>

                {/* Joining Date */}
                <td className="py-3.5 px-4 text-muted-foreground">
                  {formatDate(emp.joiningDate)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/app/employees/${emp.id}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`View details of ${emp.name}`}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(emp)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Edit ${emp.name}`}
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleStatus(emp)}
                          className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            emp.status === 'ACTIVE'
                              ? 'text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                          aria-label={emp.status === 'ACTIVE' ? `Deactivate ${emp.name}` : `Activate ${emp.name}`}
                          title={emp.status === 'ACTIVE' ? 'Deactivate Employee' : 'Activate Employee'}
                        >
                          {emp.status === 'ACTIVE' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card List View (Visible on mobile / tablet < md) */}
      <div className="md:hidden space-y-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-sm flex items-center justify-center border border-border shrink-0">
                  {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                </div>
                <div>
                  <Link
                    to={`/app/employees/${emp.id}`}
                    className="font-bold text-sm text-foreground hover:text-teal-600 transition-colors block"
                  >
                    {emp.name}
                  </Link>
                  <span className="text-xs text-muted-foreground font-mono">
                    {emp.employeeId || '—'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge variant={getRoleBadgeVariant(emp.role)} size="sm">
                  {emp.role}
                </Badge>
                {getStatusBadge(emp.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground/80 block">
                  Job Title
                </span>
                <span className="font-medium text-foreground truncate block">
                  {emp.jobTitle}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground/80 block">
                  Joined
                </span>
                <span className="text-foreground">
                  {formatDate(emp.joiningDate)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
              <Link
                to={`/app/employees/${emp.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Profile</span>
              </Link>

              {canManage && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Edit2}
                    onClick={() => onEdit(emp)}
                    className="text-xs py-1"
                  >
                    Edit
                  </Button>

                  <Button
                    variant={emp.status === 'ACTIVE' ? 'destructive' : 'outline'}
                    size="sm"
                    leftIcon={emp.status === 'ACTIVE' ? UserX : UserCheck}
                    onClick={() => onToggleStatus(emp)}
                    className="text-xs py-1"
                  >
                    {emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTable;
