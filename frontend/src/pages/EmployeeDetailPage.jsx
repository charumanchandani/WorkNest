import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Shield,
  Edit2,
  UserX,
  UserCheck,
  Building2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Spinner, Alert } from '../components/ui';
import { EmployeeFormModal, EmployeeStatusModal } from '../components/employees';
import employeeService from '../services/employeeService';

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await employeeService.getEmployee(id);
      if (res?.data?.employee) {
        setEmployee(res.data.employee);
      }
    } catch (err) {
      setError(err.formattedMessage || 'Unable to retrieve employee details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleEditSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setModalError('');
      const res = await employeeService.updateEmployee(id, formData);
      if (res?.data?.employee) {
        setEmployee(res.data.employee);
      }
      setSuccessMessage('Employee profile updated successfully.');
      setEditModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update employee profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusConfirm = async (targetId, newStatus) => {
    try {
      setIsSubmitting(true);
      setModalError('');
      const res = await employeeService.updateEmployeeStatus(targetId, newStatus);
      if (res?.data?.employee) {
        setEmployee(res.data.employee);
      }
      setSuccessMessage(`Employee status updated to ${newStatus}.`);
      setStatusModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setModalError(err.formattedMessage || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'MANAGER':
        return 'warning';
      default:
        return 'primary';
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
        <Spinner size="lg" label="Loading employee details..." />
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          Retrieving employee profile...
        </p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-4">
        <Link
          to="/app/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
        </Link>

        <Alert variant="destructive" title="Employee Not Found">
          {error || 'The requested employee profile does not exist.'}
        </Alert>
      </div>
    );
  }

  const isAct = employee.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/app/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
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

      {/* Header Profile Card */}
      <Card className="shadow-dialog border-border">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-2xl flex items-center justify-center border border-border shadow-subtle shrink-0">
                {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {employee.name}
                  </h1>
                  <Badge variant={getRoleBadgeVariant(employee.role)} size="md">
                    {employee.role}
                  </Badge>
                  <Badge variant={isAct ? 'success' : 'outline'} size="md" dot={isAct}>
                    {isAct ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-sm font-medium text-muted-foreground">
                  {employee.jobTitle} &bull;{' '}
                  <span className="font-mono text-foreground font-semibold">
                    {employee.employeeId || 'ID Pending'}
                  </span>
                </p>
              </div>
            </div>

            {/* Admin Management Actions */}
            {isAdmin && (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={Edit2}
                  onClick={() => setEditModalOpen(true)}
                >
                  Edit Profile
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

      {/* Profile Detail Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Workplace & Role Information */}
        <Card className="shadow-subtle border-border">
          <CardHeader className="p-6 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <CardTitle className="text-sm font-bold">Workplace & Assignment</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Role, schedule, and organization details
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Employee ID
                </span>
                <span className="font-mono font-semibold text-foreground text-sm">
                  {employee.employeeId || '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Role Classification
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {employee.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  Job Title
                </span>
                <span className="font-semibold text-foreground">{employee.jobTitle}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Department
                </span>
                {employee.department?.name ? (
                  <Link
                    to={`/app/departments/${employee.department.id}`}
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>{employee.department.name}</span>
                    <span className="font-mono text-[10px] opacity-75">
                      [{employee.department.code}]
                    </span>
                  </Link>
                ) : (
                  <span className="text-muted-foreground italic">Unassigned</span>
                )}
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Date of Joining
                </span>
                <span className="font-semibold text-foreground">
                  {formatDate(employee.joiningDate)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  Workplace Location
                </span>
                <span className="font-semibold text-foreground">
                  {employee.location || 'Remote'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Contact & Authentication Information */}
        <Card className="shadow-subtle border-border">
          <CardHeader className="p-6 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <CardTitle className="text-sm font-bold">Contact & Credentials</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Account accessibility and communication
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Account Status
                </span>
                <span className={`font-semibold text-sm ${isAct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {employee.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Access Level
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {isAct ? 'Authorized' : 'Suspended'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Work Email
                </span>
                <span className="font-semibold text-foreground font-mono">{employee.email}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Contact Phone
                </span>
                <span className="font-semibold text-foreground">{employee.phone || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  Enrollment Date
                </span>
                <span className="text-muted-foreground">{formatDate(employee.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Security Policy
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  HttpOnly RBAC Protected
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <EmployeeFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={employee}
        isSubmitting={isSubmitting}
        error={modalError}
      />

      {/* Status Toggle Modal */}
      <EmployeeStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusConfirm}
        employee={employee}
        isSubmitting={isSubmitting}
        error={modalError}
      />
    </div>
  );
};

export default EmployeeDetailPage;
