import React, { useState, useEffect } from 'react';
import { Building2, Hash, FileText, UserCheck } from 'lucide-react';
import { Modal, Button, Input, Textarea, Select, Alert } from '../ui';
import employeeService from '../../services/employeeService';

export const DepartmentFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  error = '',
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    manager: 'NONE',
  });

  const [eligibleManagers, setEligibleManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Fetch eligible managers (Admins & Managers)
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
          // Non-blocking fallback
        } finally {
          setLoadingManagers(false);
        }
      };

      fetchManagers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        manager: initialData.manager?.id || 'NONE',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        manager: 'NONE',
      });
    }
    setValidationError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase() : value,
    }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setValidationError('Please provide a department name.');
      return;
    }

    if (!formData.code.trim()) {
      setValidationError('Please provide a department code (e.g. ENG, HR).');
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      manager: formData.manager === 'NONE' ? null : formData.manager,
    });
  };

  const managerOptions = [
    { value: 'NONE', label: '— No Manager Assigned —' },
    ...eligibleManagers.map((m) => ({
      value: m.id,
      label: `${m.name} (${m.role} - ${m.jobTitle})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Department: ${initialData?.name}` : 'Create New Department'}
      description={
        isEditing
          ? 'Update organizational details and department leadership.'
          : 'Define a new organizational unit, unit code, and assign department lead.'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {(error || validationError) && (
          <Alert
            variant="destructive"
            title="Validation Error"
            onDismiss={() => setValidationError('')}
          >
            {error || validationError}
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2">
            <Input
              label="Department Name"
              id="name"
              name="name"
              placeholder="e.g. Engineering, People & Culture"
              leftIcon={Building2}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Input
              label="Department Code"
              id="code"
              name="code"
              placeholder="e.g. ENG"
              leftIcon={Hash}
              value={formData.code}
              onChange={handleChange}
              maxLength={10}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="manager" className="block text-xs font-semibold text-foreground">
            Department Lead / Manager
          </label>
          <Select
            id="manager"
            name="manager"
            options={managerOptions}
            value={formData.manager}
            onChange={handleChange}
            disabled={loadingManagers}
            helperText="Only active users with role Manager or Admin can lead a department."
          />
        </div>

        <div>
          <Textarea
            label="Department Description (Optional)"
            id="description"
            name="description"
            placeholder="Brief summary of department responsibilities and operational mandate..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Create Department'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentFormModal;
