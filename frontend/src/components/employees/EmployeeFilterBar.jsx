import React from 'react';
import { Search, UserPlus, Filter, X } from 'lucide-react';
import { Button, Input, Select } from '../ui';

export const EmployeeFilterBar = ({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onAddEmployee,
  canManage = false,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(search || (role && role !== 'ALL') || (status && status !== 'ALL'));

  const roleOptions = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'ADMIN', label: 'Administrator' },
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="flex-1 max-w-md">
          <Input
            id="employee-search"
            placeholder="Search by name, email, ID, or job title..."
            leftIcon={Search}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        {/* Filter controls and Add Employee action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-36">
            <Select
              id="role-filter"
              options={roleOptions}
              value={role || 'ALL'}
              onChange={(e) => onRoleChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by role"
            />
          </div>

          <div className="w-36">
            <Select
              id="status-filter"
              options={statusOptions}
              value={status || 'ALL'}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by status"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={X}
              onClick={onResetFilters}
              aria-label="Reset all search filters"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={UserPlus}
              onClick={onAddEmployee}
              className="text-xs shrink-0"
            >
              Add Employee
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilterBar;
