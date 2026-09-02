import React from 'react';
import {
  Calendar,
  LogIn,
  LogOut,
  Clock,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge, Button, Select, Input } from '../ui';

export const AttendanceHistoryTable = ({
  records = [],
  pagination = { page: 1, totalPages: 1, total: 0 },
  statusFilter = 'ALL',
  onStatusChange,
  fromDate = '',
  onFromChange,
  toDate = '',
  onToChange,
  onPageChange,
  onResetFilters,
  loading = false,
}) => {
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PRESENT', label: 'Present' },
    { value: 'LATE', label: 'Late' },
    { value: 'HALF_DAY', label: 'Half Day' },
    { value: 'ON_LEAVE', label: 'On Leave' },
  ];

  const hasActiveFilters = Boolean(
    (statusFilter && statusFilter !== 'ALL') || fromDate || toDate
  );

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(isoString));
    } catch {
      return '—';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const formatHours = (minutes) => {
    if (!minutes || minutes <= 0) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="success" size="sm" dot>Present</Badge>;
      case 'LATE':
        return <Badge variant="warning" size="sm" dot>Late</Badge>;
      case 'HALF_DAY':
        return <Badge variant="primary" size="sm" dot>Half Day</Badge>;
      case 'ON_LEAVE':
        return <Badge variant="outline" size="sm">On Leave</Badge>;
      case 'ABSENT':
        return <Badge variant="destructive" size="sm" dot>Absent</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Table & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60">
        <div>
          <h2 className="text-sm font-bold text-foreground">Attendance History</h2>
          <p className="text-xs text-muted-foreground">
            Complete timeline of daily check-ins and working durations
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-32">
            <Select
              id="history-status-filter"
              options={statusOptions}
              value={statusFilter || 'ALL'}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by attendance status"
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

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-subtle">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              <th scope="col" className="py-3.5 px-4">Date</th>
              <th scope="col" className="py-3.5 px-4">Check-In Time</th>
              <th scope="col" className="py-3.5 px-4">Check-Out Time</th>
              <th scope="col" className="py-3.5 px-4">Logged Duration</th>
              <th scope="col" className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-xs text-muted-foreground">
                  No attendance records found for the selected criteria.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {formatDate(r.date)}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={r.checkIn ? 'text-foreground' : 'text-muted-foreground'}>
                      {formatTime(r.checkIn)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={r.checkOut ? 'text-foreground' : 'text-muted-foreground'}>
                      {formatTime(r.checkOut)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                    {formatHours(r.totalMinutes)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge(r.status)}
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
            No attendance records found for the selected criteria.
          </div>
        ) : (
          records.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl border border-border bg-card shadow-subtle space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{formatDate(r.date)}</span>
                {getStatusBadge(r.status)}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/60 text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">In</span>
                  <span className="font-mono text-foreground">{formatTime(r.checkIn)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Out</span>
                  <span className="font-mono text-foreground">{formatTime(r.checkOut)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Duration</span>
                  <span className="font-mono font-bold text-foreground">{formatHours(r.totalMinutes)}</span>
                </div>
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

export default AttendanceHistoryTable;
