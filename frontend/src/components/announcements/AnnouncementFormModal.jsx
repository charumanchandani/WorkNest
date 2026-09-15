import React, { useState, useEffect } from 'react';
import { Send, FileEdit, AlertCircle, CheckCircle2, Globe, Building } from 'lucide-react';
import { Modal, Button, Input, Textarea, Select, Alert } from '../ui';

export const AnnouncementFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  departments = [],
  userRole = 'EMPLOYEE',
}) => {
  const isManager = userRole === 'MANAGER';
  const isAdmin = userRole === 'ADMIN';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState(isManager ? 'DEPARTMENT' : 'ORGANIZATION');
  const [department, setDepartment] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setTargetType(initialData.targetType || (isManager ? 'DEPARTMENT' : 'ORGANIZATION'));
      setDepartment(initialData.department?.id || initialData.department || '');
      setExpiresAt(initialData.expiresAt ? initialData.expiresAt.split('T')[0] : '');
    } else {
      setTitle('');
      setContent('');
      setTargetType(isManager ? 'DEPARTMENT' : 'ORGANIZATION');
      setDepartment(departments.length === 1 ? departments[0].id : '');
      setExpiresAt('');
    }
    setError('');
  }, [initialData, isOpen, isManager, departments]);

  const handleClose = () => {
    if (isSubmitting) return;
    setError('');
    onClose();
  };

  const handleFormSubmit = async (status) => {
    setError('');

    if (!title.trim() || title.trim().length < 3) {
      setError('Please provide an announcement title (minimum 3 characters).');
      return;
    }

    if (!content.trim() || content.trim().length < 5) {
      setError('Please enter announcement content (minimum 5 characters).');
      return;
    }

    if (targetType === 'DEPARTMENT' && !department) {
      setError('Please select a target department for this announcement.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: title.trim(),
        content: content.trim(),
        targetType,
        department: targetType === 'DEPARTMENT' ? department : null,
        expiresAt: expiresAt || null,
        status,
      };

      await onSubmit(payload);
      handleClose();
    } catch (err) {
      setError(err.formattedMessage || err.message || 'Failed to save announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Edit Announcement' : 'Create Company Announcement'}
      description="Broadcast organization news, workplace updates, or team bulletins."
      size="lg"
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="text-xs">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </Alert>
        )}

        {/* Title */}
        <Input
          label="Announcement Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q4 Company All-Hands Schedule"
          disabled={isSubmitting}
        />

        {/* Target Type & Department Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isAdmin ? (
            <Select
              label="Target Audience"
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                if (e.target.value === 'ORGANIZATION') setDepartment('');
              }}
              disabled={isSubmitting}
              options={[
                { value: 'ORGANIZATION', label: 'Organization-wide (All Employees)' },
                { value: 'DEPARTMENT', label: 'Department-Specific Only' },
              ]}
            />
          ) : (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Target Audience
              </label>
              <div className="px-3 py-2 text-xs rounded-lg border border-input bg-secondary/50 text-foreground flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Department Staff Only</span>
              </div>
            </div>
          )}

          {targetType === 'DEPARTMENT' ? (
            <Select
              label="Target Department"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isSubmitting}
              options={[
                { value: '', label: 'Select Target Department...' },
                ...departments.map((d) => ({
                  value: d.id,
                  label: `${d.name} (${d.code})`,
                })),
              ]}
            />
          ) : (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Distribution Scope
              </label>
              <div className="px-3 py-2 text-xs rounded-lg border border-input bg-secondary/50 text-foreground flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Broadcast to all active team members</span>
              </div>
            </div>
          )}
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Expiration Date (Optional)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            disabled={isSubmitting}
            className="w-full sm:w-1/2 px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-[11px] text-muted-foreground block mt-1">
            Announcements are automatically hidden from staff feeds once expired.
          </span>
        </div>

        {/* Content (Plain text only) */}
        <Textarea
          label="Announcement Content"
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter plain text notice or broadcast details..."
          disabled={isSubmitting}
        />

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFormSubmit('DRAFT')}
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="text-xs border-border"
            >
              <FileEdit className="w-3.5 h-3.5 mr-1" />
              Save as Draft
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleFormSubmit('PUBLISHED')}
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AnnouncementFormModal;
