import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Alert, Spinner, EmptyState, Badge } from '../components/ui';
import {
  DepartmentFilterBar,
  DepartmentTable,
  DepartmentFormModal,
  DepartmentStatusModal,
  DepartmentManagerModal,
} from '../components/departments';
import departmentService from '../services/departmentService';

export const DepartmentsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [departments, setDepartments] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatusDepartment, setTargetStatusDepartment] = useState(null);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [targetManagerDepartment, setTargetManagerDepartment] = useState(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [managerSubmitting, setManagerSubmitting] = useState(false);
  const [managerError, setManagerError] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await departmentService.getDepartments({
        page,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter,
      });

      if (res?.data) {
        setDepartments(res.data.departments || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.formattedMessage || 'Failed to load departments list.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Handlers for Add / Edit
  const handleOpenAdd = () => {
    setEditingDepartment(null);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDepartment(dept);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormSubmitting(true);
      setFormError('');

      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, formData);
        setSuccessMessage(`Department '${formData.name}' updated successfully.`);
      } else {
        await departmentService.createDepartment(formData);
        setSuccessMessage(`Department '${formData.name}' created successfully.`);
      }

      setFormModalOpen(false);
      fetchDepartments();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setFormError(err.formattedMessage || 'Failed to save department.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handlers for Status Toggle
  const handleOpenStatusModal = (dept) => {
    setTargetStatusDepartment(dept);
    setStatusError('');
    setStatusModalOpen(true);
  };

  const handleStatusConfirm = async (id, newStatus) => {
    try {
      setStatusSubmitting(true);
      setStatusError('');
      await departmentService.updateDepartmentStatus(id, newStatus);
      setSuccessMessage(`Department status updated to ${newStatus}.`);
      setStatusModalOpen(false);
      fetchDepartments();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setStatusError(err.formattedMessage || 'Failed to update department status.');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Handlers for Manager Assignment
  const handleOpenManagerModal = (dept) => {
    setTargetManagerDepartment(dept);
    setManagerError('');
    setManagerModalOpen(true);
  };

  const handleManagerConfirm = async (id, managerId) => {
    try {
      setManagerSubmitting(true);
      setManagerError('');
      await departmentService.updateDepartmentManager(id, managerId);
      setSuccessMessage('Department manager updated successfully.');
      setManagerModalOpen(false);
      fetchDepartments();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setManagerError(err.formattedMessage || 'Failed to update department manager.');
    } finally {
      setManagerSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
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
              Departments & Teams
            </h1>
            <Badge variant="primary" size="md">
              {pagination.total} Units
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Organize teams, managers, and workforce allocation across WorkNest.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={fetchDepartments}
            disabled={loading}
            aria-label="Refresh departments list"
          >
            Refresh
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={handleOpenAdd}
            >
              Add Department
            </Button>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <Alert
          variant="success"
          title="Success"
          onDismiss={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Banner */}
      {error && (
        <Alert
          variant="destructive"
          title="Failed to Load Departments"
          onDismiss={() => setError('')}
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchDepartments} className="ml-4">
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* 2. Filter & Search Bar */}
      <DepartmentFilterBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        onAddDepartment={handleOpenAdd}
        canManage={isAdmin}
      />

      {/* 3. Content Area */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Spinner size="lg" label="Loading organizational departments..." />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            Fetching department structures...
          </p>
        </div>
      ) : departments.length === 0 ? (
        <div className="p-8 bg-card rounded-xl border border-border">
          <EmptyState
            icon={Building2}
            title={debouncedSearch || statusFilter !== 'ALL' ? 'No matching departments' : 'No departments configured'}
            description={
              debouncedSearch || statusFilter !== 'ALL'
                ? 'No departments match your current search and status filter criteria.'
                : 'Define organizational departments to structure staff allocation and management lines.'
            }
            action={
              debouncedSearch || statusFilter !== 'ALL' ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              ) : isAdmin ? (
                <Button variant="primary" size="sm" leftIcon={Plus} onClick={handleOpenAdd}>
                  Add First Department
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <DepartmentTable
            departments={departments}
            onEdit={handleOpenEdit}
            onToggleStatus={handleOpenStatusModal}
            onAssignManager={handleOpenManagerModal}
            canManage={isAdmin}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground">
              <div>
                Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
                <strong className="text-foreground">{pagination.totalPages}</strong> (
                {pagination.total} total departments)
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
      <DepartmentFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDepartment}
        isSubmitting={formSubmitting}
        error={formError}
      />

      {/* 5. Status Modal */}
      <DepartmentStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusConfirm}
        department={targetStatusDepartment}
        isSubmitting={statusSubmitting}
        error={statusError}
      />

      {/* 6. Assign Manager Modal */}
      <DepartmentManagerModal
        isOpen={managerModalOpen}
        onClose={() => setManagerModalOpen(false)}
        onConfirm={handleManagerConfirm}
        department={targetManagerDepartment}
        isSubmitting={managerSubmitting}
        error={managerError}
      />
    </div>
  );
};

export default DepartmentsPage;
