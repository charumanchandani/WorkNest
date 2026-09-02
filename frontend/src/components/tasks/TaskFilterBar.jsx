import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button, Input, Select } from '../ui';
import departmentService from '../../services/departmentService';

export const TaskFilterBar = ({
  search = '',
  onSearchChange,
  status = 'ALL',
  onStatusChange,
  priority = 'ALL',
  onPriorityChange,
  department = 'ALL',
  onDepartmentChange,
  dueDate = '',
  onDueDateChange,
  onResetFilters,
  isManagement = false,
}) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (isManagement) {
      const fetchDepts = async () => {
        try {
          const res = await departmentService.getDepartments({
            limit: 50,
            status: 'ACTIVE',
          });
          if (res?.data?.departments) {
            setDepartments(res.data.departments);
          }
        } catch {
          // Non-blocking
        }
      };

      fetchDepts();
    }
  }, [isManagement]);

  const hasActiveFilters = Boolean(
    search ||
      (status && status !== 'ALL') ||
      (priority && priority !== 'ALL') ||
      (department && department !== 'ALL') ||
      dueDate
  );

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const departmentOptions = [
    { value: 'ALL', label: 'All Departments' },
    ...departments.map((d) => ({
      value: d.id,
      label: d.name,
    })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 max-w-sm">
          <Input
            id="task-search-input"
            placeholder={
              isManagement
                ? 'Search task title, employee...'
                : 'Search your assigned tasks...'
            }
            leftIcon={Search}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {isManagement && (
            <div className="w-36">
              <Select
                id="task-dept-filter"
                options={departmentOptions}
                value={department || 'ALL'}
                onChange={(e) => onDepartmentChange(e.target.value)}
                className="text-xs py-1.5"
                aria-label="Filter by department"
              />
            </div>
          )}

          <div className="w-32">
            <Select
              id="task-status-filter"
              options={statusOptions}
              value={status || 'ALL'}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by status"
            />
          </div>

          <div className="w-32">
            <Select
              id="task-priority-filter"
              options={priorityOptions}
              value={priority || 'ALL'}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by priority"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              title="Filter by specific due date"
              aria-label="Filter by due date"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={X}
              onClick={onResetFilters}
              aria-label="Reset task filters"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFilterBar;
