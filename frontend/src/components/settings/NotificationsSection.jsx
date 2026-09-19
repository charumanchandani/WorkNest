import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckSquare,
  Calendar,
  Megaphone,
  FileText,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button, Alert, Spinner } from '../ui';
import profileService from '../../services/profileService';

export const NotificationsSection = () => {
  const [preferences, setPreferences] = useState({
    taskAssignments: true,
    taskUpdates: true,
    leaveUpdates: true,
    announcements: true,
    documents: true,
    system: true,
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const res = await profileService.getPreferences();
        if (res?.data?.data?.preferences) {
          setPreferences(res.data.data.preferences);
        }
      } catch (err) {
        setErrorMessage(err.formattedMessage || 'Failed to load notification preferences.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');
      const res = await profileService.updatePreferences(preferences);
      if (res?.data?.data?.preferences) {
        setPreferences(res.data.data.preferences);
        setSuccessMessage('Notification preferences saved successfully.');
      }
    } catch (err) {
      setErrorMessage(err.formattedMessage || 'Failed to update notification preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const preferenceItems = [
    {
      key: 'taskAssignments',
      title: 'Task Assignments',
      description: 'Receive notifications when new tasks or workload items are assigned to you.',
      icon: CheckSquare,
    },
    {
      key: 'taskUpdates',
      title: 'Task Progress & Completions',
      description: 'Receive alerts when assigned tasks change status or reach completion.',
      icon: CheckSquare,
    },
    {
      key: 'leaveUpdates',
      title: 'Leave & Time-off Updates',
      description: 'Receive notifications when leave requests are submitted, approved, or rejected.',
      icon: Calendar,
    },
    {
      key: 'announcements',
      title: 'Company & Department Announcements',
      description: 'Get notified immediately when new organizational announcements are broadcast.',
      icon: Megaphone,
    },
    {
      key: 'documents',
      title: 'Document Vault Additions',
      description: 'Receive alerts when new policies, compliance forms, or manuals are uploaded.',
      icon: FileText,
    },
    {
      key: 'system',
      title: 'System & Attendance Reminders',
      description: 'Get operational alerts such as daily attendance check-in reminders.',
      icon: Clock,
    },
  ];

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <Spinner size="md" />
        <p className="text-xs text-muted-foreground">Loading notification preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">In-App Notification Preferences</h2>
          <p className="text-xs text-muted-foreground">
            Control which operational events trigger alerts in your in-app notification center.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={isSaving}
          className="text-xs shrink-0"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save Preferences
        </Button>
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

      {/* Preferences List */}
      <div className="p-2 sm:p-4 rounded-2xl bg-card border border-border shadow-subtle divide-y divide-border">
        {preferenceItems.map((item) => {
          const Icon = item.icon;
          const isEnabled = preferences[item.key] !== false;

          return (
            <div
              key={item.key}
              className="py-4 px-2 sm:px-3 flex items-start justify-between gap-4 transition-colors hover:bg-secondary/20 rounded-xl"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isEnabled
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-0.5">
                  <label
                    htmlFor={`pref-toggle-${item.key}`}
                    className="text-xs sm:text-sm font-bold text-foreground block cursor-pointer"
                  >
                    {item.title}
                  </label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Accessible Toggle Switch */}
              <button
                type="button"
                id={`pref-toggle-${item.key}`}
                role="switch"
                aria-checked={isEnabled}
                onClick={() => handleToggle(item.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className="sr-only">Toggle {item.title}</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsSection;
