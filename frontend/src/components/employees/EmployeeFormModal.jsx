import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, MapPin, Calendar, Hash, Building2 } from 'lucide-react';
import { Modal, Button, Input, Select, Alert } from '../ui';
import departmentService from '../../services/departmentService';

export const EmployeeFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  error = '',
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    jobTitle: '',
    department: 'NONE',
    joiningDate: new Date().toISOString().split('T')[0],
    location: 'Remote',
    employeeId: '',
  });

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Fetch active departments on open
  useEffect(() => {
    if (isOpen) {
      const fetchDepts = async () => {
        try {
          setLoadingDepts(true);
          const res = await departmentService.getDepartments({
            limit: 50,
            status: 'ACTIVE',
          });
          if (res?.data?.departments) {
            setDepartments(res.data.departments);
          }
        } catch {
          // Non-blocking
        } finally {
          setLoadingDepts(false);
        }
      };

      fetchDepts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || (initialData.name ? initialData.name.split(' ')[0] : ''),
        lastName: initialData.lastName || (initialData.name ? initialData.name.split(' ').slice(1).join(' ') : ''),
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'EMPLOYEE',
        jobTitle: initialData.jobTitle || '',
        department: initialData.department?.id || (initialData.department ? (typeof initialData.department === 'string' ? initialData.department : initialData.department.id) : 'NONE') || 'NONE',
        joiningDate: initialData.joiningDate
          ? new Date(initialData.joiningDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        location: initialData.location || 'Remote',
        employeeId: initialData.employeeId || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'EMPLOYEE',
        jobTitle: 'Associate',
        department: 'NONE',
        joiningDate: new Date().toISOString().split('T')[0],
        location: 'Remote',
        employeeId: '',
      });
    }
    setValidationError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setValidationError('Please provide both first and last name.');
      return;
    }

    if (!isEditing && !formData.email.trim()) {
      setValidationError('Please provide a valid email address.');
      return;
    }

    if (!formData.jobTitle.trim()) {
      setValidationError('Please provide a job title.');
      return;
    }

    onSubmit({
      ...formData,
      department: formData.department === 'NONE' ? null : formData.department,
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
    });
  };

  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Employee (Self-Service)' },
    { value: 'MANAGER', label: 'Manager (Team Lead)' },
    { value: 'ADMIN', label: 'Administrator (Full Access)' },
  ];

  const departmentOptions = [
    { value: 'NONE', label: '— No Department (Unassigned) —' },
    ...departments.map((d) => ({
      value: d.id,
      label: `${d.name} (${d.code})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Employee: ${initialData?.name}` : 'Add New Employee'}
      description={
        isEditing
          ? 'Update employee profile details, role, department, and job information.'
          : 'Enroll a new team member and provision their WorkNest workspace account.'
      }
      size="lg"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="First Name"
            id="firstName"
            name="firstName"
            placeholder="e.g. Elena"
            leftIcon={User}
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <Input
            label="Last Name"
            id="lastName"
            name="lastName"
            placeholder="e.g. Rostova"
            leftIcon={User}
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Work Email Address"
            id="email"
            name="email"
            type="email"
            placeholder="elena@company.com"
            leftIcon={Mail}
            value={formData.email}
            onChange={handleChange}
            disabled={isEditing}
            helperText={isEditing ? 'Email address cannot be modified once provisioned.' : undefined}
            required
          />

          <Input
            label="Contact Phone"
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            leftIcon={Phone}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1">
            <label htmlFor="role" className="block text-xs font-semibold text-foreground">
              Assigned Role
            </label>
            <Select
              id="role"
              name="role"
              options={roleOptions}
              value={formData.role}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="department" className="block text-xs font-semibold text-foreground">
              Department
            </label>
            <Select
              id="department"
              name="department"
              options={departmentOptions}
              value={formData.department}
              onChange={handleChange}
              disabled={loadingDepts}
            />
          </div>

          <Input
            label="Job Title"
            id="jobTitle"
            name="jobTitle"
            placeholder="e.g. Senior Product Designer"
            leftIcon={Briefcase}
            value={formData.jobTitle}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Joining Date"
            id="joiningDate"
            name="joiningDate"
            type="date"
            leftIcon={Calendar}
            value={formData.joiningDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Workplace Location"
            id="location"
            name="location"
            placeholder="e.g. Remote, Austin Hub, HQ"
            leftIcon={MapPin}
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        {!isEditing && (
          <Input
            label="Custom Employee ID (Optional)"
            id="employeeId"
            name="employeeId"
            placeholder="Leave empty for auto-generated WN-XXXX"
            leftIcon={Hash}
            value={formData.employeeId}
            onChange={handleChange}
            helperText="Auto-assigned sequentially (e.g. WN-0007) if left blank."
          />
        )}

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
            {isEditing ? 'Save Changes' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;
