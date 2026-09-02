import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal, Button, Select, Alert } from '../ui';
import employeeService from '../../services/employeeService';

export const DepartmentManagerModal = ({
  isOpen,
  onClose,
  onConfirm,
  department = null,
  isSubmitting = false,
  error = '',
}) => {
  const [selectedManager, setSelectedManager] = useState('NONE');
  const [eligibleManagers, setEligibleManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchManagers = async () => {
        try {
          setLoadingManagers(true);
          const res = await employeeService.getEmployees({
            limit: 50,
            status: 'ACTIVE',
          });
          if (res?.data?.employees) {
            const managersOnly = res.data.employees.filter(
              (emp) => emp.role === 'MANAGER' || emp.role === 'ADMIN'
            );
            setEligibleManagers(managersOnly);
          }
        } catch {
          // Non-blocking
        } finally {
          setLoadingManagers(false);
        }
      };

      fetchManagers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (department) {
      setSelectedManager(department.manager?.id || 'NONE');
    }
  }, [department, isOpen]);

  if (!department) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(department.id, selectedManager === 'NONE' ? null : selectedManager);
  };

  const managerOptions = [
    { value: 'NONE', label: '— No Manager Assigned (Unassigned) —' },
    ...eligibleManagers.map((m) => ({
      value: m.id,
      label: `${m.name} (${m.role} - ${m.jobTitle})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Department Manager"
      description={`Select leadership lead for ${department.name} [${department.code}]`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {error && (
          <Alert variant="destructive" title="Assignment Error">
            {error}
          </Alert>
        )}

        <div className="space-y-1.5">
          <label htmlFor="dept-manager-select" className="block text-xs font-semibold text-foreground">
            Selected Department Lead
          </label>
          <Select
            id="dept-manager-select"
            options={managerOptions}
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            disabled={loadingManagers}
            helperText="Only active users with role Manager or Admin can be assigned."
          />
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
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
            leftIcon={UserCheck}
            isLoading={isSubmitting}
          >
            Save Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentManagerModal;
