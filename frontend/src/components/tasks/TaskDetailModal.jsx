import React from 'react';
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Flag,
} from 'lucide-react';
import { Modal, Button, Badge } from '../ui';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task = null,
  onOpenStatusModal,
  onEditTask,
  isManagement = false,
}) => {
  if (!task) return null;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Specifications"
      description={`Task ID: #${task.id}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-secondary/30 border border-border">
          <div className="flex items-center gap-2">
            {getPriorityBadge(task.priority)}
            {getStatusBadge(task.status)}
          </div>

          {task.isOverdue && (
            <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              Overdue Deadline
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-base font-bold text-foreground">{task.title}</h2>
        </div>

        {/* Description */}
        <div className="p-3.5 rounded-xl border border-border bg-card space-y-1 text-xs">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Instructions &amp; Description
          </span>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {task.description || <span className="italic text-muted-foreground">No additional instructions provided.</span>}
          </p>
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Assignee */}
          <div className="p-3 rounded-xl border border-border bg-card space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Assigned Employee
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-border shrink-0">
                {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-foreground block truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                <span className="text-[10px] text-muted-foreground font-mono block truncate">
                  {task.assignedTo?.employeeId || task.assignedTo?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Assigner */}
          <div className="p-3 rounded-xl border border-border bg-card space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Assigned By
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <div className="w-7 h-7 rounded-lg bg-secondary text-foreground font-bold text-xs flex items-center justify-center border border-border shrink-0">
                {task.assignedBy?.name ? task.assignedBy.name.charAt(0).toUpperCase() : 'M'}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-foreground block truncate">{task.assignedBy?.name || 'Management'}</span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {task.assignedBy?.role || 'Administrator'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Department & Timeline Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-border bg-card space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Department
            </span>
            <span className="font-semibold text-foreground block">
              {task.department?.name || 'Organization Wide'}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border bg-card space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Due Date (Deadline)
            </span>
            <span className={`font-semibold block ${task.isOverdue ? 'text-rose-600 font-bold' : 'text-foreground'}`}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="text-[11px] text-muted-foreground space-y-1 pt-1 border-t border-border">
          <div className="flex items-center justify-between">
            <span>Created: {formatTimestamp(task.createdAt)}</span>
            {task.completedAt && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Completed: {formatTimestamp(task.completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {onOpenStatusModal && task.status !== 'CANCELLED' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={RefreshCw}
                onClick={() => onOpenStatusModal(task)}
                className="text-xs"
              >
                Update Status
              </Button>
            )}

            {isManagement && onEditTask && task.status !== 'CANCELLED' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={Edit2}
                onClick={() => onEditTask(task)}
                className="text-xs"
              >
                Edit Task
              </Button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
