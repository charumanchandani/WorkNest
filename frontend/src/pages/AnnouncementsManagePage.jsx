import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ListTodo,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Spinner, Alert, Badge } from '../components/ui';
import {
  AnnouncementFilterBar,
  AnnouncementManagementTable,
  AnnouncementFormModal,
} from '../components/announcements';
import announcementService from '../services/announcementService';
import departmentService from '../services/departmentService';

export const AnnouncementsManagePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Data state
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter state
  const [search, setSearch] = useState('');
  const [targetType, setTargetType] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  // Action states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [archivingId, setArchivingId] = useState(null);

  // Fetch active departments for selector
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentService.getDepartments({ limit: 100, status: 'ACTIVE' });
        if (res?.data?.records) {
          setDepartments(res.data.records);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch announcements in management mode
  const fetchAnnouncements = useCallback(
    async (pageToLoad = 1) => {
      try {
        setIsLoading(true);
        setError('');

        const params = {
          page: pageToLoad,
          limit: 10,
          mode: 'manage',
        };

        if (search.trim()) params.search = search.trim();
        if (targetType) params.targetType = targetType;
        if (department) params.department = department;
        if (status) params.status = status;

        const res = await announcementService.getAnnouncements(params);

        if (res?.data) {
          setAnnouncements(res.data.records || []);
          setPagination({
            page: res.data.page || 1,
            limit: res.data.limit || 10,
            total: res.data.total || 0,
            totalPages: res.data.totalPages || 1,
          });
        }
      } catch (err) {
        setError(err.formattedMessage || 'Failed to load announcements for management.');
      } finally {
        setIsLoading(false);
      }
    },
    [search, targetType, department, status]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAnnouncements]);

  const handleFormSubmit = async (payload) => {
    if (editingAnnouncement) {
      await announcementService.updateAnnouncement(editingAnnouncement.id, payload);
      setSuccessMessage('Announcement updated successfully.');
    } else {
      await announcementService.createAnnouncement(payload);
      setSuccessMessage(
        payload.status === 'PUBLISHED'
          ? 'Announcement published successfully.'
          : 'Announcement saved as draft.'
      );
    }
    setTimeout(() => setSuccessMessage(''), 4000);
    setEditingAnnouncement(null);
    fetchAnnouncements(pagination.page);
  };

  const handlePublish = async (ann) => {
    try {
      setPublishingId(ann.id);
      await announcementService.publishAnnouncement(ann.id);
      setSuccessMessage(`Announcement "${ann.title}" was published.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchAnnouncements(pagination.page);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to publish announcement.');
    } finally {
      setPublishingId(null);
    }
  };

  const handleArchive = async (ann) => {
    if (!window.confirm(`Are you sure you want to archive "${ann.title}"?`)) {
      return;
    }

    try {
      setArchivingId(ann.id);
      await announcementService.archiveAnnouncement(ann.id);
      setSuccessMessage(`Announcement "${ann.title}" was archived.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchAnnouncements(pagination.page);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to archive announcement.');
    } finally {
      setArchivingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setTargetType('');
    setDepartment('');
    setStatus('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Link
              to="/app/announcements"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Back to Feed"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Megaphone className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              Announcement Management
            </h1>
            <Badge variant="warning" size="md">
              {isAdmin ? 'Organization Scope' : 'Team Scope'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Author, review, publish, and archive company broadcasts and department bulletins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnnouncements(pagination.page)}
            disabled={isLoading}
            className="text-xs border-border"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingAnnouncement(null);
              setIsFormModalOpen(true);
            }}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Announcement
          </Button>
        </div>
      </div>

      {/* 2. Success and Error feedback */}
      {successMessage && (
        <Alert variant="success" className="text-xs">
          <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
          <span>{successMessage}</span>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="text-xs">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </Alert>
      )}

      {/* 3. Filters */}
      <AnnouncementFilterBar
        search={search}
        onSearchChange={setSearch}
        targetType={targetType}
        onTargetTypeChange={setTargetType}
        department={department}
        onDepartmentChange={setDepartment}
        status={status}
        onStatusChange={setStatus}
        departments={departments}
        showStatusFilter={true}
        onReset={handleResetFilters}
      />

      {/* 4. Management Table */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 bg-card rounded-xl border border-border">
          <Spinner size="lg" />
          <span className="text-xs text-muted-foreground">Loading announcements...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <AnnouncementManagementTable
            announcements={announcements}
            onEdit={(ann) => {
              setEditingAnnouncement(ann);
              setIsFormModalOpen(true);
            }}
            onPublish={handlePublish}
            onArchive={handleArchive}
            publishingId={publishingId}
            archivingId={archivingId}
            currentUserId={user?.id}
            isAdmin={isAdmin}
          />

          {/* 5. Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
              <span>
                Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
                <strong className="text-foreground">{pagination.totalPages}</strong> (
                {pagination.total} total records)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAnnouncements(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                  className="h-8 text-xs border-border"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAnnouncements(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                  className="h-8 text-xs border-border"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Form Modal */}
      {isFormModalOpen && (
        <AnnouncementFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingAnnouncement}
          departments={departments}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

export default AnnouncementsManagePage;
