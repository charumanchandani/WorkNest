import React from 'react';
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { Modal, Button, Badge } from '../ui';

export const LeaveDetailModal = ({
  isOpen,
  onClose,
  leave = null,
  onCancelRequest,
  isCancelling = false,
  isOwner = false,
}) => {
  if (!leave) return null;

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" size="md" dot>Pending Review</Badge>;
      case 'APPROVED':
        return <Badge variant="success" size="md" dot>Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" size="md" dot>Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" size="md">Cancelled</Badge>;
      default:
        return <Badge variant="outline" size="md">{status}</Badge>;
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave Request Details"
      description={`Reference ID: #${leave.id}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Header Status & Type */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border">
          <div className="flex items-center gap-2">
            {getTypeBadge(leave.leaveType)}
            <span className="font-bold text-foreground text-xs font-mono">
              {leave.totalDays} Working Day{leave.totalDays === 1 ? '' : 's'}
            </span>
          </div>

          <div>{getStatusBadge(leave.status)}</div>
        </div>

        {/* Employee Info (if present) */}
        {leave.employee?.name && (
          <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Applicant
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">{leave.employee.name}</span>
                <span className="text-muted-foreground text-[11px] font-mono">
                  {leave.employee.employeeId || leave.employee.email}
                </span>
              </div>
              {leave.employee.department?.name && (
                <Badge variant="outline" size="sm">
                  {leave.employee.department.name}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Dates Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Start Date
            </span>
            <span className="font-semibold text-foreground block">
              {formatDate(leave.startDate)}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              End Date
            </span>
            <span className="font-semibold text-foreground block">
              {formatDate(leave.endDate)}
            </span>
          </div>
        </div>

        {/* Reason */}
        <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 text-xs">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Reason & Justification
          </span>
          <p className="text-foreground leading-relaxed italic">
            &ldquo;{leave.reason}&rdquo;
          </p>
        </div>

        {/* Reviewer / Decision Details */}
        {(leave.status === 'APPROVED' || leave.status === 'REJECTED') && (
          <div className="p-3 rounded-xl border border-border/70 bg-secondary/20 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Management Review
            </span>

            <div className="flex items-center justify-between text-[11px]">
              <div>
                <span className="text-muted-foreground">Reviewed by: </span>
                <strong className="text-foreground">{leave.reviewedBy?.name || 'Administrator'}</strong>
              </div>
              <span className="text-muted-foreground font-mono">
                {formatTimestamp(leave.reviewedAt)}
              </span>
            </div>

            {leave.reviewComment && (
              <div className="pt-1.5 border-t border-border/60">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Reviewer Notes</span>
                <p className="text-foreground italic text-xs">&ldquo;{leave.reviewComment}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* Applied / Cancelled timestamps */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
          <span>Applied: {formatTimestamp(leave.createdAt)}</span>
          {leave.cancelledAt && <span>Cancelled: {formatTimestamp(leave.cancelledAt)}</span>}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-border">
          <div>
            {isOwner && leave.status === 'PENDING' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancelRequest(leave)}
                isLoading={isCancelling}
                className="text-xs"
              >
                Cancel Request
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

export default LeaveDetailModal;
