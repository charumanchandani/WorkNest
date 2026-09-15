import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Download,
  Eye,
  Archive,
  Building,
  Globe,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Badge, Button, EmptyState } from '../ui';
import { formatBytes, formatDate } from '../../utils/formatters';

const getFileIcon = (mimeType = '', originalName = '') => {
  const name = originalName.toLowerCase();
  const mime = mimeType.toLowerCase();

  if (mime.includes('image') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    return <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
  }
  if (mime.includes('spreadsheet') || mime.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) {
    return <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />;
  }
  if (mime.includes('pdf') || name.endsWith('.pdf')) {
    return <File className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
  }
  if (mime.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) {
    return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  }
  return <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
};

const getCategoryBadgeVariant = (cat) => {
  switch (cat) {
    case 'POLICY':
      return 'primary';
    case 'HR':
      return 'secondary';
    case 'GUIDELINE':
      return 'warning';
    case 'FORM':
      return 'teal';
    case 'TRAINING':
      return 'success';
    default:
      return 'neutral';
  }
};

export const DocumentTable = ({
  documents = [],
  onView,
  onDownload,
  onArchive,
  isAdmin = false,
  downloadingId = null,
  archivingId = null,
}) => {
  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents found"
        description="No documents match your current filter criteria or permissions."
      />
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/60 text-muted-foreground border-b border-border uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th scope="col" className="py-3 px-4">Document / File</th>
              <th scope="col" className="py-3 px-4">Category</th>
              <th scope="col" className="py-3 px-4">Targeting</th>
              <th scope="col" className="py-3 px-4">Uploaded By</th>
              <th scope="col" className="py-3 px-4">Expiration</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((doc) => {
              const isArchived = doc.status === 'ARCHIVED';
              const isExpired = doc.isExpired;

              return (
                <tr
                  key={doc.id}
                  className={`hover:bg-secondary/40 transition-colors ${
                    isArchived ? 'opacity-75 bg-muted/20' : ''
                  }`}
                >
                  {/* Document & File Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-3 min-w-[220px]">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5 border border-border/60">
                        {getFileIcon(doc.mimeType, doc.originalFileName)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => onView(doc)}
                          className="font-semibold text-foreground hover:text-teal-600 dark:hover:text-teal-400 text-left block truncate max-w-[260px] transition-colors focus-visible:outline-none focus-visible:underline"
                        >
                          {doc.title}
                        </button>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="truncate max-w-[160px] font-mono text-[10px]">
                            {doc.originalFileName}
                          </span>
                          <span>•</span>
                          <span>{formatBytes(doc.size)}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={getCategoryBadgeVariant(doc.category)} size="sm">
                      {doc.category}
                    </Badge>
                  </td>

                  {/* Visibility & Department */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {doc.visibility === 'ORGANIZATION' ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span className="font-medium text-foreground">All Company</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="font-medium text-foreground">
                          {doc.department?.name || 'Department'}
                        </span>
                        {doc.department?.code && (
                          <span className="text-[10px] text-muted-foreground font-mono bg-secondary px-1 py-0.5 rounded">
                            {doc.department.code}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Uploaded By */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <span className="font-medium text-foreground block">
                        {doc.uploadedBy?.name || 'Operations'}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {formatDate(doc.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* Expiration */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {doc.expiresAt ? (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          isExpired ? 'text-destructive font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {isExpired && <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{formatDate(doc.expiresAt)}</span>
                        {isExpired && (
                          <span className="text-[10px] uppercase font-bold text-destructive">
                            (Expired)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isArchived ? (
                      <Badge variant="destructive" size="sm">
                        ARCHIVED
                      </Badge>
                    ) : isExpired ? (
                      <Badge variant="warning" size="sm">
                        EXPIRED
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        ACTIVE
                      </Badge>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(doc)}
                        title="View Metadata"
                        aria-label={`View metadata for ${doc.title}`}
                        className="h-7 px-2 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(doc)}
                        disabled={downloadingId === doc.id || (isArchived && !isAdmin)}
                        title="Download Document"
                        aria-label={`Download ${doc.originalFileName}`}
                        className="h-7 px-2 text-xs border-border"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        {downloadingId === doc.id ? '...' : 'Download'}
                      </Button>

                      {isAdmin && !isArchived && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onArchive(doc)}
                          disabled={archivingId === doc.id}
                          title="Archive Document"
                          aria-label={`Archive ${doc.title}`}
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentTable;
