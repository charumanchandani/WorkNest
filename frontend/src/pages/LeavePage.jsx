import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button, Alert, Spinner } from '../components/ui';
import {
  LeaveBalanceCards,
  LeaveApplyModal,
  LeaveHistoryTable,
  LeaveDetailModal,
} from '../components/leave';
import leaveService from '../services/leaveService';

export const LeavePage = () => {
  // State
  const [balance, setBalance] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    try {
      const res = await leaveService.getMyBalance();
      if (res?.data?.balance) {
        setBalance(res.data.balance);
      }
    } catch (err) {
      setPageError(err.formattedMessage || 'Failed to fetch leave balance.');
    }
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await leaveService.getMyLeaves({
        page,
        limit: 20,
        status: statusFilter,
        leaveType: typeFilter,
        from: fromDate,
        to: toDate,
      });

      if (res?.data) {
        setRecords(res.data.records || []);
        setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setPageError(err.formattedMessage || 'Failed to load leave history.');
    }
  }, [page, statusFilter, typeFilter, fromDate, toDate]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setPageError('');
      await Promise.all([fetchBalance(), fetchHistory()]);
      setLoading(false);
    };

    loadAll();
  }, [fetchBalance, fetchHistory]);

  // Apply Leave Handler
  const handleApplyLeave = async (payload) => {
    try {
      setIsSubmitting(true);
      setModalError('');
      await leaveService.createLeave(payload);
      setIsApplyModalOpen(false);
      setSuccessMessage('Leave request submitted successfully for manager / admin review.');
      fetchBalance();
      fetchHistory();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Leave Handler
  const handleCancelLeave = async (leave) => {
    try {
      setIsCancelling(true);
      await leaveService.cancelLeave(leave.id);
      setIsDetailModalOpen(false);
      setSuccessMessage('Leave request cancelled successfully.');
      fetchBalance();
      fetchHistory();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setPageError(err.formattedMessage || 'Failed to cancel leave request.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Apply Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              My Leave &amp; Time Off
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View annual balance quotas, submit time-off requests, and track approval status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => {
              fetchBalance();
              fetchHistory();
            }}
            disabled={loading}
            aria-label="Refresh leave data"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <Alert
          variant="success"
          title="Success"
          onDismiss={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* Page Error Banner */}
      {pageError && (
        <Alert
          variant="destructive"
          title="Error Loading Leave Data"
          onDismiss={() => setPageError('')}
        >
          {pageError}
        </Alert>
      )}

      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Spinner size="lg" label="Loading leave balances and history..." />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            Fetching time-off allocations and records...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 2. Leave Balance Cards */}
          <LeaveBalanceCards balance={balance} />

          {/* 3. Leave History Table */}
          <LeaveHistoryTable
            records={records}
            pagination={pagination}
            statusFilter={statusFilter}
            onStatusChange={(s) => {
              setStatusFilter(s);
              setPage(1);
            }}
            typeFilter={typeFilter}
            onTypeChange={(t) => {
              setTypeFilter(t);
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
            onViewDetails={(r) => {
              setSelectedLeave(r);
              setIsDetailModalOpen(true);
            }}
            onCancelRequest={handleCancelLeave}
            loading={loading}
          />
        </div>
      )}

      {/* Apply Leave Modal */}
      <LeaveApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmit={handleApplyLeave}
        balance={balance}
        isSubmitting={isSubmitting}
        error={modalError}
        onClearError={() => setModalError('')}
      />

      {/* Leave Detail Modal */}
      <LeaveDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        onCancelRequest={handleCancelLeave}
        isCancelling={isCancelling}
        isOwner
      />
    </div>
  );
};

export default LeavePage;
