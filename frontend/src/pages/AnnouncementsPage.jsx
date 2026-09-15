import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Spinner, Alert, Badge, EmptyState } from '../components/ui';
import {
  AnnouncementCard,
  AnnouncementFilterBar,
  AnnouncementFormModal,
} from '../components/announcements';
import announcementService from '../services/announcementService';
import departmentService from '../services/departmentService';

export const AnnouncementsPage = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  // Data state
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [targetType, setTargetType] = useState('');
  const [department, setDepartment] = useState('');

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Fetch departments
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

  // Fetch announcements
  const fetchAnnouncements = useCallback(
    async (pageToLoad = 1) => {
      try {
        setIsLoading(true);
        setError('');

        const params = {
          page: pageToLoad,
          limit: 10,
        };

        if (search.trim()) params.search = search.trim();
        if (targetType) params.targetType = targetType;
        if (department) params.department = department;

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
        setError(err.formattedMessage || 'Failed to load announcements.');
      } finally {
        setIsLoading(false);
      }
    },
    [search, targetType, department]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAnnouncements]);

  const handleCreateSuccess = async (payload) => {
    await announcementService.createAnnouncement(payload);
    setSuccessMessage(
      payload.status === 'PUBLISHED'
        ? 'Announcement published successfully to company feed.'
        : 'Announcement saved as draft.'
    );
    setTimeout(() => setSuccessMessage(''), 4000);
    fetchAnnouncements(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setTargetType('');
    setDepartment('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Megaphone className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              Company Announcements
            </h1>
            <Badge variant="teal" size="md">
              Live Feed
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Stay up to date with organizational broadcasts, operational news, and team notices.
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

          {isManagerOrAdmin && (
            <Link to="/app/announcements/manage">
              <Button variant="outline" size="sm" className="text-xs border-border">
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Manage
              </Button>
            </Link>
          )}

          {isManagerOrAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsFormModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Announcement
            </Button>
          )}
        </div>
      </div>

      {/* 2. Success & Error alerts */}
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

      {/* 3. Filter Bar */}
      <AnnouncementFilterBar
        search={search}
        onSearchChange={setSearch}
        targetType={targetType}
        onTargetTypeChange={setTargetType}
        department={department}
        onDepartmentChange={setDepartment}
        departments={departments}
        showStatusFilter={false}
        onReset={handleResetFilters}
      />

      {/* 4. Announcements Grid */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 bg-card rounded-xl border border-border">
          <Spinner size="lg" />
          <span className="text-xs text-muted-foreground">Loading announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements published yet"
          description="There are currently no active announcements matching your query."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <AnnouncementCard key={ann.id} announcement={ann} />
            ))}
          </div>

          {/* 5. Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
              <span>
                Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
                <strong className="text-foreground">{pagination.totalPages}</strong> (
                {pagination.total} total announcements)
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
      {isManagerOrAdmin && (
        <AnnouncementFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleCreateSuccess}
          departments={departments}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

export default AnnouncementsPage;
