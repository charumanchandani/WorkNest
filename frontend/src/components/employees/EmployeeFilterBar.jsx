import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Button, Input, Select } from '../ui';
import departmentService from '../../services/departmentService';

export const EmployeeFilterBar = ({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  department,
  onDepartmentChange,
  onAddEmployee,
  canManage = false,
  onResetFilters,
}) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
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
  }, []);

  const hasActiveFilters = Boolean(
    search ||
      (role && role !== 'ALL') ||
      (status && status !== 'ALL') ||
      (department && department !== 'ALL')
  );

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
              id="department-filter"
              options={departmentOptions}
              value={department || 'ALL'}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by department"
            />
          </div>

          <div className="w-32">
            <Select
              id="role-filter"
              options={roleOptions}
              value={role || 'ALL'}
              onChange={(e) => onRoleChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by role"
            />
          </div>

          <div className="w-32">
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
