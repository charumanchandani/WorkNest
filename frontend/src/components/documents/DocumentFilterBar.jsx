import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '../ui';

export const DocumentFilterBar = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  visibility,
  onVisibilityChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  departments = [],
  isAdmin = false,
  onReset,
}) => {
  const hasActiveFilters =
    search ||
    category ||
    visibility ||
    department ||
    (isAdmin && status && status !== 'ACTIVE');

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-subtle space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents by title, description, or filename..."
            aria-label="Search documents"
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by Category"
            className="px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Categories</option>
            <option value="POLICY">Policy</option>
            <option value="HR">HR & Benefits</option>
            <option value="GUIDELINE">Guidelines</option>
            <option value="FORM">Forms & Templates</option>
            <option value="TRAINING">Training</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Visibility Filter */}
          <select
            value={visibility}
            onChange={(e) => onVisibilityChange(e.target.value)}
            aria-label="Filter by Visibility"
            className="px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Visibility</option>
            <option value="ORGANIZATION">Organization</option>
            <option value="DEPARTMENT">Department</option>
          </select>

          {/* Department Filter */}
          {departments.length > 0 && (
            <select
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
              aria-label="Filter by Department"
              className="px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          )}

          {/* Admin Status Filter */}
          {isAdmin && (
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Filter by Status"
              className="px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="ARCHIVED">Archived Only</option>
            </select>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-8.5 text-xs text-muted-foreground hover:text-foreground col-span-2 sm:col-auto"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentFilterBar;
