import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { Button, Alert } from '../ui';
import profileService from '../../services/profileService';

export const PasswordChangeForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Password validation rules
  const hasMinLength = formData.newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.newPassword);
  const hasLowercase = /[a-z]/.test(formData.newPassword);
  const hasNumber = /[0-9]/.test(formData.newPassword);
  const isMatch = Boolean(
    formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword === formData.confirmPassword
  );

  const isFormValid =
    Boolean(formData.currentPassword) &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    isMatch;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await profileService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage(res?.data?.message || 'Password changed successfully.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setErrorMessage(err.formattedMessage || 'Failed to change password. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-card border border-border shadow-subtle space-y-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <KeyRound className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        <div>
          <h3 className="text-sm font-bold text-foreground">Change Password</h3>
          <p className="text-xs text-muted-foreground">
            Update your account password with standard production security requirements.
          </p>
        </div>
      </div>

      {successMessage && (
        <Alert variant="success" onDismiss={() => setSuccessMessage('')}>
          <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
          <span>{successMessage}</span>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" onDismiss={() => setErrorMessage('')}>
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{errorMessage}</span>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label htmlFor="current-password-input" className="text-xs font-semibold text-foreground">
            Current Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="current-password-input"
              type={showCurrent ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              placeholder="Enter your current password"
              required
              disabled={isSubmitting}
              className="w-full text-xs px-3 py-2 pr-10 rounded-lg border border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="new-password-input" className="text-xs font-semibold text-foreground">
            New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="new-password-input"
              type={showNew ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              placeholder="Enter a strong new password"
              required
              disabled={isSubmitting}
              className="w-full text-xs px-3 py-2 pr-10 rounded-lg border border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              aria-label={showNew ? 'Hide new password' : 'Show new password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirm-password-input" className="text-xs font-semibold text-foreground">
            Confirm New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirm-password-input"
              type={showConfirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Re-enter your new password"
              required
              disabled={isSubmitting}
              className="w-full text-xs px-3 py-2 pr-10 rounded-lg border border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Password Policy Checklist */}
      <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
        <span className="text-[11px] font-bold text-foreground block">
          Password Policy Checklist
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {hasMinLength ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className={hasMinLength ? 'text-foreground' : 'text-muted-foreground'}>
              At least 8 characters
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasUppercase ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className={hasUppercase ? 'text-foreground' : 'text-muted-foreground'}>
              Uppercase letter (A-Z)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasLowercase ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className={hasLowercase ? 'text-foreground' : 'text-muted-foreground'}>
              Lowercase letter (a-z)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasNumber ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className={hasNumber ? 'text-foreground' : 'text-muted-foreground'}>
              At least one number (0-9)
            </span>
          </div>

          {formData.confirmPassword && (
            <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
              {isMatch ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
              <span className={isMatch ? 'text-foreground font-semibold' : 'text-rose-500 font-semibold'}>
                {isMatch ? 'Passwords match' : 'Passwords do not match'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting || !isFormValid}
          className="text-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
          Update Password
        </Button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;
