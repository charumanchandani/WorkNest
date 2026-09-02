import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, Calendar, CheckSquare } from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Alert, Spinner, Badge } from '../components/ui';
import {
  LeaveFilterBar,
  LeaveManagementTable,
  LeaveReviewModal,
  LeaveDetailModal,
} from '../components/leave';
import leaveService from '../services/leaveService';

export const LeaveManagePage = () => {
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
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [pageError, setPageError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [reviewLeave, setReviewLeave] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [detailLeave, setDetailLeave] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [leaveType, setLeaveType] = useState('ALL');
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

  // Fetch management leave requests
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setPageError('');
      const res = await leaveService.getManageLeaves({
        page,
        limit: 20,
        search: debouncedSearch,
        department,
        leaveType,
        status,
        from: fromDate,
        to: toDate,
      });

      if (res?.data) {
        setRecords(res.data.records || []);
        setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setPageError(err.formattedMessage || 'Failed to load leave management requests.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, department, leaveType, status, fromDate, toDate]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Review handlers
  const handleApprove = async (id, reviewComment) => {
    try {
      setIsSubmittingReview(true);
      setReviewError('');
      await leaveService.approveLeave(id, reviewComment);
      setIsReviewModalOpen(false);
      setReviewLeave(null);
      setSuccessMessage('Leave request approved successfully and employee balance updated.');
      fetchLeaves();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setReviewError(err.formattedMessage || 'Failed to approve leave request.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReject = async (id, reviewComment) => {
    try {
      setIsSubmittingReview(true);
      setReviewError('');
      await leaveService.rejectLeave(id, reviewComment);
      setIsReviewModalOpen(false);
      setReviewLeave(null);
      setSuccessMessage('Leave request rejected.');
      fetchLeaves();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setReviewError(err.formattedMessage || 'Failed to reject leave request.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDepartment('ALL');
    setLeaveType('ALL');
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
              Leave Approvals &amp; Management
            </h1>
            <Badge variant="primary" size="md">
              {pagination.total} Records
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isAdmin
              ? 'Review, approve, or reject employee leave and time-off requests across the organization.'
              : 'Review, approve, or reject leave requests for your managed department staff.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={fetchLeaves}
            disabled={loading}
            aria-label="Refresh leave requests"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <Alert
          variant="success"
          title="Review Completed"
          onDismiss={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* Page Error Banner */}
      {pageError && (
        <Alert
          variant="destructive"
          title="Error Loading Requests"
          onDismiss={() => setPageError('')}
        >
          {pageError}
        </Alert>
      )}

      {/* 2. Filter Bar */}
      <LeaveFilterBar
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={(d) => {
          setDepartment(d);
          setPage(1);
        }}
        leaveType={leaveType}
        onTypeChange={(t) => {
          setLeaveType(t);
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
          <Spinner size="lg" label="Loading leave review queue..." />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            Fetching employee leave requests...
          </p>
        </div>
      ) : (
        <LeaveManagementTable
          records={records}
          pagination={pagination}
          onPageChange={setPage}
          onReview={(r) => {
            setReviewLeave(r);
            setIsReviewModalOpen(true);
          }}
          onViewDetails={(r) => {
            setDetailLeave(r);
            setIsDetailModalOpen(true);
          }}
          loading={loading}
        />
      )}

      {/* Review Modal */}
      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewLeave(null);
        }}
        leave={reviewLeave}
        onApprove={handleApprove}
        onReject={handleReject}
        isSubmitting={isSubmittingReview}
        error={reviewError}
        onClearError={() => setReviewError('')}
      />

      {/* Detail Modal */}
      <LeaveDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailLeave(null);
        }}
        leave={detailLeave}
      />
    </div>
  );
};

export default LeaveManagePage;
