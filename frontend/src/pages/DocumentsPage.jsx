import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Spinner, Alert, Badge } from '../components/ui';
import {
  DocumentFilterBar,
  DocumentTable,
  DocumentCard,
  DocumentUploadModal,
  DocumentDetailModal,
} from '../components/documents';
import documentService from '../services/documentService';
import departmentService from '../services/departmentService';

export const DocumentsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Data state
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState(isAdmin ? '' : 'ACTIVE');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocForDetail, setSelectedDocForDetail] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [archivingId, setArchivingId] = useState(null);

  // Fetch departments for filter and upload modal
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

  // Fetch documents list
  const fetchDocuments = useCallback(
    async (pageToLoad = 1) => {
      try {
        setIsLoading(true);
        setError('');

        const params = {
          page: pageToLoad,
          limit: 10,
        };

        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;
        if (visibility) params.visibility = visibility;
        if (department) params.department = department;
        if (isAdmin && status) params.status = status;

        const res = await documentService.getDocuments(params);

        if (res?.data) {
          setDocuments(res.data.records || []);
          setPagination({
            page: res.data.page || 1,
            limit: res.data.limit || 10,
            total: res.data.total || 0,
            totalPages: res.data.totalPages || 1,
          });
        }
      } catch (err) {
        setError(err.formattedMessage || 'Failed to load documents.');
      } finally {
        setIsLoading(false);
      }
    },
    [search, category, visibility, department, status, isAdmin]
  );

  // Trigger search / filter on change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchDocuments]);

  // Handle document upload
  const handleUploadSuccess = async (formData) => {
    await documentService.uploadDocument(formData);
    setSuccessMessage('Document uploaded successfully to the vault.');
    setTimeout(() => setSuccessMessage(''), 4000);
    fetchDocuments(1);
  };

  // Handle document download
  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc.id);
      await documentService.downloadDocument(doc.id, doc.originalFileName);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to download document.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle document archive (Admin only)
  const handleArchive = async (doc) => {
    if (!window.confirm(`Are you sure you want to archive "${doc.title}"?`)) {
      return;
    }

    try {
      setArchivingId(doc.id);
      await documentService.archiveDocument(doc.id);
      setSuccessMessage(`Document "${doc.title}" was archived.`);
      setTimeout(() => setSuccessMessage(''), 4000);

      if (selectedDocForDetail?.id === doc.id) {
        setSelectedDocForDetail(null);
      }

      fetchDocuments(pagination.page);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to archive document.');
    } finally {
      setArchivingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setVisibility('');
    setDepartment('');
    setStatus(isAdmin ? '' : 'ACTIVE');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              Document Vault
            </h1>
            <Badge variant="teal" size="md">
              Secure Repository
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Access organization policies, guidelines, forms, and departmental reference materials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDocuments(pagination.page)}
            disabled={isLoading}
            className="text-xs border-border"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload Document
            </Button>
          )}
        </div>
      </div>

      {/* 2. Success and Error Feedbacks */}
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
      <DocumentFilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        department={department}
        onDepartmentChange={setDepartment}
        status={status}
        onStatusChange={setStatus}
        departments={departments}
        isAdmin={isAdmin}
        onReset={handleResetFilters}
      />

      {/* 4. Documents View (Desktop Table & Mobile Cards) */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 bg-card rounded-xl border border-border">
          <Spinner size="lg" />
          <span className="text-xs text-muted-foreground">Loading vault documents...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop structured table */}
          <div className="hidden md:block">
            <DocumentTable
              documents={documents}
              onView={(doc) => setSelectedDocForDetail(doc)}
              onDownload={handleDownload}
              onArchive={handleArchive}
              isAdmin={isAdmin}
              downloadingId={downloadingId}
              archivingId={archivingId}
            />
          </div>

          {/* Mobile responsive cards */}
          <div className="md:hidden space-y-3">
            {documents.length === 0 ? (
              <div className="p-8 text-center bg-card rounded-xl border border-border">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <span className="text-xs font-semibold text-foreground block">
                  No documents found
                </span>
                <span className="text-[11px] text-muted-foreground block mt-1">
                  Try adjusting your search or filters.
                </span>
              </div>
            ) : (
              documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={(d) => setSelectedDocForDetail(d)}
                  onDownload={handleDownload}
                  onArchive={handleArchive}
                  isAdmin={isAdmin}
                  isDownloading={downloadingId === doc.id}
                  isArchiving={archivingId === doc.id}
                />
              ))
            )}
          </div>

          {/* 5. Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
              <span>
                Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
                <strong className="text-foreground">{pagination.totalPages}</strong> (
                {pagination.total} total documents)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDocuments(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                  className="h-8 text-xs border-border"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDocuments(pagination.page + 1)}
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

      {/* 6. Upload Modal (Admin only) */}
      {isAdmin && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
          departments={departments}
        />
      )}

      {/* 7. Document Detail Modal */}
      {selectedDocForDetail && (
        <DocumentDetailModal
          isOpen={Boolean(selectedDocForDetail)}
          onClose={() => setSelectedDocForDetail(null)}
          document={selectedDocForDetail}
          onDownload={handleDownload}
          onArchive={handleArchive}
          isAdmin={isAdmin}
          isDownloading={downloadingId === selectedDocForDetail?.id}
          isArchiving={archivingId === selectedDocForDetail?.id}
        />
      )}
    </div>
  );
};

export default DocumentsPage;
