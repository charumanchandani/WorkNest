import React from 'react';
import { UserX, UserCheck, AlertTriangle } from 'lucide-react';
import { Modal, Button, Alert } from '../ui';

export const EmployeeStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  employee = null,
  isSubmitting = false,
  error = '',
}) => {
  if (!employee) return null;

  const isDeactivating = employee.status === 'ACTIVE';
  const newStatus = isDeactivating ? 'INACTIVE' : 'ACTIVE';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDeactivating ? 'Deactivate Employee Account' : 'Re-activate Employee Account'}
      description={`Confirmation required for ${employee.name} (${employee.employeeId || 'ID Pending'})`}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
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
            type="button"
            variant={isDeactivating ? 'destructive' : 'primary'}
            size="sm"
            leftIcon={isDeactivating ? UserX : UserCheck}
            isLoading={isSubmitting}
            onClick={() => onConfirm(employee.id, newStatus)}
          >
            {isDeactivating ? 'Confirm Deactivation' : 'Confirm Activation'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 py-1">
        {error && (
          <Alert variant="destructive" title="Operation Rejected">
            {error}
          </Alert>
        )}

        <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
          isDeactivating
            ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
            : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
        }`}>
          {isDeactivating ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}

          <div>
            <p className="font-semibold text-sm mb-1">
              {isDeactivating
                ? `Are you sure you want to deactivate ${employee.name}?`
                : `Restore workspace access for ${employee.name}?`}
            </p>
            <p className="opacity-90">
              {isDeactivating
                ? 'Deactivating will immediately revoke this employee’s session and block future sign-ins. Their historical records and activity will remain safely archived.'
                : 'Re-activating this employee will restore their login access and allow them to resume self-service workflows.'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeStatusModal;
