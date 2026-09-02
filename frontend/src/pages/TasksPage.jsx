import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ListTodo } from 'lucide-react';
import { Button, Alert, Spinner } from '../components/ui';
import {
  TaskSummaryCards,
  TaskFilterBar,
  TaskTable,
  TaskStatusModal,
  TaskDetailModal,
} from '../components/tasks';
import taskService from '../services/taskService';

export const TasksPage = () => {
  // State
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals state
  const [statusTask, setStatusTask] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [dueDate, setDueDate] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch personal tasks
  const fetchMyTasks = useCallback(async () => {
    try {
      setLoading(true);
      setPageError('');
      const res = await taskService.getMyTasks({
        page,
        limit: 20,
        search: debouncedSearch,
        status,
        priority,
        dueDate,
      });

      if (res?.data) {
        setRecords(res.data.records || []);
        setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      setPageError(err.formattedMessage || 'Failed to load assigned tasks.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, priority, dueDate]);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  // Update Status Handler
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      setModalError('');
      await taskService.updateTaskStatus(taskId, newStatus);
      setIsStatusModalOpen(false);
      setStatusTask(null);
      setSuccessMessage('Task status updated successfully.');
      fetchMyTasks();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update task status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('ALL');
    setPriority('ALL');
    setDueDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              My Tasks &amp; Assignments
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track your assigned workplace deliverables, priority queue, and deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={fetchMyTasks}
            disabled={loading}
            aria-label="Refresh tasks list"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <Alert
          variant="success"
          title="Status Updated"
          onDismiss={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* Page Error Banner */}
      {pageError && (
        <Alert
          variant="destructive"
          title="Error Loading Tasks"
          onDismiss={() => setPageError('')}
        >
          {pageError}
        </Alert>
      )}

      {/* 2. Personal Task Summary Cards */}
      <TaskSummaryCards summary={summary} />

      {/* 3. Task Filter Bar */}
      <TaskFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        priority={priority}
        onPriorityChange={(p) => {
          setPriority(p);
          setPage(1);
        }}
        dueDate={dueDate}
        onDueDateChange={(d) => {
          setDueDate(d);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Task Table / Cards */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Spinner size="lg" label="Loading assigned tasks..." />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            Fetching your task assignments...
          </p>
        </div>
      ) : (
        <TaskTable
          records={records}
          pagination={pagination}
          onPageChange={setPage}
          onViewDetails={(t) => {
            setDetailTask(t);
            setIsDetailModalOpen(true);
          }}
          onUpdateStatus={(t) => {
            setStatusTask(t);
            setIsStatusModalOpen(true);
          }}
          loading={loading}
        />
      )}

      {/* Status Update Modal */}
      <TaskStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTask(null);
        }}
        task={statusTask}
        onUpdateStatus={handleUpdateStatus}
        isSubmitting={isUpdatingStatus}
        error={modalError}
        onClearError={() => setModalError('')}
      />

      {/* Task Details Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailTask(null);
        }}
        task={detailTask}
        onOpenStatusModal={(t) => {
          setIsDetailModalOpen(false);
          setStatusTask(t);
          setIsStatusModalOpen(true);
        }}
      />
    </div>
  );
};

export default TasksPage;
