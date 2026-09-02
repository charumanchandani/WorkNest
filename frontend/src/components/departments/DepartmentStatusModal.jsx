import React from 'react';
import { UserX, UserCheck, AlertTriangle, Users, AlertCircle } from 'lucide-react';
import { Modal, Button, Alert } from '../ui';

export const DepartmentStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  department = null,
  isSubmitting = false,
  error = '',
}) => {
  if (!department) return null;

  const isDeactivating = department.status === 'ACTIVE';
  const newStatus = isDeactivating ? 'INACTIVE' : 'ACTIVE';
  const hasAssignedEmployees = (department.employeeCount || 0) > 0;
  const isDeactivationBlocked = isDeactivating && hasAssignedEmployees;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDeactivating ? 'Deactivate Department' : 'Re-activate Department'}
      description={`Confirmation required for ${department.name} [${department.code}]`}
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
            disabled={isDeactivationBlocked}
            onClick={() => onConfirm(department.id, newStatus)}
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

        {isDeactivationBlocked ? (
          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Deactivation Blocked</span>
            </div>
            <p className="leading-relaxed">
              <strong>{department.name}</strong> currently has{' '}
              <strong className="font-semibold">{department.employeeCount} active employee(s)</strong> assigned to it.
            </p>
            <p className="text-[11px] opacity-90">
              Please reassign all active team members in the Employee Directory before deactivating this department.
            </p>
          </div>
        ) : (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
              isDeactivating
                ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            {isDeactivating ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}

            <div>
              <p className="font-semibold text-sm mb-1">
                {isDeactivating
                  ? `Deactivate ${department.name}?`
                  : `Restore ${department.name}?`}
              </p>
              <p className="opacity-90">
                {isDeactivating
                  ? 'Inactive departments will no longer be available for new employee assignments. Historical audit logs will remain preserved.'
                  : 'Re-activating this department will make it selectable for employee assignments and organizational workflows.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DepartmentStatusModal;
