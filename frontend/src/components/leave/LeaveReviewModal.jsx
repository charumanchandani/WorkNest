import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  User,
  MessageSquare,
} from 'lucide-react';
import { Modal, Button, Badge, Alert } from '../ui';

export const LeaveReviewModal = ({
  isOpen,
  onClose,
  leave = null,
  onApprove,
  onReject,
  isSubmitting = false,
  error = '',
  onClearError,
}) => {
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReviewComment('');
      if (onClearError) onClearError();
    }
  }, [isOpen, onClearError]);

  if (!leave) return null;

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

  const getTypeBadge = (type) => {
    switch (type) {
      case 'ANNUAL':
        return <Badge variant="success" size="sm">Annual Leave</Badge>;
      case 'CASUAL':
        return <Badge variant="primary" size="sm">Casual Leave</Badge>;
      case 'SICK':
        return <Badge variant="destructive" size="sm">Sick Leave</Badge>;
      case 'UNPAID':
        return <Badge variant="warning" size="sm">Unpaid Leave</Badge>;
      default:
        return <Badge variant="outline" size="sm">{type}</Badge>;
    }
  };

  const handleApprove = () => {
    onApprove(leave.id, reviewComment.trim());
  };

  const handleReject = () => {
    onReject(leave.id, reviewComment.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Leave Request"
      description="Approve or reject this employee time-off application."
      size="md"
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" title="Review Failed" onDismiss={onClearError}>
            {error}
          </Alert>
        )}

        {/* Applicant Summary */}
        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-border shrink-0">
                {leave.employee?.name ? leave.employee.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <div>
                <span className="font-bold text-foreground block">{leave.employee?.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {leave.employee?.employeeId || leave.employee?.email}
                </span>
              </div>
            </div>

            {leave.employee?.department?.name && (
              <Badge variant="outline" size="sm">
                {leave.employee.department.name}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Category</span>
              <div className="mt-0.5">{getTypeBadge(leave.leaveType)}</div>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Duration</span>
              <span className="font-bold text-foreground font-mono">
                {leave.totalDays} Working Day{leave.totalDays === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Dates</span>
            <span className="font-semibold text-foreground">
              {formatDate(leave.startDate)} &rarr; {formatDate(leave.endDate)}
            </span>
          </div>

          <div className="pt-1">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Reason</span>
            <p className="text-foreground italic bg-card p-2 rounded-lg border border-border/70 text-[11px]">
              &ldquo;{leave.reason}&rdquo;
            </p>
          </div>
        </div>

        {/* Reviewer Comment Field */}
        <div className="space-y-1.5">
          <label htmlFor="review-comment" className="text-xs font-semibold text-foreground">
            Reviewer Comment / Feedback <span className="text-muted-foreground font-normal">(Optional for approve, recommended for reject)</span>
          </label>
          <textarea
            id="review-comment"
            rows={2}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Add comments, approvals conditions, or reason for rejection..."
            disabled={isSubmitting}
            maxLength={500}
            className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto text-xs"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              leftIcon={XCircle}
              onClick={handleReject}
              isLoading={isSubmitting}
              className="w-full sm:w-auto text-xs"
            >
              Reject Leave
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={CheckCircle2}
              onClick={handleApprove}
              isLoading={isSubmitting}
              className="w-full sm:w-auto text-xs bg-emerald-600 hover:bg-emerald-700"
            >
              Approve Leave
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LeaveReviewModal;
