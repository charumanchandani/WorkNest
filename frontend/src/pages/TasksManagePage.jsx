import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Layers } from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Alert, Spinner, Badge } from '../components/ui';
import {
  TaskSummaryCards,
  TaskFilterBar,
  TaskTable,
  TaskFormModal,
  TaskStatusModal,
  TaskDetailModal,
} from '../components/tasks';
import taskService from '../services/taskService';

export const TasksManagePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusTask, setStatusTask] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
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

  // Fetch management tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setPageError('');
      const res = await taskService.getTasks({
        page,
        limit: 20,
        search: debouncedSearch,
        status,
        priority,
        department,
        dueDate,
      });

      if (res?.data) {
        setRecords(res.data.records || []);
        setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      setPageError(err.formattedMessage || 'Failed to load task workload records.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, priority, department, dueDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create Task Handler
  const handleCreateTask = async (payload) => {
    try {
      setIsSubmitting(true);
      setModalError('');
      await taskService.createTask(payload);
      setIsCreateModalOpen(false);
      setSuccessMessage('Task created and assigned successfully.');
      fetchTasks();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Task Handler
  const handleEditTask = async (payload) => {
    try {
      setIsSubmitting(true);
      setModalError('');
      await taskService.updateTask(editTask.id, payload);
      setEditTask(null);
      setSuccessMessage('Task details updated successfully.');
      fetchTasks();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Status Handler
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setIsSubmitting(true);
      setModalError('');
      await taskService.updateTaskStatus(taskId, newStatus);
      setIsStatusModalOpen(false);
      setStatusTask(null);
      setSuccessMessage('Task status updated successfully.');
      fetchTasks();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update task status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('ALL');
    setPriority('ALL');
    setDepartment('ALL');
    setDueDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Create Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Task Management &amp; Workload
            </h1>
            <Badge variant="primary" size="md">
              {pagination.total} Tasks
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isAdmin
              ? 'Assign, monitor, and manage workplace tasks organization-wide.'
              : 'Assign, monitor, and manage deliverables for your department staff.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={fetchTasks}
            disabled={loading}
            aria-label="Refresh tasks"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Task
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
          title="Error Loading Tasks"
          onDismiss={() => setPageError('')}
        >
          {pageError}
        </Alert>
      )}

      {/* 2. Workload Summary Metrics */}
      <TaskSummaryCards summary={summary} isManagement />

      {/* 3. Filter Bar */}
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
        department={department}
        onDepartmentChange={(d) => {
          setDepartment(d);
          setPage(1);
        }}
        dueDate={dueDate}
        onDueDateChange={(d) => {
          setDueDate(d);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        isManagement
      />

      {/* 4. Task Management Table */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Spinner size="lg" label="Loading tasks workload..." />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            Fetching organization task records...
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
          onEditTask={(t) => setEditTask(t)}
          isManagement
          loading={loading}
        />
      )}

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        isSubmitting={isSubmitting}
        error={modalError}
        onClearError={() => setModalError('')}
      />

      {/* Edit Task Modal */}
      <TaskFormModal
        isOpen={Boolean(editTask)}
        onClose={() => setEditTask(null)}
        task={editTask}
        onSubmit={handleEditTask}
        isSubmitting={isSubmitting}
        error={modalError}
        onClearError={() => setModalError('')}
      />

      {/* Status Update Modal */}
      <TaskStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTask(null);
        }}
        task={statusTask}
        onUpdateStatus={handleUpdateStatus}
        isSubmitting={isSubmitting}
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
        onEditTask={(t) => {
          setIsDetailModalOpen(false);
          setEditTask(t);
        }}
        isManagement
      />
    </div>
  );
};

export default TasksManagePage;
