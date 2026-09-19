import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { Modal, Button, Badge } from '../ui';
import { TaskSummaryModal } from '../ai';
import aiService from '../../services/aiService';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task = null,
  onOpenStatusModal,
  onEditTask,
  isManagement = false,
}) => {
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  if (!task) return null;

  const handleFetchAiSummary = async () => {
    try {
      setAiSummaryOpen(true);
      setSummaryLoading(true);
      setSummaryError('');
      setSummaryData(null);
      const res = await aiService.getTaskSummary(task.id);
      if (res?.data) {
        setSummaryData(res.data.data || res.data);
      }
    } catch (err) {
      setSummaryError(err.formattedMessage || 'Failed to generate task summary.');
    } finally {
      setSummaryLoading(false);
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
    <>
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

            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchAiSummary}
              className="text-xs h-8 border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
              AI Summary
            </Button>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground leading-snug">{task.title}</h3>
            {task.description ? (
              <p className="text-xs text-muted-foreground bg-secondary/20 p-3 rounded-xl border border-border/60 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">No detailed description provided.</p>
            )}
          </div>

          {/* People Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Assigned To
              </span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-[10px] flex items-center justify-center border border-border">
                  {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-foreground block truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {task.assignedTo?.email || 'No email'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Assigned By
              </span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary text-muted-foreground font-bold text-[10px] flex items-center justify-center border border-border">
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

      <TaskSummaryModal
        isOpen={aiSummaryOpen}
        onClose={() => setAiSummaryOpen(false)}
        taskTitle={task.title}
        summaryData={summaryData}
        loading={summaryLoading}
        error={summaryError}
      />
    </>
  );
};

export default TaskDetailModal;
