import React from 'react';
import {
  Calendar,
  Clock,
  Eye,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Palmtree,
  Coffee,
  HeartPulse,
} from 'lucide-react';
import { Badge, Button, Select } from '../ui';

export const LeaveHistoryTable = ({
  records = [],
  pagination = { page: 1, totalPages: 1, total: 0 },
  statusFilter = 'ALL',
  onStatusChange,
  typeFilter = 'ALL',
  onTypeChange,
  fromDate = '',
  onFromChange,
  toDate = '',
  onToChange,
  onPageChange,
  onResetFilters,
  onViewDetails,
  onCancelRequest,
  loading = false,
}) => {
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const typeOptions = [
    { value: 'ALL', label: 'All Leave Types' },
    { value: 'ANNUAL', label: 'Annual Leave' },
    { value: 'CASUAL', label: 'Casual Leave' },
    { value: 'SICK', label: 'Sick Leave' },
    { value: 'UNPAID', label: 'Unpaid Leave' },
  ];

  const hasActiveFilters = Boolean(
    (statusFilter && statusFilter !== 'ALL') ||
      (typeFilter && typeFilter !== 'ALL') ||
      fromDate ||
      toDate
  );

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
      {/* Table & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60">
        <div>
          <h2 className="text-sm font-bold text-foreground">Leave Requests History</h2>
          <p className="text-xs text-muted-foreground">
            Track status, review decisions, and time-off requests
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-32">
            <Select
              id="history-type-filter"
              options={typeOptions}
              value={typeFilter || 'ALL'}
              onChange={(e) => onTypeChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by leave type"
            />
          </div>

          <div className="w-32">
            <Select
              id="history-status-filter"
              options={statusOptions}
              value={statusFilter || 'ALL'}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by leave status"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromChange(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              title="From date"
              aria-label="Filter from date"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToChange(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              title="To date"
              aria-label="Filter to date"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={X}
              onClick={onResetFilters}
              className="text-xs text-muted-foreground hover:text-foreground py-1"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-subtle">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              <th scope="col" className="py-3.5 px-4">Leave Type</th>
              <th scope="col" className="py-3.5 px-4">Duration Range</th>
              <th scope="col" className="py-3.5 px-4">Working Days</th>
              <th scope="col" className="py-3.5 px-4">Reason / Notes</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-xs text-muted-foreground">
                  No leave requests found for the selected criteria.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    {getTypeBadge(r.leaveType)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {formatDate(r.startDate)} &rarr; {formatDate(r.endDate)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {r.totalDays} day{r.totalDays === 1 ? '' : 's'}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-muted-foreground">
                    {r.reason}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(r.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Eye}
                        onClick={() => onViewDetails(r)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Details
                      </Button>

                      {r.status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={XCircle}
                          onClick={() => onCancelRequest(r)}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2.5">
        {records.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-border rounded-xl bg-card">
            No leave requests found for the selected criteria.
          </div>
        ) : (
          records.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl border border-border bg-card shadow-subtle space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeBadge(r.leaveType)}
                  <span className="font-bold text-foreground font-mono">
                    {r.totalDays} day{r.totalDays === 1 ? '' : 's'}
                  </span>
                </div>
                {getStatusBadge(r.status)}
              </div>

              <div className="text-muted-foreground text-[11px]">
                <span>{formatDate(r.startDate)} &rarr; {formatDate(r.endDate)}</span>
              </div>

              <p className="text-muted-foreground italic truncate text-[11px] pt-1 border-t border-border/60">
                &ldquo;{r.reason}&rdquo;
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Eye}
                  onClick={() => onViewDetails(r)}
                  className="text-xs"
                >
                  View Details
                </Button>

                {r.status === 'PENDING' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={XCircle}
                    onClick={() => onCancelRequest(r)}
                    className="text-xs text-rose-600 hover:text-rose-700"
                  >
                    Cancel
                  </Button>
                )}
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

export default LeaveHistoryTable;
