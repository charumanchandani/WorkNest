import React, { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal, Button, Input, Textarea, Select, Alert } from '../ui';
import { formatBytes } from '../../utils/formatters';

const ALLOWED_EXTENSIONS_STR = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const DocumentUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
  departments = [],
}) => {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('POLICY');
  const [visibility, setVisibility] = useState('ORGANIZATION');
  const [department, setDepartment] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('POLICY');
    setVisibility('ORGANIZATION');
    setDepartment('');
    setExpiresAt('');
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      setError(`File is too large (${formatBytes(file.size)}). Maximum allowed size is 10 MB.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);

    // Auto-fill title if empty
    if (!title.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || title.trim().length < 3) {
      setError('Please provide a document title (minimum 3 characters).');
      return;
    }

    if (!selectedFile) {
      setError('Please select a valid document file to upload.');
      return;
    }

    if (visibility === 'DEPARTMENT' && !department) {
      setError('Please select a target department.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('visibility', visibility);
      if (visibility === 'DEPARTMENT') {
        formData.append('department', department);
      }
      if (expiresAt) {
        formData.append('expiresAt', expiresAt);
      }
      formData.append('file', selectedFile);

      await onSuccess(formData);
      handleClose();
    } catch (err) {
      setError(err.formattedMessage || err.message || 'Failed to upload document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Organization Document"
      description="Publish policies, guides, forms, or departmental materials to the Document Vault."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="text-xs">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </Alert>
        )}

        {/* Title */}
        <Input
          label="Document Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Employee Handbook 2026"
          disabled={isSubmitting}
        />

        {/* Description */}
        <Textarea
          label="Description / Summary (Optional)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of document contents and applicability..."
          disabled={isSubmitting}
        />

        {/* Category & Visibility Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
            options={[
              { value: 'POLICY', label: 'Company Policy' },
              { value: 'HR', label: 'HR & Benefits' },
              { value: 'GUIDELINE', label: 'Operational Guidelines' },
              { value: 'FORM', label: 'Forms & Templates' },
              { value: 'TRAINING', label: 'Training Materials' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />

          <Select
            label="Visibility Scope"
            value={visibility}
            onChange={(e) => {
              setVisibility(e.target.value);
              if (e.target.value === 'ORGANIZATION') setDepartment('');
            }}
            disabled={isSubmitting}
            options={[
              { value: 'ORGANIZATION', label: 'Organization-wide (All Staff)' },
              { value: 'DEPARTMENT', label: 'Department-Specific Only' },
            ]}
          />
        </div>

        {/* Department (shown when DEPARTMENT visibility is selected) & Expiry Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibility === 'DEPARTMENT' ? (
            <Select
              label="Target Department"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isSubmitting}
              options={[
                { value: '', label: 'Select Active Department...' },
                ...departments.map((d) => ({
                  value: d.id,
                  label: `${d.name} (${d.code})`,
                })),
              ]}
            />
          ) : (
            <div className="text-xs text-muted-foreground p-3 rounded-lg bg-secondary/50 border border-border/60 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Visible to all active company personnel.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* File Drop / Upload Section */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Document File <span className="text-destructive">*</span>
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              selectedFile
                ? 'border-teal-500/60 bg-teal-50/40 dark:bg-teal-950/20'
                : 'border-border hover:border-teal-500/40 bg-secondary/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS_STR}
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-semibold text-foreground block truncate max-w-[280px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatBytes(selectedFile.size)} • {selectedFile.type || 'Document'}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                <span className="text-xs font-medium text-foreground block">
                  Click to browse or choose a file
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  PDF, Word (DOC, DOCX), Excel (XLS, XLSX), PPT, TXT, PNG, JPG (Max 10 MB)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting || !selectedFile || !title.trim()}
          >
            {isSubmitting ? (
              <>
                <Upload className="w-3.5 h-3.5 mr-1.5 animate-bounce" />
                Uploading File...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DocumentUploadModal;
