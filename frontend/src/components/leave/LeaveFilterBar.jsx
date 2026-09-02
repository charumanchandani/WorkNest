import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button, Input, Select } from '../ui';
import departmentService from '../../services/departmentService';

export const LeaveFilterBar = ({
  search = '',
  onSearchChange,
  department = 'ALL',
  onDepartmentChange,
  leaveType = 'ALL',
  onTypeChange,
  status = 'ALL',
  onStatusChange,
  fromDate = '',
  onFromChange,
  toDate = '',
  onToChange,
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
      (department && department !== 'ALL') ||
      (leaveType && leaveType !== 'ALL') ||
      (status && status !== 'ALL') ||
      fromDate ||
      toDate
  );

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const typeOptions = [
    { value: 'ALL', label: 'All Leave Types' },
    { value: 'ANNUAL', label: 'Annual' },
    { value: 'CASUAL', label: 'Casual' },
    { value: 'SICK', label: 'Sick' },
    { value: 'UNPAID', label: 'Unpaid' },
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
        <div className="flex-1 max-w-sm">
          <Input
            id="leave-mgmt-search"
            placeholder="Search employee name, email, ID..."
            leftIcon={Search}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-36">
            <Select
              id="mgmt-dept-filter"
              options={departmentOptions}
              value={department || 'ALL'}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by department"
            />
          </div>

          <div className="w-28">
            <Select
              id="mgmt-type-filter"
              options={typeOptions}
              value={leaveType || 'ALL'}
              onChange={(e) => onTypeChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by leave type"
            />
          </div>

          <div className="w-32">
            <Select
              id="mgmt-status-filter"
              options={statusOptions}
              value={status || 'ALL'}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs py-1.5"
              aria-label="Filter by leave status"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromChange(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              title="From date"
              aria-label="Filter from date"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToChange(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              title="To date"
              aria-label="Filter to date"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={X}
              onClick={onResetFilters}
              aria-label="Reset filters"
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

export default LeaveFilterBar;
