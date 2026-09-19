import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Archive,
  Building,
  Globe,
  User,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck2,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Modal, Button, Badge } from '../ui';
import { formatBytes, formatDate, formatDateTime } from '../../utils/formatters';
import aiService from '../../services/aiService';

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

export const DocumentDetailModal = ({
  isOpen,
  onClose,
  document: doc,
  onDownload,
  onArchive,
  isAdmin = false,
  isDownloading = false,
  isArchiving = false,
}) => {
  const [aiSummary, setAiSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiError, setAiError] = useState('');

  // Reset AI summary state when doc or modal changes
  useEffect(() => {
    setAiSummary(null);
    setIsSummarizing(false);
    setAiError('');
  }, [doc?._id, isOpen]);

  if (!doc) return null;

  const isArchived = doc.status === 'ARCHIVED';
  const isExpired = doc.isExpired;

  const handleGenerateSummary = async () => {
    try {
      setIsSummarizing(true);
      setAiError('');
      const res = await aiService.getDocumentSummary(doc._id);
      if (res?.data?.data) {
        setAiSummary(res.data.data);
      }
    } catch (err) {
      setAiError(err.formattedMessage || 'Unable to generate document summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doc.title}
      description={`Category: ${doc.category} • Size: ${formatBytes(doc.size)}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Status Alert if Archived or Expired */}
        {isArchived && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This document is archived and is hidden from standard staff listings.</span>
          </div>
        )}

        {isExpired && !isArchived && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This document reached its expiration date ({formatDate(doc.expiresAt)}).</span>
          </div>
        )}

        {/* AI Summarize Toolbar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-foreground">AI Document Intelligence</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateSummary}
            isLoading={isSummarizing}
            disabled={isSummarizing}
            className="text-xs border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {aiSummary ? 'Regenerate Summary' : 'Summarize with AI'}
          </Button>
        </div>

        {aiError && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-600 dark:text-rose-400">
            {aiError}
          </div>
        )}

        {/* AI Summary Card */}
        {aiSummary && (
          <div className="p-4 rounded-xl bg-card border border-purple-200 dark:border-purple-900/60 space-y-3 shadow-subtle animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                AI Synthesis • {aiSummary.documentType || doc.category}
              </span>
              <Badge variant="outline" size="sm">
                Target: {aiSummary.targetAudience || 'General'}
              </Badge>
            </div>

            <p className="text-xs text-foreground leading-relaxed bg-secondary/30 p-3 rounded-lg border border-border/60">
              {aiSummary.summary}
            </p>

            {aiSummary.keyPoints?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-foreground block">Key Points</span>
                <ul className="space-y-1">
                  {aiSummary.keyPoints.map((pt, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiSummary.actionItems?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className="text-[11px] font-bold text-foreground block">Action Items</span>
                <ul className="space-y-1">
                  {aiSummary.actionItems.map((item, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiSummary.isSupported === false && (
              <p className="text-[11px] text-muted-foreground italic bg-secondary/40 p-2 rounded">
                Note: Binary file format previewed from indexed metadata. Plain-text files (.txt, .md, .csv) support full text analysis.
              </p>
            )}
          </div>
        )}

        {/* Description */}
        {doc.description ? (
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Description
            </span>
            <p className="text-xs text-foreground bg-secondary/40 p-3 rounded-lg border border-border/60 whitespace-pre-wrap leading-relaxed">
              {doc.description}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No additional description provided.
          </p>
        )}

        {/* Structured Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-card p-3 rounded-lg border border-border">
          {/* File Name */}
          <div className="space-y-0.5 col-span-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">
              Original File Name
            </span>
            <span className="font-mono text-xs text-foreground block break-all">
              {doc.originalFileName}
            </span>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Category
            </span>
            <Badge variant={getCategoryBadgeVariant(doc.category)} size="sm">
              {doc.category}
            </Badge>
          </div>

          {/* Visibility */}
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Visibility Scope
            </span>
            {doc.visibility === 'ORGANIZATION' ? (
              <div className="flex items-center gap-1 text-teal-700 dark:text-teal-300 font-medium">
                <Globe className="w-3.5 h-3.5" />
                <span>All Company</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-foreground font-medium">
                <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{doc.department?.name || 'Department Specific'}</span>
              </div>
            )}
          </div>

          {/* Uploaded By */}
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Uploaded By
            </span>
            <div className="flex items-center gap-1 text-foreground">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{doc.uploadedBy?.name || 'Operations'}</span>
            </div>
          </div>

          {/* Upload Date */}
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Uploaded Date
            </span>
            <div className="flex items-center gap-1 text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{formatDate(doc.createdAt)}</span>
            </div>
          </div>

          {/* Expiration */}
          <div className="space-y-0.5 col-span-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Expiration Date
            </span>
            <div className="flex items-center gap-1 text-foreground">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{doc.expiresAt ? formatDateTime(doc.expiresAt) : 'No Expiration (Indefinite)'}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            {isAdmin && !isArchived && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onArchive(doc)}
                disabled={isArchiving}
                className="text-xs"
              >
                <Archive className="w-3.5 h-3.5 mr-1" />
                {isArchiving ? 'Archiving...' : 'Archive Document'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => onDownload(doc)}
              disabled={isDownloading || (isArchived && !isAdmin)}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {isDownloading ? 'Downloading...' : 'Download Document'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentDetailModal;
