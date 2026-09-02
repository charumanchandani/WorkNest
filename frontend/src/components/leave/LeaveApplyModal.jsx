import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CalendarCheck,
  Palmtree,
  Info,
} from 'lucide-react';
import { Modal, Button, Input, Select, Alert, Badge } from '../ui';

// Helper to calculate working days (Mon-Fri) on clientside preview
const getClientWorkingDays = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (start > end) return 0;

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

export const LeaveApplyModal = ({
  isOpen,
  onClose,
  onSubmit,
  balance = null,
  isSubmitting = false,
  error = '',
  onClearError,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [clientDays, setClientDays] = useState(0);

  // Recalculate working days whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      setClientDays(getClientWorkingDays(startDate, endDate));
    } else if (startDate) {
      setClientDays(getClientWorkingDays(startDate, startDate));
    } else {
      setClientDays(0);
    }
  }, [startDate, endDate]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLeaveType('ANNUAL');
      setStartDate('');
      setEndDate('');
      setReason('');
      setClientDays(0);
      if (onClearError) onClearError();
    }
  }, [isOpen, onClearError]);

  const leaveOptions = [
    {
      value: 'ANNUAL',
      label: `Annual Leave (${balance?.annual?.available ?? 0} days available)`,
    },
    {
      value: 'CASUAL',
      label: `Casual Leave (${balance?.casual?.available ?? 0} days available)`,
    },
    {
      value: 'SICK',
      label: `Sick Leave (${balance?.sick?.available ?? 0} days available)`,
    },
    {
      value: 'UNPAID',
      label: 'Unpaid Leave (No quota limit)',
    },
  ];

  // Get available quota for selected type
  let availableQuota = 0;
  if (leaveType === 'ANNUAL') availableQuota = balance?.annual?.available || 0;
  else if (leaveType === 'CASUAL') availableQuota = balance?.casual?.available || 0;
  else if (leaveType === 'SICK') availableQuota = balance?.sick?.available || 0;
  else if (leaveType === 'UNPAID') availableQuota = Infinity;

  const isExceedingQuota = leaveType !== 'UNPAID' && clientDays > availableQuota;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    onSubmit({
      leaveType,
      startDate,
      endDate: endDate || startDate,
      reason: reason.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      description="Submit a time-off or leave request for manager / admin review."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" title="Request Failed" onDismiss={onClearError}>
            {error}
          </Alert>
        )}

        {/* 1. Leave Type Selector */}
        <div className="space-y-1.5">
          <label htmlFor="leave-type-select" className="text-xs font-semibold text-foreground">
            Leave Category <span className="text-rose-500">*</span>
          </label>
          <Select
            id="leave-type-select"
            options={leaveOptions}
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            disabled={isSubmitting}
            className="text-xs"
          />
        </div>

        {/* 2. Date Pickers (Start & End) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="leave-start-date" className="text-xs font-semibold text-foreground">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="leave-start-date"
              type="date"
              min={todayStr}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (!endDate || endDate < e.target.value) {
                  setEndDate(e.target.value);
                }
              }}
              required
              disabled={isSubmitting}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="leave-end-date" className="text-xs font-semibold text-foreground">
              End Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="leave-end-date"
              type="date"
              min={startDate || todayStr}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* 3. Duration & Quota Preview */}
        {startDate && endDate && (
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                Calculated Duration:{' '}
                <strong className="text-foreground">
                  {clientDays} Working Day{clientDays === 1 ? '' : 's'}
                </strong>{' '}
                <span className="text-muted-foreground text-[11px]">(Mon–Fri)</span>
              </span>
            </div>

            <div>
              {leaveType !== 'UNPAID' ? (
                <Badge
                  variant={isExceedingQuota ? 'destructive' : 'success'}
                  size="sm"
                >
                  {isExceedingQuota ? 'Quota Exceeded' : `${availableQuota - clientDays}d Remaining`}
                </Badge>
              ) : (
                <Badge variant="outline" size="sm">
                  Unpaid
                </Badge>
              )}
            </div>
          </div>
        )}

        {isExceedingQuota && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              You requested <strong>{clientDays} days</strong>, but only have{' '}
              <strong>{availableQuota} days</strong> available for this leave type. Please adjust dates or select Unpaid Leave.
            </span>
          </div>
        )}

        {/* 4. Reason Text Area */}
        <div className="space-y-1.5">
          <label htmlFor="leave-reason" className="text-xs font-semibold text-foreground">
            Reason / Justification <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="leave-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide details or context for your leave request..."
            required
            minLength={3}
            maxLength={500}
            disabled={isSubmitting}
            className="w-full text-xs p-3 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Minimum 3 characters</span>
            <span>{reason.length} / 500</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!startDate || !endDate || clientDays <= 0 || isExceedingQuota || reason.trim().length < 3}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveApplyModal;
