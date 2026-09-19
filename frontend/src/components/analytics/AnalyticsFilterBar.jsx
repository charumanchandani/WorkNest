import React, { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw, RotateCcw } from 'lucide-react';
import { Button, Input, Select } from '../ui';
import departmentService from '../../services/departmentService';
import { useAuth } from '../../hooks';

export const AnalyticsFilterBar = ({
  filters,
  onFilterChange,
  onRefresh,
  loading = false,
  showDepartmentFilter = true,
}) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [activePreset, setActivePreset] = useState('THIS_MONTH');

  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    if (isManagerOrAdmin && showDepartmentFilter) {
      departmentService
        .getDepartments()
        .then((res) => {
          if (res?.data) {
            setDepartments(res.data.records || res.data.departments || res.data || []);
          }
        })
        .catch(() => {
          // Non-blocking fallback
        });
    }
  }, [isManagerOrAdmin, showDepartmentFilter]);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    let from = '';
    let to = '';

    switch (presetKey) {
      case 'THIS_MONTH': {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        from = formatDate(start);
        to = formatDate(end);
        break;
      }
      case 'LAST_MONTH': {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        from = formatDate(start);
        to = formatDate(end);
        break;
      }
      case 'LAST_30_DAYS': {
        const start = new Date();
        start.setDate(now.getDate() - 30);
        from = formatDate(start);
        to = formatDate(now);
        break;
      }
      case 'THIS_QUARTER': {
        const qMonth = Math.floor(month / 3) * 3;
        const start = new Date(year, qMonth, 1);
        const end = new Date(year, qMonth + 3, 0);
        from = formatDate(start);
        to = formatDate(end);
        break;
      }
      case 'YEAR_TO_DATE': {
        const start = new Date(year, 0, 1);
        from = formatDate(start);
        to = formatDate(now);
        break;
      }
      default:
        break;
    }

    onFilterChange({ ...filters, from, to });
  };

  const handleCustomDateChange = (field, value) => {
    setActivePreset('CUSTOM');
    onFilterChange({ ...filters, [field]: value });
  };

  const handleDepartmentChange = (e) => {
    onFilterChange({ ...filters, department: e.target.value });
  };

  const handleReset = () => {
    applyPreset('THIS_MONTH');
    onFilterChange({
      from: '',
      to: '',
      department: '',
    });
  };

  const presets = [
    { id: 'THIS_MONTH', label: 'This Month' },
    { id: 'LAST_MONTH', label: 'Last Month' },
    { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { id: 'THIS_QUARTER', label: 'This Quarter' },
    { id: 'YEAR_TO_DATE', label: 'Year to Date' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-subtle space-y-4">
      {/* Top row: Quick range preset pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground mr-1.5 flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            Range:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activePreset === preset.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Bottom row: Custom date inputs and optional department selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/60">
        <div>
          <label htmlFor="analytics-from-date" className="block text-xs font-medium text-muted-foreground mb-1">From Date</label>
          <Input
            id="analytics-from-date"
            type="date"
            value={filters.from || ''}
            onChange={(e) => handleCustomDateChange('from', e.target.value)}
            disabled={loading}
            className="text-xs h-9"
          />
        </div>

        <div>
          <label htmlFor="analytics-to-date" className="block text-xs font-medium text-muted-foreground mb-1">To Date</label>
          <Input
            id="analytics-to-date"
            type="date"
            value={filters.to || ''}
            onChange={(e) => handleCustomDateChange('to', e.target.value)}
            disabled={loading}
            className="text-xs h-9"
          />
        </div>

        {isManagerOrAdmin && showDepartmentFilter && (
          <div className="sm:col-span-2 md:col-span-2">
            <label htmlFor="analytics-dept-filter" className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Department Scope
            </label>
            <Select
              id="analytics-dept-filter"
              value={filters.department || ''}
              onChange={handleDepartmentChange}
              disabled={loading}
              className="text-xs h-9"
            >
              <option value="">All Managed Departments</option>
              {departments.map((dept) => (
                <option key={dept.id || dept._id} value={dept.id || dept._id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsFilterBar;
