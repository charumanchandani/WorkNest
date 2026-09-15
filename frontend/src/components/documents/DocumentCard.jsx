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
import { Card, CardContent, Badge, Button } from '../ui';
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

export const DocumentCard = ({
  document: doc,
  onView,
  onDownload,
  onArchive,
  isAdmin = false,
  isDownloading = false,
  isArchiving = false,
}) => {
  const isArchived = doc.status === 'ARCHIVED';
  const isExpired = doc.isExpired;

  return (
    <Card
      className={`border-border shadow-subtle hover:border-teal-500/40 transition-all ${
        isArchived ? 'opacity-80 bg-muted/20' : ''
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Title & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5 border border-border/60">
              {getFileIcon(doc.mimeType, doc.originalFileName)}
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onView(doc)}
                className="font-semibold text-xs text-foreground hover:text-teal-600 dark:hover:text-teal-400 text-left block truncate max-w-[200px] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                {doc.title}
              </button>
              <span className="text-[10px] text-muted-foreground font-mono block truncate max-w-[190px]">
                {doc.originalFileName}
              </span>
            </div>
          </div>

          <Badge variant={getCategoryBadgeVariant(doc.category)} size="sm">
            {doc.category}
          </Badge>
        </div>

        {/* Description if present */}
        {doc.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {doc.description}
          </p>
        )}

        {/* Targeting & Size Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {doc.visibility === 'ORGANIZATION' ? (
              <div className="flex items-center gap-1 text-teal-700 dark:text-teal-300 font-medium">
                <Globe className="w-3 h-3" />
                <span>All Company</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-foreground font-medium">
                <Building className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className="truncate max-w-[120px]">{doc.department?.name || 'Department'}</span>
              </div>
            )}
          </div>

          <div className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded">
            {formatBytes(doc.size)}
          </div>
        </div>

        {/* Expiry / Status info */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {doc.expiresAt ? (
              <span className={isExpired ? 'text-destructive font-medium' : ''}>
                Exp: {formatDate(doc.expiresAt)}
              </span>
            ) : (
              <span>No expiry</span>
            )}
          </div>

          <div>
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
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(doc)}
            className="h-7 px-2 text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Details
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(doc)}
            disabled={isDownloading || (isArchived && !isAdmin)}
            className="h-7 px-2.5 text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            {isDownloading ? '...' : 'Download'}
          </Button>

          {isAdmin && !isArchived && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(doc)}
              disabled={isArchiving}
              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Archive className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
