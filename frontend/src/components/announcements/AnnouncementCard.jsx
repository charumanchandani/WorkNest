import React from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Building,
  Globe,
  User,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  FileEdit,
  Send,
  Archive,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '../ui';
import { formatDate } from '../../utils/formatters';


export const AnnouncementCard = ({
  announcement: ann,
  showManagementActions = false,
  onEdit,
  onPublish,
  onArchive,
  isPublishing = false,
  isArchiving = false,
}) => {
  const isDraft = ann.status === 'DRAFT';
  const isArchived = ann.status === 'ARCHIVED';
  const isExpired = ann.isExpired;

  return (
    <Card
      className={`border-border shadow-subtle hover:border-teal-500/40 transition-all ${
        isArchived ? 'opacity-75 bg-muted/20' : isDraft ? 'border-dashed border-amber-500/40 bg-amber-500/5' : ''
      }`}
    >
      <CardContent className="p-5 space-y-3.5">
        {/* Header: Targeting badge & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {ann.targetType === 'ORGANIZATION' ? (
              <Badge variant="teal" size="sm" className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>All Company</span>
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" className="flex items-center gap-1">
                <Building className="w-3 h-3" />
                <span>{ann.department?.name || 'Department'}</span>
                {ann.department?.code && (
                  <span className="font-mono text-[9px] opacity-80">({ann.department.code})</span>
                )}
              </Badge>
            )}

            {isDraft && (
              <Badge variant="warning" size="sm">
                DRAFT
              </Badge>
            )}

            {isArchived && (
              <Badge variant="destructive" size="sm">
                ARCHIVED
              </Badge>
            )}

            {isExpired && !isArchived && !isDraft && (
              <Badge variant="secondary" size="sm">
                EXPIRED
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {ann.publishedAt ? formatDate(ann.publishedAt) : `Created ${formatDate(ann.createdAt)}`}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
          <Link to={`/app/announcements/${ann.id}`} className="focus-visible:outline-none focus-visible:underline">
            {ann.title}
          </Link>
        </h3>

        {/* Plain Text Content (Strictly plain text, no HTML injection) */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-line">
          {ann.content}
        </p>

        {/* Author & Expiry Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{ann.createdBy?.name || 'Operations Lead'}</span>
            {ann.createdBy?.jobTitle && (
              <span className="text-[11px] text-muted-foreground">• {ann.createdBy.jobTitle}</span>
            )}
          </div>

          {ann.expiresAt && (
            <div
              className={`flex items-center gap-1 text-[11px] ${
                isExpired ? 'text-destructive font-medium' : 'text-muted-foreground'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Expires: {formatDate(ann.expiresAt)}</span>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <Link
            to={`/app/announcements/${ann.id}`}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 group focus-visible:outline-none focus-visible:underline"
          >
            <span>Read full announcement</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {showManagementActions && (
            <div className="flex items-center gap-1.5">
              {isDraft && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(ann)}
                  className="h-7 px-2 text-xs"
                >
                  <FileEdit className="w-3.5 h-3.5 mr-1" />
                  Edit Draft
                </Button>
              )}

              {isDraft && onPublish && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onPublish(ann)}
                  disabled={isPublishing}
                  className="h-7 px-2.5 text-xs bg-teal-600 hover:bg-teal-700"
                >
                  <Send className="w-3 h-3 mr-1" />
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </Button>
              )}

              {!isArchived && onArchive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onArchive(ann)}
                  disabled={isArchiving}
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Archive className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
