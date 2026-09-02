import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, XCircle, ListTodo, RefreshCw } from 'lucide-react';
import { Modal, Button, Badge, Alert } from '../ui';

const statusTransitions = {
  TODO: [
    { value: 'IN_PROGRESS', label: 'In Progress (Start Working)', icon: Clock },
    { value: 'CANCELLED', label: 'Cancelled (Discard Task)', icon: XCircle },
  ],
  IN_PROGRESS: [
    { value: 'COMPLETED', label: 'Completed (Mark as Done)', icon: CheckCircle2 },
    { value: 'TODO', label: 'To Do (Move Back to Backlog)', icon: ListTodo },
    { value: 'CANCELLED', label: 'Cancelled (Discard Task)', icon: XCircle },
  ],
  COMPLETED: [
    { value: 'IN_PROGRESS', label: 'In Progress (Reopen Task)', icon: Clock },
  ],
  CANCELLED: [
    { value: 'TODO', label: 'To Do (Re-activate Task)', icon: ListTodo },
  ],
};

export const TaskStatusModal = ({
  isOpen,
  onClose,
  task = null,
  onUpdateStatus,
  isSubmitting = false,
  error = '',
  onClearError,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (isOpen && task?.status) {
      const options = statusTransitions[task.status] || [];
      if (options.length > 0) {
        setSelectedStatus(options[0].value);
      } else {
        setSelectedStatus('');
      }
      if (onClearError) onClearError();
    }
  }, [isOpen, task?.status, onClearError]);

  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStatus) return;
    onUpdateStatus(task.id, selectedStatus);
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

  const allowedOptions = task?.status ? statusTransitions[task.status] || [] : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Task Status"
      description={`Task: ${task.title}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" title="Update Failed" onDismiss={onClearError}>
            {error}
          </Alert>
        )}

        {/* Current Status Row */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border text-xs">
          <span className="text-muted-foreground font-medium">Current Status:</span>
          <div>{getStatusBadge(task.status)}</div>
        </div>

        {/* Select Target Status */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground block">
            Select New Status:
          </label>

          <div className="space-y-1.5">
            {allowedOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedStatus === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-colors text-left ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200'
                      : 'border-border bg-card hover:bg-secondary/40 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'}`} />
                    <span>{opt.label}</span>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-border bg-card'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!selectedStatus}
            className="text-xs"
          >
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskStatusModal;
