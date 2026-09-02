import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, Alert, Spinner } from '../components/ui';
import {
  TodayAttendanceCard,
  MonthlySummaryCards,
  AttendanceHistoryTable,
} from '../components/attendance';
import attendanceService from '../services/attendanceService';

export const AttendancePage = () => {

  // State
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [summary, setSummary] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [actionError, setActionError] = useState('');
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // History Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [historyStatus, setHistoryStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  // Fetch today's status & summary
  const fetchTodayAndSummary = useCallback(async () => {
    try {
      const [todayRes, summaryRes] = await Promise.all([
        attendanceService.getTodayAttendance(),
        attendanceService.getMySummary(selectedMonth),
      ]);

      if (todayRes?.data?.attendance) {
        setTodayAttendance(todayRes.data.attendance);
      }
      if (summaryRes?.data?.summary) {
        setSummary(summaryRes.data.summary);
      }
    } catch (err) {
      setPageError(err.formattedMessage || 'Failed to fetch attendance summary.');
    }
  }, [selectedMonth]);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await attendanceService.getMyAttendance({
        page,
        limit: 20,
        status: historyStatus,
        from: fromDate,
        to: toDate,
      });

      if (res?.data) {
        setHistoryRecords(res.data.records || []);
        setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setPageError(err.formattedMessage || 'Failed to load attendance history.');
    }
  }, [page, historyStatus, fromDate, toDate]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setPageError('');
      await Promise.all([fetchTodayAndSummary(), fetchHistory()]);
      setLoading(false);
    };

    loadAll();
  }, [fetchTodayAndSummary, fetchHistory]);

  // Handlers for Check-In & Check-Out
  const handleCheckIn = async () => {
    try {
      setIsMutating(true);
      setActionError('');
      const res = await attendanceService.checkIn();
      if (res?.data?.attendance) {
        setTodayAttendance(res.data.attendance);
        setSuccessMessage('Successfully checked in for today!');
      }
      fetchTodayAndSummary();
      fetchHistory();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setActionError(err.formattedMessage || 'Failed to check in.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsMutating(true);
      setActionError('');
      const res = await attendanceService.checkOut();
      if (res?.data?.attendance) {
        setTodayAttendance(res.data.attendance);
        setSuccessMessage('Successfully checked out. Great work today!');
      }
      fetchTodayAndSummary();
      fetchHistory();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setActionError(err.formattedMessage || 'Failed to check out.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleResetFilters = () => {
    setHistoryStatus('ALL');
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
              My Attendance
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track daily check-in, review shift logs, and view monthly working hours.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => {
              fetchTodayAndSummary();
              fetchHistory();
            }}
            disabled={loading || isMutating}
            aria-label="Refresh attendance"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <Alert
          variant="success"
          title="Attendance Logged"
          onDismiss={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* Page Error Banner */}
      {pageError && (
        <Alert
          variant="destructive"
          title="Error Loading Attendance"
          onDismiss={() => setPageError('')}
        >
          {pageError}
        </Alert>
      )}

      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Spinner size="lg" label="Loading attendance dashboard..." />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            Fetching today's status and working records...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 2. Today's Check-In / Check-Out Card */}
          <TodayAttendanceCard
            attendance={todayAttendance}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            isMutating={isMutating}
            error={actionError}
            onClearError={() => setActionError('')}
          />

          {/* 3. Monthly Metrics Summary */}
          <MonthlySummaryCards
            summary={summary}
            selectedMonth={selectedMonth}
            onMonthChange={(m) => {
              setSelectedMonth(m);
            }}
          />

          {/* 4. History Table */}
          <AttendanceHistoryTable
            records={historyRecords}
            pagination={pagination}
            statusFilter={historyStatus}
            onStatusChange={(s) => {
              setHistoryStatus(s);
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
            onPageChange={setPage}
            onResetFilters={handleResetFilters}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
