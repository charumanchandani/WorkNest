import React from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Globe,
  Building,
  User,
  Calendar,
  Clock,
  Send,
  FileEdit,
  Archive,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { Badge, Button, EmptyState } from '../ui';
import { formatDate } from '../../utils/formatters';


export const AnnouncementManagementTable = ({
  announcements = [],
  onEdit,
  onPublish,
  onArchive,
  publishingId = null,
  archivingId = null,
  currentUserId,
  isAdmin = false,
}) => {
  if (!announcements || announcements.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No announcements found"
        description="No announcements found for your managed department or criteria."
      />
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/60 text-muted-foreground border-b border-border uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th scope="col" className="py-3 px-4">Title & Notice</th>
              <th scope="col" className="py-3 px-4">Target Audience</th>
              <th scope="col" className="py-3 px-4">Author</th>
              <th scope="col" className="py-3 px-4">Schedule / Dates</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {announcements.map((ann) => {
              const isDraft = ann.status === 'DRAFT';
              const isArchived = ann.status === 'ARCHIVED';
              const isExpired = ann.isExpired;
              const isAuthor = ann.createdBy?.id === currentUserId;
              const canEdit = isDraft && (isAdmin || isAuthor);

              return (
                <tr
                  key={ann.id}
                  className={`hover:bg-secondary/40 transition-colors ${
                    isArchived ? 'opacity-75 bg-muted/20' : ''
                  }`}
                >
                  {/* Title & Preview */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 min-w-[220px]">
                      <Link
                        to={`/app/announcements/${ann.id}`}
                        className="font-semibold text-foreground hover:text-teal-600 dark:hover:text-teal-400 block truncate max-w-[280px] transition-colors focus-visible:outline-none focus-visible:underline"
                      >
                        {ann.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-[280px]">
                        {ann.content}
                      </p>
                    </div>
                  </td>

                  {/* Target Audience */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {ann.targetType === 'ORGANIZATION' ? (
                      <div className="flex items-center gap-1 text-xs text-teal-700 dark:text-teal-300 font-medium">
                        <Globe className="w-3.5 h-3.5" />
                        <span>All Company</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="font-medium text-foreground">
                          {ann.department?.name || 'Department'}
                        </span>
                        {ann.department?.code && (
                          <span className="text-[10px] text-muted-foreground font-mono bg-secondary px-1 py-0.5 rounded">
                            {ann.department.code}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Author */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <span className="font-medium text-foreground block">
                        {ann.createdBy?.name || 'Operations'}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {ann.createdBy?.role || 'Staff'}
                      </span>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {ann.publishedAt
                            ? `Published: ${formatDate(ann.publishedAt)}`
                            : `Created: ${formatDate(ann.createdAt)}`}
                        </span>
                      </div>
                      {ann.expiresAt && (
                        <div
                          className={`flex items-center gap-1 ${
                            isExpired ? 'text-destructive font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Expires: {formatDate(ann.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isDraft ? (
                      <Badge variant="warning" size="sm">
                        DRAFT
                      </Badge>
                    ) : isArchived ? (
                      <Badge variant="destructive" size="sm">
                        ARCHIVED
                      </Badge>
                    ) : isExpired ? (
                      <Badge variant="secondary" size="sm">
                        EXPIRED
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        PUBLISHED
                      </Badge>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/app/announcements/${ann.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View Announcement"
                          aria-label={`View announcement ${ann.title}`}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>

                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(ann)}
                          title="Edit Draft"
                          aria-label={`Edit announcement ${ann.title}`}
                          className="h-7 px-2 text-xs border-border"
                        >
                          <FileEdit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                      )}

                      {isDraft && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onPublish(ann)}
                          disabled={publishingId === ann.id}
                          title="Publish Announcement"
                          aria-label={`Publish announcement ${ann.title}`}
                          className="h-7 px-2.5 text-xs bg-teal-600 hover:bg-teal-700"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          {publishingId === ann.id ? '...' : 'Publish'}
                        </Button>
                      )}

                      {!isArchived && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onArchive(ann)}
                          disabled={archivingId === ann.id}
                          title="Archive Announcement"
                          aria-label={`Archive announcement ${ann.title}`}
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

export default AnnouncementManagementTable;
