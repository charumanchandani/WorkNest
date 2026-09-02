import React from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Button, Input, Select } from '../ui';

export const DepartmentFilterBar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onAddDepartment,
  canManage = false,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(search || (status && status !== 'ALL'));

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
            id="department-search"
            placeholder="Search by department name, code, or description..."
            leftIcon={Search}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        {/* Filter controls and Add Department action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-36">
            <Select
              id="department-status-filter"
              options={statusOptions}
              value={status || 'ALL'}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by department status"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={X}
              onClick={onResetFilters}
              aria-label="Reset department filters"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={onAddDepartment}
              className="text-xs shrink-0"
            >
              Add Department
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentFilterBar;
