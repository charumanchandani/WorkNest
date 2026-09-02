import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Alert, Spinner, EmptyState, Badge } from '../components/ui';
import {
  EmployeeFilterBar,
  EmployeeTable,
  EmployeeFormModal,
  EmployeeStatusModal,
} from '../components/employees';
import employeeService from '../services/employeeService';

export const EmployeesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatusEmployee, setTargetStatusEmployee] = useState(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await employeeService.getEmployees({
        page,
        limit: 10,
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
      });

      if (res?.data) {
        setEmployees(res.data.employees || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.formattedMessage || 'Failed to load employees list.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handlers for Add / Edit
  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormSubmitting(true);
      setFormError('');

      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, formData);
        setSuccessMessage(`Employee '${formData.name}' updated successfully.`);
      } else {
        await employeeService.createEmployee(formData);
        setSuccessMessage(`Employee '${formData.name}' created and enrolled successfully.`);
      }

      setFormModalOpen(false);
      fetchEmployees();

      // Auto dismiss success banner after 4 seconds
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setFormError(err.formattedMessage || 'Failed to save employee.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handlers for Status Toggle
  const handleOpenStatusModal = (emp) => {
    setTargetStatusEmployee(emp);
    setStatusError('');
    setStatusModalOpen(true);
  };

  const handleStatusConfirm = async (id, newStatus) => {
    try {
      setStatusSubmitting(true);
      setStatusError('');
      await employeeService.updateEmployeeStatus(id, newStatus);
      setSuccessMessage(`Employee status updated to ${newStatus}.`);
      setStatusModalOpen(false);
      fetchEmployees();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setStatusError(err.formattedMessage || 'Failed to update employee status.');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Employee Directory
            </h1>
            <Badge variant="primary" size="md">
              {pagination.total} Total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage team members, organizational roles, and workplace employment status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={fetchEmployees}
            disabled={loading}
            aria-label="Refresh employee list"
          >
            Refresh
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={UserPlus}
              onClick={handleOpenAdd}
            >
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Success banner */}
      {successMessage && (
        <Alert
          variant="success"
          title="Success"
          onDismiss={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error banner */}
      {error && (
        <Alert
          variant="destructive"
          title="Failed to Load Employees"
          onDismiss={() => setError('')}
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchEmployees} className="ml-4">
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* 2. Filter & Search Bar */}
      <EmployeeFilterBar
        search={search}
        onSearchChange={setSearch}
        role={roleFilter}
        onRoleChange={(r) => {
          setRoleFilter(r);
          setPage(1);
        }}
        status={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onAddEmployee={handleOpenAdd}
        canManage={isAdmin}
      />

      {/* 3. Content Area */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Spinner size="lg" label="Loading employee directory..." />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            Fetching employee records...
          </p>
        </div>
      ) : employees.length === 0 ? (
        <div className="p-8 bg-card rounded-xl border border-border">
          <EmptyState
            icon={Users}
            title={debouncedSearch || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? 'No matching employees' : 'No employees enrolled yet'}
            description={
              debouncedSearch || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'No employee profiles match your current search and filter criteria.'
                : 'Start building your organization by adding your first employee.'
            }
            action={
              debouncedSearch || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              ) : isAdmin ? (
                <Button variant="primary" size="sm" leftIcon={UserPlus} onClick={handleOpenAdd}>
                  Add First Employee
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <EmployeeTable
            employees={employees}
            onEdit={handleOpenEdit}
            onToggleStatus={handleOpenStatusModal}
            canManage={isAdmin}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground">
              <div>
                Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
                <strong className="text-foreground">{pagination.totalPages}</strong> (
                {pagination.total} total records)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={ChevronLeft}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={ChevronRight}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Add / Edit Modal */}
      <EmployeeFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingEmployee}
        isSubmitting={formSubmitting}
        error={formError}
      />

      {/* 5. Activate / Deactivate Modal */}
      <EmployeeStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusConfirm}
        employee={targetStatusEmployee}
        isSubmitting={statusSubmitting}
        error={statusError}
      />
    </div>
  );
};

export default EmployeesPage;
