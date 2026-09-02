import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Badge, Alert, Spinner } from '../components/ui';
import { TaskStatusModal, TaskFormModal } from '../components/tasks';
import taskService from '../services/taskService';

export const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalError, setModalError] = useState('');

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      setPageError('');
      const res = await taskService.getTaskById(id);
      if (res?.data?.task) {
        setTask(res.data.task);
      }
    } catch (err) {
      setPageError(err.formattedMessage || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setIsUpdating(true);
      setModalError('');
      const res = await taskService.updateTaskStatus(taskId, newStatus);
      if (res?.data?.task) {
        setTask(res.data.task);
      }
      setIsStatusModalOpen(false);
      setSuccessMessage('Task status updated successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update task status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditTask = async (payload) => {
    try {
      setIsUpdating(true);
      setModalError('');
      const res = await taskService.updateTask(id, payload);
      if (res?.data?.task) {
        setTask(res.data.task);
      }
      setIsEditModalOpen(false);
      setSuccessMessage('Task details updated successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update task details.');
    } finally {
      setIsUpdating(false);
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

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(isoStr));
    } catch {
      return isoStr;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive" size="md">Urgent Priority</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="md">High Priority</Badge>;
      case 'MEDIUM':
        return <Badge variant="primary" size="md">Medium Priority</Badge>;
      case 'LOW':
        return <Badge variant="outline" size="md">Low Priority</Badge>;
      default:
        return <Badge variant="outline" size="md">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TODO':
        return <Badge variant="outline" size="md" dot>To Do</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" size="md" dot>In Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" size="md" dot>Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" size="md">Cancelled</Badge>;
      default:
        return <Badge variant="outline" size="md">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            Back
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Task Details
              </h1>
              {task?.id && (
                <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                  #{task.id}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task && task.status !== 'CANCELLED' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={RefreshCw}
              onClick={() => setIsStatusModalOpen(true)}
            >
              Update Status
            </Button>
          )}

          {isManagerOrAdmin && task && task.status !== 'CANCELLED' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={Edit2}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Task
            </Button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <Alert variant="success" title="Success" onDismiss={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {pageError && (
        <Alert variant="destructive" title="Error" onDismiss={() => setPageError('')}>
          {pageError}
        </Alert>
      )}

      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Spinner size="lg" label="Loading task details..." />
        </div>
      ) : task ? (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-subtle space-y-6">
            {/* Status & Priority Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                {getPriorityBadge(task.priority)}
                {getStatusBadge(task.status)}
              </div>

              {task.isOverdue && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                  Overdue Deadline
                </span>
              )}
            </div>

            {/* Task Title & Description */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                {task.title}
              </h2>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                {task.description || (
                  <span className="italic text-muted-foreground">No description provided.</span>
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Assignee */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Assigned Employee
                </span>
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-border shrink-0">
                    {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">{task.assignedTo?.name}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {task.assignedTo?.employeeId || task.assignedTo?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigner */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Assigned By
                </span>
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold text-xs flex items-center justify-center border border-border shrink-0">
                    {task.assignedBy?.name ? task.assignedBy.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">{task.assignedBy?.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {task.assignedBy?.role || 'Administrator'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Department */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Department
                </span>
                <span className="font-bold text-foreground block">
                  {task.department?.name || 'Organization Wide'}
                </span>
              </div>

              {/* Due Date */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Due Date (Deadline)
                </span>
                <span className={`font-bold block ${task.isOverdue ? 'text-rose-600' : 'text-foreground'}`}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-border text-xs text-muted-foreground">
              <span>Created on {formatTimestamp(task.createdAt)}</span>
              {task.completedAt && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Finished on {formatTimestamp(task.completedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Status Modal */}
      <TaskStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        task={task}
        onUpdateStatus={handleUpdateStatus}
        isSubmitting={isUpdating}
        error={modalError}
        onClearError={() => setModalError('')}
      />

      {/* Edit Modal */}
      <TaskFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onSubmit={handleEditTask}
        isSubmitting={isUpdating}
        error={modalError}
        onClearError={() => setModalError('')}
      />
    </div>
  );
};

export default TaskDetailPage;
