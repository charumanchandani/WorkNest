import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, User, Flag, AlertCircle } from 'lucide-react';
import { Modal, Button, Input, Select, Alert } from '../ui';
import employeeService from '../../services/employeeService';

export const TaskFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  task = null, // if present, edit mode
  isSubmitting = false,
  error = '',
  onClearError,
}) => {
  const isEdit = Boolean(task);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState('');

  // Employees options list
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Calculate today's date string (YYYY-MM-DD) for min date constraint
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setAssignedTo(task.assignedTo?.id || task.assignedTo?._id || '');
        setPriority(task.priority || 'MEDIUM');
        setDueDate(task.dueDate || '');
      } else {
        setTitle('');
        setDescription('');
        setAssignedTo('');
        setPriority('MEDIUM');
        setDueDate(todayStr);
      }
      setValidationError('');
      if (onClearError) onClearError();

      // Fetch active employees
      const fetchEmployees = async () => {
        try {
          setLoadingEmployees(true);
          const res = await employeeService.getEmployees({
            limit: 50,
            status: 'ACTIVE',
          });
          if (res?.data?.employees) {
            setEmployees(res.data.employees);
          }
        } catch {
          // Non-blocking
        } finally {
          setLoadingEmployees(false);
        }
      };

      fetchEmployees();
    }
  }, [isOpen, task, todayStr, onClearError]);

  const priorityOptions = [
    { value: 'LOW', label: 'Low Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'HIGH', label: 'High Priority' },
    { value: 'URGENT', label: 'Urgent Priority' },
  ];

  const employeeOptions = [
    { value: '', label: loadingEmployees ? 'Loading active staff...' : 'Select Assignee...' },
    ...employees.map((e) => ({
      value: e.id,
      label: `${e.name} (${e.department?.name || 'No Dept'} • ${e.employeeId || e.role})`,
    })),
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim() || title.trim().length < 3) {
      setValidationError('Please provide a task title of at least 3 characters.');
      return;
    }

    if (title.trim().length > 150) {
      setValidationError('Task title cannot exceed 150 characters.');
      return;
    }

    if (!assignedTo) {
      setValidationError('Please select an employee to assign this task.');
      return;
    }

    if (!dueDate) {
      setValidationError('Please select a valid due date.');
      return;
    }

    if (!isEdit && dueDate < todayStr) {
      setValidationError('Due date cannot be set in the past for new tasks.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      priority,
      dueDate,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Task Details' : 'Create & Assign New Task'}
      description={
        isEdit
          ? 'Update task specifications, priority, assignee, or deadline.'
          : 'Assign a new workplace task to an active team member.'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Banners */}
        {(error || validationError) && (
          <Alert
            variant="destructive"
            title="Validation Error"
            onDismiss={() => {
              setValidationError('');
              if (onClearError) onClearError();
            }}
          >
            {error || validationError}
          </Alert>
        )}

        {/* Task Title */}
        <Input
          id="task-title-input"
          label="Task Title *"
          placeholder="e.g., Update quarterly financial spreadsheet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={150}
          disabled={isSubmitting}
        />

        {/* Assignee & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Assignee Selector */}
          <div>
            <label htmlFor="task-assignee-select" className="text-xs font-semibold text-foreground block mb-1.5">
              Assigned Employee *
            </label>
            <Select
              id="task-assignee-select"
              options={employeeOptions}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={isSubmitting || loadingEmployees}
              required
              className="text-xs"
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="task-priority-select" className="text-xs font-semibold text-foreground block mb-1.5">
              Priority Level *
            </label>
            <Select
              id="task-priority-select"
              options={priorityOptions}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
              className="text-xs"
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="task-due-date-input" className="text-xs font-semibold text-foreground block mb-1.5">
            Due Date (Deadline) *
          </label>
          <input
            id="task-due-date-input"
            type="date"
            min={isEdit ? undefined : todayStr}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="task-description-input" className="font-semibold text-foreground">
              Task Description &amp; Instructions
            </label>
            <span className="text-[10px] text-muted-foreground">{description.length}/2000</span>
          </div>
          <textarea
            id="task-description-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, deliverables, and acceptance criteria..."
            maxLength={2000}
            disabled={isSubmitting}
            className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>

        {/* Action Buttons */}
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
            className="text-xs"
          >
            {isEdit ? 'Save Changes' : 'Create & Assign Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
