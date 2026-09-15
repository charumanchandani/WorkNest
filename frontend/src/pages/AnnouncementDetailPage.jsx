import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Megaphone,
  ArrowLeft,
  Building,
  Globe,
  User,
  Calendar,
  Clock,
  Send,
  FileEdit,
  Archive,
  AlertCircle,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Spinner, Alert } from '../components/ui';
import { AnnouncementFormModal } from '../components/announcements';
import announcementService from '../services/announcementService';
import departmentService from '../services/departmentService';
import { formatDate, formatDateTime } from '../utils/formatters';

export const AnnouncementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [announcement, setAnnouncement] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Action states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await announcementService.getAnnouncementById(id);
        if (res?.data?.announcement) {
          setAnnouncement(res.data.announcement);
        }
      } catch (err) {
        setError(err.formattedMessage || 'Failed to load announcement details.');
      } finally {
        setIsLoading(false);
      }
    };

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

    if (id) {
      fetchAnnouncement();
      fetchDepartments();
    }
  }, [id]);

  const handleEditSubmit = async (payload) => {
    const res = await announcementService.updateAnnouncement(id, payload);
    if (res?.data?.announcement) {
      setAnnouncement(res.data.announcement);
    }
    setSuccessMessage('Announcement updated successfully.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const res = await announcementService.publishAnnouncement(id);
      if (res?.data?.announcement) {
        setAnnouncement(res.data.announcement);
      }
      setSuccessMessage('Announcement published successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to publish announcement.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this announcement?')) {
      return;
    }

    try {
      setIsArchiving(true);
      const res = await announcementService.archiveAnnouncement(id);
      if (res?.data?.announcement) {
        setAnnouncement(res.data.announcement);
      }
      setSuccessMessage('Announcement was archived.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to archive announcement.');
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 bg-card rounded-xl border border-border">
        <Spinner size="lg" />
        <span className="text-xs text-muted-foreground">Loading announcement...</span>
      </div>
    );
  }

  if (error && !announcement) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/announcements')}
          className="text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Announcements
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  const isAuthor = announcement?.createdBy?.id === user?.id;
  const isManager = user?.role === 'MANAGER';
  const isDraft = announcement?.status === 'DRAFT';
  const isArchived = announcement?.status === 'ARCHIVED';
  const isExpired = announcement?.isExpired;
  const canManage = isAdmin || (isManager && (isAuthor || isDraft));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/announcements')}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Feed
        </Button>

        {canManage && (
          <div className="flex items-center gap-2">
            {isDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFormModalOpen(true)}
                className="text-xs border-border"
              >
                <FileEdit className="w-3.5 h-3.5 mr-1" />
                Edit Draft
              </Button>
            )}

            {isDraft && (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublish}
                disabled={isPublishing}
                className="text-xs bg-teal-600 hover:bg-teal-700"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
            )}

            {!isArchived && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleArchive}
                disabled={isArchiving}
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Archive className="w-3.5 h-3.5 mr-1" />
                Archive
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 2. Feedback Alerts */}
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

      {/* 3. Main Announcement Article Card */}
      <Card className="border-border shadow-subtle overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-secondary/40 border-b border-border p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {announcement.targetType === 'ORGANIZATION' ? (
                <Badge variant="teal" size="sm" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>All Company</span>
                </Badge>
              ) : (
                <Badge variant="warning" size="sm" className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span>{announcement.department?.name || 'Department'}</span>
                  {announcement.department?.code && (
                    <span className="font-mono text-[9px]">({announcement.department.code})</span>
                  )}
                </Badge>
              )}

              {isDraft && <Badge variant="warning" size="sm">DRAFT</Badge>}
              {isArchived && <Badge variant="destructive" size="sm">ARCHIVED</Badge>}
              {isExpired && !isArchived && !isDraft && <Badge variant="secondary" size="sm">EXPIRED</Badge>}
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {announcement.publishedAt
                  ? `Published on ${formatDate(announcement.publishedAt)}`
                  : `Created on ${formatDate(announcement.createdAt)}`}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {announcement.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-[10px]">
                {announcement.createdBy?.name?.[0] || 'A'}
              </div>
              <span className="font-semibold text-foreground">
                {announcement.createdBy?.name || 'Operations Lead'}
              </span>
              {announcement.createdBy?.jobTitle && (
                <span>• {announcement.createdBy.jobTitle}</span>
              )}
            </div>

            {announcement.expiresAt && (
              <div className="ml-auto flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Expires: {formatDateTime(announcement.expiresAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Body (Strictly plain text with whitespace preservation) */}
        <CardContent className="p-6 sm:p-8">
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-normal">
            {announcement.content}
          </div>
        </CardContent>
      </Card>

      {/* 4. Edit Modal */}
      {canManage && (
        <AnnouncementFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleEditSubmit}
          initialData={announcement}
          departments={departments}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

export default AnnouncementDetailPage;
