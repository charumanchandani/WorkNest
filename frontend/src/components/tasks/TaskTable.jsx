import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  User,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { Badge, Button } from '../ui';

export const TaskTable = ({
  records = [],
  pagination = { page: 1, totalPages: 1, total: 0 },
  onPageChange,
  onViewDetails,
  onUpdateStatus,
  onEditTask,
  isManagement = false,
  loading = false,
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive" size="sm">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="primary" size="sm">Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline" size="sm">Low</Badge>;
      default:
        return <Badge variant="outline" size="sm">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TODO':
        return <Badge variant="outline" size="sm" dot>To Do</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" size="sm" dot>In Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" size="sm" dot>Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" size="sm">Cancelled</Badge>;
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
              <th scope="col" className="py-3.5 px-4">Task</th>
              {isManagement && <th scope="col" className="py-3.5 px-4">Assignee</th>}
              <th scope="col" className="py-3.5 px-4">Priority</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4">Due Date</th>
              {!isManagement && <th scope="col" className="py-3.5 px-4">Assigned By</th>}
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.length === 0 ? (
              <tr>
                <td colSpan={isManagement ? 6 : 6} className="py-8 text-center text-xs text-muted-foreground">
                  {isManagement
                    ? 'No tasks found matching your filter criteria.'
                    : 'No tasks assigned to you matching your selection.'}
                </td>
              </tr>
            ) : (
              records.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/30 transition-colors">
                  {/* Title & Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(t)}
                        className="font-semibold text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-left truncate block max-w-sm"
                      >
                        {t.title}
                      </button>
                      {t.description && (
                        <p className="text-muted-foreground text-[11px] truncate max-w-xs">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Assignee (Management View) */}
                  {isManagement && (
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-[10px] flex items-center justify-center border border-border shrink-0">
                          {t.assignedTo?.name ? t.assignedTo.name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate">
                            {t.assignedTo?.name || 'Unassigned'}
                          </span>
                          {t.department?.name && (
                            <span className="text-[10px] text-muted-foreground block truncate">
                              {t.department.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Priority */}
                  <td className="py-3.5 px-4">{getPriorityBadge(t.priority)}</td>

                  {/* Status */}
                  <td className="py-3.5 px-4">{getStatusBadge(t.status)}</td>

                  {/* Due Date + Overdue indicator */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className={t.isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-foreground'}>
                        {formatDate(t.dueDate)}
                      </span>
                      {t.isOverdue && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Overdue
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assigner (Employee View) */}
                  {!isManagement && (
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {t.assignedBy?.name || 'Manager'}
                    </td>
                  )}

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onUpdateStatus && t.status !== 'CANCELLED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={RefreshCw}
                          onClick={() => onUpdateStatus(t)}
                          className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 py-1"
                        >
                          Status
                        </Button>
                      )}

                      {isManagement && onEditTask && t.status !== 'CANCELLED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={Edit2}
                          onClick={() => onEditTask(t)}
                          className="text-xs text-muted-foreground hover:text-foreground py-1"
                        >
                          Edit
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Eye}
                        onClick={() => onViewDetails(t)}
                        className="text-xs text-muted-foreground hover:text-foreground py-1"
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2.5">
        {records.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-border rounded-xl bg-card">
            {isManagement
              ? 'No tasks found matching your filter criteria.'
              : 'No tasks assigned to you matching your selection.'}
          </div>
        ) : (
          records.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-xl border border-border bg-card shadow-subtle space-y-2.5 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => onViewDetails(t)}
                    className="font-bold text-foreground hover:text-teal-600 dark:hover:text-teal-400 text-left block"
                  >
                    {t.title}
                  </button>
                  {isManagement && t.assignedTo?.name && (
                    <span className="text-[11px] text-muted-foreground block">
                      Assigned to: <strong className="text-foreground">{t.assignedTo.name}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {getPriorityBadge(t.priority)}
                  {getStatusBadge(t.status)}
                </div>
              </div>

              {t.description && (
                <p className="text-muted-foreground text-[11px] line-clamp-2">
                  {t.description}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className={t.isOverdue ? 'text-rose-600 font-bold' : 'text-muted-foreground'}>
                    Due: {formatDate(t.dueDate)}
                  </span>
                  {t.isOverdue && (
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1 py-0.5 rounded">
                      Overdue
                    </span>
                  )}
                </div>

                {!isManagement && t.assignedBy?.name && (
                  <span className="text-muted-foreground">
                    By: {t.assignedBy.name}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/60">
                {onUpdateStatus && t.status !== 'CANCELLED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={RefreshCw}
                    onClick={() => onUpdateStatus(t)}
                    className="text-xs"
                  >
                    Status
                  </Button>
                )}

                {isManagement && onEditTask && t.status !== 'CANCELLED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Edit2}
                    onClick={() => onEditTask(t)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Eye}
                  onClick={() => onViewDetails(t)}
                  className="text-xs"
                >
                  Details
                </Button>
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
            {pagination.total} tasks)
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

export default TaskTable;
