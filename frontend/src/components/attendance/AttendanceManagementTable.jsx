import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge, Button } from '../ui';

export const AttendanceManagementTable = ({
  records = [],
  pagination = { page: 1, totalPages: 1, total: 0 },
  onPageChange,
  loading = false,
}) => {
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
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-subtle">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              <th scope="col" className="py-3.5 px-4">Employee</th>
              <th scope="col" className="py-3.5 px-4">Department</th>
              <th scope="col" className="py-3.5 px-4">Date</th>
              <th scope="col" className="py-3.5 px-4">Check-In</th>
              <th scope="col" className="py-3.5 px-4">Check-Out</th>
              <th scope="col" className="py-3.5 px-4">Worked Time</th>
              <th scope="col" className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-xs text-muted-foreground">
                  No attendance records found matching the filter criteria.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                  {/* Employee */}
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

                  {/* Date */}
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {formatDate(r.date)}
                  </td>

                  {/* Check-In */}
                  <td className="py-3.5 px-4 font-mono">
                    <span className={r.checkIn ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                      {formatTime(r.checkIn)}
                    </span>
                  </td>

                  {/* Check-Out */}
                  <td className="py-3.5 px-4 font-mono">
                    <span className={r.checkOut ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                      {formatTime(r.checkOut)}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                    {formatHours(r.totalMinutes)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge(r.status)}
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
            No attendance records found matching the filter criteria.
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

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/60 text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Date</span>
                  <span className="text-foreground">{formatDate(r.date)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Check-In</span>
                  <span className="font-mono text-foreground">{formatTime(r.checkIn)}</span>
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

export default AttendanceManagementTable;
