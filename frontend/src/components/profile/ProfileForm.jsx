import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Mail,
  Building2,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button, Input, Alert } from '../ui';
import profileService from '../../services/profileService';
import { useAuth } from '../../hooks';

const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{4,25}$/;

export const ProfileForm = ({ profile, onProfileUpdated }) => {
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        location: profile.location || '',
      });
      setFieldErrors({});
      setSuccessMessage('');
      setErrorMessage('');
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const validate = () => {
    const errors = {};
    if (formData.firstName && formData.firstName.length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters.';
    }
    if (formData.lastName && formData.lastName.length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters.';
    }
    if (formData.location && formData.location.length > 100) {
      errors.location = 'Location cannot exceed 100 characters.';
    }
    if (formData.phone && formData.phone.trim()) {
      if (formData.phone.length > 30) {
        errors.phone = 'Phone number cannot exceed 30 characters.';
      } else if (!PHONE_REGEX.test(formData.phone.trim())) {
        errors.phone = 'Please enter a valid phone number (e.g. +1 555-123-4567, +91 9876543210).';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        location: profile.location || '',
      });
      setFieldErrors({});
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await profileService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
      });

      if (res?.data?.data?.profile) {
        const updated = res.data.data.profile;
        setSuccessMessage('Profile details saved successfully.');
        if (updateUser) {
          updateUser(updated);
        }
        if (onProfileUpdated) {
          onProfileUpdated(updated);
        }
      }
    } catch (err) {
      setErrorMessage(err.formattedMessage || 'Failed to update profile details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card border border-border shadow-subtle space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Personal Information
          </h2>
          <p className="text-xs text-muted-foreground">
            Update your personal contact details and display preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSubmitting}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Changes
          </Button>
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
          <ShieldAlert className="w-4 h-4 mr-2 shrink-0" />
          <span>{errorMessage}</span>
        </Alert>
      )}

      {/* Editable Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-1.5">
          <label htmlFor="profile-first-name" className="text-xs font-semibold text-foreground">
            First Name
          </label>
          <Input
            id="profile-first-name"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="e.g. Jane"
            maxLength={50}
            disabled={isSubmitting}
            error={fieldErrors.firstName}
            className="text-xs"
          />
          {fieldErrors.firstName && (
            <p className="text-[11px] text-destructive">{fieldErrors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-1.5">
          <label htmlFor="profile-last-name" className="text-xs font-semibold text-foreground">
            Last Name
          </label>
          <Input
            id="profile-last-name"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="e.g. Doe"
            maxLength={50}
            disabled={isSubmitting}
            error={fieldErrors.lastName}
            className="text-xs"
          />
          {fieldErrors.lastName && (
            <p className="text-[11px] text-destructive">{fieldErrors.lastName}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="profile-phone" className="text-xs font-semibold text-foreground">
            Phone Number
          </label>
          <Input
            id="profile-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="e.g. +1 555-019-2834"
            maxLength={30}
            disabled={isSubmitting}
            error={fieldErrors.phone}
            className="text-xs"
          />
          {fieldErrors.phone ? (
            <p className="text-[11px] text-destructive">{fieldErrors.phone}</p>
          ) : (
            <p className="text-[10px] text-muted-foreground">International format supported</p>
          )}
        </div>

        {/* Location / Office */}
        <div className="space-y-1.5">
          <label htmlFor="profile-location" className="text-xs font-semibold text-foreground">
            Workplace Location
          </label>
          <Input
            id="profile-location"
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g. New York, USA or Remote"
            maxLength={100}
            disabled={isSubmitting}
            error={fieldErrors.location}
            className="text-xs"
          />
          {fieldErrors.location && (
            <p className="text-[11px] text-destructive">{fieldErrors.location}</p>
          )}
        </div>
      </div>

      {/* Read-Only Information Notice & Grid */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/30 border border-border/60 text-xs text-muted-foreground">
          <ShieldAlert className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <span>
            Organizational attributes (Role, Department, Employee ID, Work Email, Account Status) are managed by WorkNest administrators and cannot be self-edited.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Work Email */}
          <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Work Email
            </span>
            <span className="font-semibold text-foreground block truncate">{profile?.email}</span>
            <span className="text-[10px] text-muted-foreground">Primary sign-in identity</span>
          </div>

          {/* Employee ID */}
          <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" />
              Employee ID
            </span>
            <span className="font-mono font-semibold text-foreground block">{profile?.employeeId}</span>
            <span className="text-[10px] text-muted-foreground">Official roster ID</span>
          </div>

          {/* Department */}
          <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Department
            </span>
            <span className="font-semibold text-foreground block">
              {profile?.department?.name || 'All Organization'}
            </span>
            <span className="text-[10px] text-muted-foreground">Managed team allocation</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
