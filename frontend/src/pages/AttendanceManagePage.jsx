import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, Calendar, Users, Clock } from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Alert, Spinner, Badge } from '../components/ui';
import {
  AttendanceFilterBar,
  AttendanceManagementTable,
} from '../components/attendance';
import attendanceService from '../services/attendanceService';

export const AttendanceManagePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch organization attendance
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await attendanceService.getAttendance({
        page,
        limit: 20,
        search: debouncedSearch,
        department,
        status,
        from: fromDate,
        to: toDate,
      });

      if (res?.data) {
        setRecords(res.data.records || []);
        setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.formattedMessage || 'Failed to load organization attendance records.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, department, status, fromDate, toDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDepartment('ALL');
    setStatus('ALL');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Attendance Monitoring
            </h1>
            <Badge variant="primary" size="md">
              {pagination.total} Records
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isAdmin
              ? 'Organization-wide employee attendance oversight and daily shift logs.'
              : 'Department workforce availability and attendance monitoring.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={fetchAttendance}
            disabled={loading}
            aria-label="Refresh attendance records"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <Alert
          variant="destructive"
          title="Error Loading Records"
          onDismiss={() => setError('')}
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchAttendance} className="ml-4">
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* 2. Filter Bar */}
      <AttendanceFilterBar
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={(d) => {
          setDepartment(d);
          setPage(1);
        }}
        status={status}
        onStatusChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        fromDate={fromDate}
        onFromChange={(f) => {
          setFromDate(f);
          setPage(1);
        }}
        toDate={toDate}
        onToChange={(t) => {
          setToDate(t);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* 3. Main Content Table */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Spinner size="lg" label="Loading attendance logs..." />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            Fetching organization attendance records...
          </p>
        </div>
      ) : (
        <AttendanceManagementTable
          records={records}
          pagination={pagination}
          onPageChange={setPage}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AttendanceManagePage;
