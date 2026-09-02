import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Building2,
  Eye,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge, Button } from '../ui';

export const LeaveManagementTable = ({
  records = [],
  pagination = { page: 1, totalPages: 1, total: 0 },
  onPageChange,
  onReview,
  onViewDetails,
  loading = false,
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" size="sm" dot>Pending Review</Badge>;
      case 'APPROVED':
        return <Badge variant="success" size="sm" dot>Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" size="sm" dot>Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'ANNUAL':
        return <Badge variant="success" size="sm">Annual</Badge>;
      case 'CASUAL':
        return <Badge variant="primary" size="sm">Casual</Badge>;
      case 'SICK':
        return <Badge variant="destructive" size="sm">Sick</Badge>;
      case 'UNPAID':
        return <Badge variant="warning" size="sm">Unpaid</Badge>;
      default:
        return <Badge variant="outline" size="sm">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-subtle">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              <th scope="col" className="py-3.5 px-4">Applicant</th>
              <th scope="col" className="py-3.5 px-4">Department</th>
              <th scope="col" className="py-3.5 px-4">Leave Type</th>
              <th scope="col" className="py-3.5 px-4">Dates</th>
              <th scope="col" className="py-3.5 px-4">Duration</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-xs text-muted-foreground">
                  No leave requests found matching the filter criteria.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                  {/* Applicant */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-border shrink-0">
                        {r.employee?.name ? r.employee.name.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div className="min-w-0">
                        {r.employee?.id ? (
                          <Link
                            to={`/app/employees/${r.employee.id}`}
                            className="font-semibold text-foreground hover:text-teal-600 transition-colors block truncate"
                          >
                            {r.employee.name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-foreground block truncate">
                            {r.employee?.name || 'Unknown'}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          {r.employee?.employeeId || r.employee?.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4">
                    {r.employee?.department?.name ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>{r.employee.department.name}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">{getTypeBadge(r.leaveType)}</td>

                  {/* Dates */}
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {formatDate(r.startDate)} &rarr; {formatDate(r.endDate)}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {r.totalDays} day{r.totalDays === 1 ? '' : 's'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'PENDING' && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={CheckSquare}
                          onClick={() => onReview(r)}
                          className="text-xs py-1"
                        >
                          Review
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Eye}
                        onClick={() => onViewDetails(r)}
                        className="text-xs text-muted-foreground hover:text-foreground py-1"
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-2.5">
        {records.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-border rounded-xl bg-card">
            No leave requests found matching the filter criteria.
          </div>
        ) : (
          records.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl border border-border bg-card shadow-subtle space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-border shrink-0">
                    {r.employee?.name ? r.employee.name.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">{r.employee?.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {r.employee?.employeeId || r.employee?.email}
                    </span>
                  </div>
                </div>

                {getStatusBadge(r.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Leave Type</span>
                  <div className="mt-0.5">{getTypeBadge(r.leaveType)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Duration</span>
                  <span className="font-bold text-foreground font-mono">{r.totalDays} working days</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">
                <span>{formatDate(r.startDate)} &rarr; {formatDate(r.endDate)}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                {r.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={CheckSquare}
                    onClick={() => onReview(r)}
                    className="text-xs"
                  >
                    Review
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Eye}
                  onClick={() => onViewDetails(r)}
                  className="text-xs"
                >
                  Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card text-xs text-muted-foreground">
          <div>
            Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
            <strong className="text-foreground">{pagination.totalPages}</strong> (
            {pagination.total} records)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={ChevronLeft}
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1 || loading}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              rightIcon={ChevronRight}
              onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementTable;
