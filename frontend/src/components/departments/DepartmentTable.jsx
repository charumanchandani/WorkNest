import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Users,
  UserCheck,
  UserX,
  Building2,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { Badge, Button } from '../ui';

export const DepartmentTable = ({
  departments = [],
  onEdit,
  onToggleStatus,
  onAssignManager,
  canManage = false,
}) => {
  const getStatusBadge = (status) => {
    const isAct = status === 'ACTIVE';
    return (
      <Badge variant={isAct ? 'success' : 'outline'} size="sm" dot={isAct}>
        {isAct ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-subtle">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              <th scope="col" className="py-3.5 px-4">Department</th>
              <th scope="col" className="py-3.5 px-4">Code</th>
              <th scope="col" className="py-3.5 px-4">Department Manager</th>
              <th scope="col" className="py-3.5 px-4">Active Staff</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {departments.map((dept) => (
              <tr
                key={dept.id}
                className="hover:bg-secondary/30 transition-colors group"
              >
                {/* Department Info */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-border shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/app/departments/${dept.id}`}
                        className="font-semibold text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors block truncate"
                      >
                        {dept.name}
                      </Link>
                      <span className="text-[11px] text-muted-foreground block truncate max-w-xs">
                        {dept.description || 'No description provided.'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Code */}
                <td className="py-3.5 px-4">
                  <Badge variant="outline" size="sm" className="font-mono font-bold">
                    {dept.code}
                  </Badge>
                </td>

                {/* Manager */}
                <td className="py-3.5 px-4">
                  {dept.manager?.name ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground shrink-0 border border-border">
                        {dept.manager.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-foreground block truncate">
                          {dept.manager.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {dept.manager.role}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-[11px]">
                      Unassigned
                    </span>
                  )}
                </td>

                {/* Employee Count */}
                <td className="py-3.5 px-4">
                  <Link
                    to={`/app/employees?department=${dept.id}`}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/70 hover:bg-secondary text-foreground hover:text-teal-600 transition-colors"
                    title="Filter employees by this department"
                  >
                    <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="font-semibold">{dept.employeeCount}</span>
                    <span className="text-muted-foreground text-[11px]">members</span>
                  </Link>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4">
                  {getStatusBadge(dept.status)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/app/departments/${dept.id}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`View details of ${dept.name}`}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => onAssignManager(dept)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Assign manager for ${dept.name}`}
                          title="Assign Manager"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(dept)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Edit ${dept.name}`}
                          title="Edit Department"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleStatus(dept)}
                          className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            dept.status === 'ACTIVE'
                              ? 'text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                          aria-label={dept.status === 'ACTIVE' ? `Deactivate ${dept.name}` : `Activate ${dept.name}`}
                          title={dept.status === 'ACTIVE' ? 'Deactivate Department' : 'Activate Department'}
                        >
                          {dept.status === 'ACTIVE' ? (
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

      {/* 2. Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-sm flex items-center justify-center border border-border shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <Link
                    to={`/app/departments/${dept.id}`}
                    className="font-bold text-sm text-foreground hover:text-teal-600 transition-colors block"
                  >
                    {dept.name}
                  </Link>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    [{dept.code}]
                  </span>
                </div>
              </div>

              {getStatusBadge(dept.status)}
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {dept.description || 'No description provided.'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground/80 block">
                  Department Lead
                </span>
                <span className="font-medium text-foreground truncate block">
                  {dept.manager?.name || 'Unassigned'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground/80 block">
                  Assigned Staff
                </span>
                <span className="font-semibold text-foreground">
                  {dept.employeeCount} active members
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
              <Link
                to={`/app/departments/${dept.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </Link>

              {canManage && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Edit2}
                    onClick={() => onEdit(dept)}
                    className="text-xs py-1"
                  >
                    Edit
                  </Button>

                  <Button
                    variant={dept.status === 'ACTIVE' ? 'destructive' : 'outline'}
                    size="sm"
                    leftIcon={dept.status === 'ACTIVE' ? UserX : UserCheck}
                    onClick={() => onToggleStatus(dept)}
                    className="text-xs py-1"
                  >
                    {dept.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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

export default DepartmentTable;
