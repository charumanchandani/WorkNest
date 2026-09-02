import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  Edit2,
  UserX,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Clock,
  Calendar,
  Eye,
  Mail,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Spinner, Alert } from '../components/ui';
import {
  DepartmentFormModal,
  DepartmentStatusModal,
  DepartmentManagerModal,
} from '../components/departments';
import departmentService from '../services/departmentService';

export const DepartmentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchDepartment = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await departmentService.getDepartment(id);
      if (res?.data) {
        setDepartment(res.data.department);
        setEmployees(res.data.employees || []);
      }
    } catch (err) {
      setError(err.formattedMessage || 'Unable to retrieve department details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  const handleEditSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setModalError('');
      const res = await departmentService.updateDepartment(id, formData);
      if (res?.data?.department) {
        setDepartment((prev) => ({
          ...prev,
          ...res.data.department,
        }));
      }
      setSuccessMessage('Department details updated successfully.');
      setEditModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusConfirm = async (targetId, newStatus) => {
    try {
      setIsSubmitting(true);
      setModalError('');
      const res = await departmentService.updateDepartmentStatus(targetId, newStatus);
      if (res?.data?.department) {
        setDepartment((prev) => ({
          ...prev,
          ...res.data.department,
        }));
      }
      setSuccessMessage(`Department status updated to ${newStatus}.`);
      setStatusModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManagerConfirm = async (targetId, managerId) => {
    try {
      setIsSubmitting(true);
      setModalError('');
      const res = await departmentService.updateDepartmentManager(targetId, managerId);
      if (res?.data?.department) {
        setDepartment((prev) => ({
          ...prev,
          ...res.data.department,
        }));
      }
      setSuccessMessage('Department manager updated successfully.');
      setManagerModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update manager.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
        <Spinner size="lg" label="Loading department details..." />
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          Retrieving organizational structure...
        </p>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="space-y-4">
        <Link
          to="/app/departments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Departments</span>
        </Link>

        <Alert variant="destructive" title="Department Not Found">
          {error || 'The requested department does not exist.'}
        </Alert>
      </div>
    );
  }

  const isAct = department.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/app/departments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Departments</span>
        </Link>
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

      {/* Header Department Card */}
      <Card className="shadow-dialog border-border">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-2xl flex items-center justify-center border border-border shadow-subtle shrink-0">
                <Building2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {department.name}
                  </h1>
                  <Badge variant="primary" size="md" className="font-mono font-bold">
                    {department.code}
                  </Badge>
                  <Badge variant={isAct ? 'success' : 'outline'} size="md" dot={isAct}>
                    {isAct ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  {department.description || 'No description provided for this department.'}
                </p>
              </div>
            </div>

            {/* Admin Management Actions */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={UserPlus}
                  onClick={() => setManagerModalOpen(true)}
                >
                  Manage Lead
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  leftIcon={Edit2}
                  onClick={() => setEditModalOpen(true)}
                >
                  Edit Unit
                </Button>

                <Button
                  variant={isAct ? 'destructive' : 'primary'}
                  size="md"
                  leftIcon={isAct ? UserX : UserCheck}
                  onClick={() => setStatusModalOpen(true)}
                >
                  {isAct ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Department Metrics & Leadership Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Department Lead Card */}
        <Card className="shadow-subtle border-border md:col-span-2">
          <CardHeader className="p-6 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <CardTitle className="text-sm font-bold">Department Leadership</CardTitle>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setManagerModalOpen(true)}
                  className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                >
                  Change Lead
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {department.manager?.name ? (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border/80 bg-secondary/30">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-subtle">
                  {department.manager.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {department.manager.name}
                    </span>
                    <Badge variant="warning" size="sm">
                      {department.manager.role}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground block">
                    {department.manager.jobTitle || 'Department Lead'}
                  </span>
                  <span className="text-[11px] text-muted-foreground block font-mono">
                    {department.manager.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border bg-secondary/20 text-center space-y-2">
                <span className="text-xs text-muted-foreground block font-medium">
                  No department manager is currently assigned to {department.name}.
                </span>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={UserPlus}
                    onClick={() => setManagerModalOpen(true)}
                  >
                    Assign Department Lead
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Statistics Card */}
        <Card className="shadow-subtle border-border">
          <CardHeader className="p-6 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <CardTitle className="text-sm font-bold">Team Allocation</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div>
              <span className="text-3xl font-extrabold tracking-tight text-foreground block">
                {department.employeeCount}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Active staff members assigned
              </span>
            </div>

            <div className="pt-3 border-t border-border/60 text-xs space-y-1.5 text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Created Date</span>
                <span className="text-foreground font-medium">
                  {formatDate(department.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Operational Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {department.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Employees List */}
      <Card className="shadow-subtle border-border">
        <CardHeader className="p-6 pb-3 border-b border-border flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <CardTitle className="text-sm font-bold">Assigned Department Personnel</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Staff members enrolled in {department.name}
            </CardDescription>
          </div>

          <Link
            to={`/app/employees?department=${department.id}`}
            className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
          >
            Open in Employee Directory &rarr;
          </Link>
        </CardHeader>

        <CardContent className="p-6">
          {employees.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No employees are currently assigned to this department.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-secondary/40 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-border shrink-0">
                        {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/app/employees/${emp.id}`}
                          className="font-semibold text-xs text-foreground hover:text-teal-600 transition-colors block truncate"
                        >
                          {emp.name}
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          {emp.employeeId || '—'}
                        </span>
                      </div>
                    </div>

                    <Badge variant={emp.role === 'ADMIN' ? 'destructive' : emp.role === 'MANAGER' ? 'warning' : 'primary'} size="sm">
                      {emp.role}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="truncate">{emp.jobTitle}</span>
                    <Link
                      to={`/app/employees/${emp.id}`}
                      className="text-teal-600 dark:text-teal-400 hover:underline shrink-0"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <DepartmentFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={department}
        isSubmitting={isSubmitting}
        error={modalError}
      />

      <DepartmentStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusConfirm}
        department={department}
        isSubmitting={isSubmitting}
        error={modalError}
      />

      <DepartmentManagerModal
        isOpen={managerModalOpen}
        onClose={() => setManagerModalOpen(false)}
        onConfirm={handleManagerConfirm}
        department={department}
        isSubmitting={isSubmitting}
        error={modalError}
      />
    </div>
  );
};

export default DepartmentDetailPage;
